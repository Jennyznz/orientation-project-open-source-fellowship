import { useEffect, useState } from "react";

import {
  createConversation,
  getConversation,
  listConversations,
  sendMessage,
} from "./api/client.js";
import MessageInput from "./components/MessageInput.jsx";
import MessageList from "./components/MessageList.jsx";
import Sidebar from "./components/Sidebar.jsx";

import "./app.css";

const initialState = {
  conversationId: null,
  messages: [],
  loading: false,
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
  const [conversations, setConversations] = useState([]);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    async function fetchConversations() {
      const data = await listConversations();
      setConversations(data.items);
    }
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

  async function createNewConversation() {
    const newConversation = await createConversation("New Conversation");
    setConversationState(() => ({
      ...initialState,
      conversationId: newConversation.id,
    }));
    setConversations((prev) => [
      { id: newConversation.id, title: newConversation.title },
      ...prev,
    ]);
    return newConversation;
  }

  async function handleSend(text) {
    let currentConversationId = conversationState.conversationId;

    if (!conversationState.conversationId) {
      const newConversation = await createNewConversation();
      currentConversationId = newConversation.id;
    }

    setConversationState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: "user", content: text }],
      loading: true,
    }));

    await sendMessage(currentConversationId, text);

    const full = await getConversation(currentConversationId);
    setConversationState((prev) => ({
      ...prev,
      messages: full.messages,
      loading: false,
    }));
  }

  async function handleSelectConversation(id) {
    const conversation = await getConversation(id);

    if (conversation.detail) {
      alert("Error fetching conversation: " + conversation.detail);
      return;
    }

    setConversationState(() => ({
      ...initialState,
      conversationId: conversation.id,
      messages: conversation.messages,
    }));
  }

  async function handleNewConversation() {
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
          <Sidebar
            conversations={conversations}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={conversationState.conversationId}
          />
        </aside>
        <main>
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
