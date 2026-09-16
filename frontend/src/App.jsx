import { useEffect, useState } from "react";

import {
  createConversation,
  getConversation,
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
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createNewConversation();
  }, []);

  async function createNewConversation() {
    const newConversation = await createConversation("New Conversation");
    setConversationId(newConversation.id);
    setMessages([]);
  }

  async function handleSend(text) {
    if (!conversationId) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    await sendMessage(conversationId, text);
    const full = await getConversation(conversationId);
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

  return (
    <>
      <div className="app-container">
        <aside>
          <Sidebar
            onNewConversation={createNewConversation}
            onSelectConversation={handleSelectConversation}
          />
        </aside>
        <main>
          <h1>MLH LLM Fellowship Project</h1>
          <MessageList messages={messages} loading={loading} />
          <MessageInput onSend={handleSend} disabled={loading} />
        </main>
      </div>
    </>
  );
}
