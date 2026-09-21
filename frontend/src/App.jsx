import { useEffect, useRef, useState } from "react";

import {
  createConversation,
  getConversation,
  listConversations,
  streamMessage,
} from "./api/client.js";
import ErrorBanner from "./components/ErrorBanner.jsx";
import MessageInput from "./components/MessageInput.jsx";
import MessageList from "./components/MessageList.jsx";
import Sidebar from "./components/Sidebar.jsx";

import "./app.css";

const initialState = {
  conversationId: null,
  messages: [],
  loading: false,
  historyError: false,
};

function getInitialTheme() {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
  }
  return "light";
}

export default function App() {
  const activeRequestRef = useRef(null);
  const [conversationState, setConversationState] = useState(initialState);
  const [conversations, setConversations] = useState([]);
  const [theme, setTheme] = useState(getInitialTheme);
  const [conversationsError, setConversationsError] = useState(null);
  const [mainError, setMainError] = useState(null);

  useEffect(() => {
    fetchConversations();
    return () => {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
    };
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
    setConversationsError(null);
    try {
      const data = await listConversations();
      setConversations(data.items);
    } catch {
      setConversationsError("Couldn't load your conversations.");
    }
  }

  function startRequest() {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    return controller;
  }

  async function handleSend(text) {
    if (activeRequestRef.current || conversationState.loading || conversationState.historyError) return;
    const controller = startRequest();
    const isCurrent = () => activeRequestRef.current === controller;
    setMainError(null);
    let currentConversationId = conversationState.conversationId;
    const assistantId = `assistant-${Date.now()}`;
    const userId = `user-${Date.now()}`;
    setConversationState((prev) => ({
      ...prev,
      loading: true,
      messages: [
        ...prev.messages,
        { id: userId, role: "user", content: text },
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ],
    }));

    try {
      if (!currentConversationId) {
        const conversation = await createConversation("New Conversation");
        setConversations((prev) => [conversation, ...prev]);
        if (!isCurrent()) return;
        currentConversationId = conversation.id;
        setConversationState((prev) => ({ ...prev, conversationId: conversation.id }));
      }
      const message = await streamMessage(currentConversationId, text, {
        signal: controller.signal,
        onToken: (token) => {
          if (!isCurrent()) return;
          setConversationState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) => m.id === assistantId
              ? { ...m, content: m.content + token } : m),
          }));
        },
      });
      if (!isCurrent()) return;
      setConversationState((prev) => ({
        ...prev,
        loading: false,
        messages: prev.messages.map((m) => m.id === assistantId ? message : m),
      }));
    } catch (error) {
      if (!isCurrent()) return;
      setConversationState((prev) => ({
        ...prev,
        loading: false,
        messages: currentConversationId
          ? prev.messages.map((m) => m.id === assistantId
            ? { ...m, streaming: false, interrupted: true } : m)
          : prev.messages.filter((m) => m.id !== assistantId && m.id !== userId),
      }));
      // The server may already have saved the user message; do not resend it automatically.
      setMainError({
        message: error.message || "Could not receive the reply.",
        retry: currentConversationId ? undefined : () => handleSend(text),
      });
    } finally {
      if (isCurrent()) activeRequestRef.current = null;
    }
  }

  async function handleSelectConversation(id) {
    const controller = startRequest();
    setConversationState({ ...initialState, conversationId: id, loading: true });
    setMainError(null);
    try {
      const conversation = await getConversation(id);
      if (activeRequestRef.current !== controller) return;
      setConversationState(() => ({
        ...initialState,
        conversationId: conversation.id,
        messages: conversation.messages,
      }));
    } catch {
      if (activeRequestRef.current !== controller) return;
      setConversationState((prev) => ({ ...prev, loading: false, historyError: true }));
      setMainError({
        message: "Couldn't load that conversation.",
        retry: () => handleSelectConversation(id),
      });
    } finally {
      if (activeRequestRef.current === controller) activeRequestRef.current = null;
    }
  }

  async function handleNewConversation() {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
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
          {conversationsError && (
            <ErrorBanner message={conversationsError} onRetry={fetchConversations} />
          )}
          <Sidebar
            conversations={conversations}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={conversationState.conversationId}
          />
        </aside>
        <main>
          {mainError && (
            <ErrorBanner message={mainError.message} onRetry={mainError.retry} />
          )}
          <MessageList
            messages={conversationState.messages}
            loading={conversationState.loading}
          />
          <MessageInput
            onSend={handleSend}
            disabled={conversationState.loading || conversationState.historyError}
          />
        </main>
      </div>
    </>
  );
}
