import { useCallback, useEffect, useState } from "react";

import {
  createConversation,
  getConversation,
  listConversations,
  sendMessage,
} from "./api/client.js";
import ErrorBanner from "./components/ErrorBanner.jsx";
import MessageInput from "./components/MessageInput.jsx";
import MessageList from "./components/MessageList.jsx";
import Sidebar from "./components/Sidebar.jsx";

import "./app.css";

const CONVERSATIONS_PAGE_SIZE = 20;

const initialState = {
  conversationId: null,
  messages: [],
  loading: false,
};

const initialHistory = {
  items: [],
  total: 0,
  loadingMore: false,
  error: null,
};

function getInitialTheme() {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
  }
  return "light";
}

// Barebones single-conversation UI. There's no streaming yet -- those are fellow issues (see ISSUES.md).
export default function App() {
  const [conversationState, setConversationState] = useState(initialState);
  const [history, setHistory] = useState(initialHistory);
  const [theme, setTheme] = useState(getInitialTheme);
  const [mainError, setMainError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.debug("Unable to persist theme preference", e);
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  async function fetchConversations() {
    setHistory((prev) => ({ ...prev, error: null }));
    try {
      const data = await listConversations({
        limit: CONVERSATIONS_PAGE_SIZE,
        offset: 0,
      });
      setHistory((prev) => ({ ...prev, items: data.items, total: data.total }));
    } catch {
      setHistory((prev) => ({
        ...prev,
        error: "Couldn't load your conversations.",
      }));
    }
  }

  const loadedCount = history.items.length;
  const loadMoreConversations = useCallback(async () => {
    setHistory((prev) => ({ ...prev, loadingMore: true, error: null }));
    try {
      const data = await listConversations({
        limit: CONVERSATIONS_PAGE_SIZE,
        offset: loadedCount,
      });
      setHistory((prev) => {
        const seen = new Set(prev.items.map((c) => c.id));
        return {
          ...prev,
          items: [...prev.items, ...data.items.filter((c) => !seen.has(c.id))],
          total: data.total,
          loadingMore: false,
        };
      });
    } catch {
      setHistory((prev) => ({
        ...prev,
        loadingMore: false,
        error: "Couldn't load more conversations.",
      }));
    }
  }, [loadedCount]);

  const canLoadMoreConversations =
    loadedCount < history.total && !history.loadingMore && !history.error;

  async function createNewConversation() {
    const newConversation = await createConversation("New Conversation");
    setConversationState(() => ({
      ...initialState,
      conversationId: newConversation.id,
    }));
    setHistory((prev) => ({
      ...prev,
      items: [
        { id: newConversation.id, title: newConversation.title },
        ...prev.items,
      ],
      total: prev.total + 1,
    }));
    return newConversation;
  }

  async function handleSend(text) {
    setMainError(null);
    let currentConversationId = conversationState.conversationId;
    let tempId = null;

    try {
      if (!currentConversationId) {
        const newConversation = await createNewConversation();
        currentConversationId = newConversation.id;
      }

      tempId = `pending-${Date.now()}`;
      setConversationState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { id: tempId, role: "user", content: text },
        ],
        loading: true,
      }));

      await sendMessage(currentConversationId, text);
      const full = await getConversation(currentConversationId);
      setConversationState((prev) => ({
        ...prev,
        messages: full.messages,
        loading: false,
      }));
    } catch {
      setConversationState((prev) => ({
        ...prev,
        loading: false,
        messages: tempId
          ? prev.messages.filter((m) => m.id !== tempId)
          : prev.messages,
      }));
      setMainError({
        message: "Message failed to send.",
        retry: () => handleSend(text),
      });
    }
  }

  async function handleSelectConversation(id) {
    setMainError(null);
    try {
      const conversation = await getConversation(id);
      setConversationState(() => ({
        ...initialState,
        conversationId: conversation.id,
        messages: conversation.messages,
      }));
    } catch {
      setMainError({
        message: "Couldn't load that conversation.",
        retry: () => handleSelectConversation(id),
      });
    }
  }

  async function handleNewConversation() {
    setMainError(null);
    setConversationState(initialState);
  }

  return (
    <>
      <div id="app-container">
        <aside>
          <div id="sidebar-header">
            <h1>MLH LLM Fellowship Project</h1>
            <button id="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
          {history.error && (
            <ErrorBanner
              message={history.error}
              onRetry={
                loadedCount === 0 ? fetchConversations : loadMoreConversations
              }
            />
          )}
          <Sidebar
            conversations={history.items}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={conversationState.conversationId}
            onLoadMore={loadMoreConversations}
            canLoadMore={canLoadMoreConversations}
            loadingMore={history.loadingMore}
          />
        </aside>
        <main>
          {mainError && (
            <ErrorBanner
              message={mainError.message}
              onRetry={mainError.retry}
            />
          )}
          <MessageList
            messages={conversationState.messages}
            loading={conversationState.loading}
          />
          <MessageInput
            onSend={handleSend}
            disabled={conversationState.loading}
          />
        </main>
      </div>
    </>
  );
}
