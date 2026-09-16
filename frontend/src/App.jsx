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

// Barebones single-conversation UI. There's no sidebar, no conversation
// switching, no streaming yet -- those are fellow issues (see ISSUES.md).
export default function App() {
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchConversations() {
      const data = await listConversations();
      setConversations(data.items);
    }
    fetchConversations();
  }, []);

  async function createNewConversation() {
    const newConversation = await createConversation("New Conversation");
    setConversationId(newConversation.id);
    setMessages([]);
    setConversations((prev) => [
      { id: newConversation.id, title: newConversation.title },
      ...prev,
    ]);
    return newConversation;
  }

  async function handleSend(text) {
    let currentConversationId = conversationId;

    if (!conversationId) {
      const newConversation = await createNewConversation();
      currentConversationId = newConversation.id;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    await sendMessage(currentConversationId, text);
    const full = await getConversation(currentConversationId);
    setMessages(full.messages);
    setLoading(false);
  }

  async function handleSelectConversation(id) {
    const conversation = await getConversation(id);

    if (conversation.detail) {
      alert("Error fetching conversation: " + conversation.detail);
      return;
    }

    setConversationId(conversation.id);
    setMessages(conversation.messages);
  }

  async function handleNewConversation() {
    setConversationId(null);
    setMessages([]);
  }

  return (
    <>
      <div id="app-container">
        <aside>
          <h1>MLH LLM Fellowship Project</h1>
          <Sidebar
            conversations={conversations}
            onNewConversation={handleNewConversation}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={conversationId}
          />
        </aside>
        <main>
          <MessageList messages={messages} loading={loading} />
          <MessageInput onSend={handleSend} disabled={loading} />
        </main>
      </div>
    </>
  );
}
