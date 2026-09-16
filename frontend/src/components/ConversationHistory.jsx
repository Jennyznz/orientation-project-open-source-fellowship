import { useEffect, useState } from "react";
import { listConversations } from "../api/client.js";
import ConversationHistoryItem from "./ConversationHistoryItem.jsx";

export default function ConversationHistory({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    async function fetchConversations() {
      const data = await listConversations();
      setConversations(data);
    }
    fetchConversations();
  }, []);

  return (
    <div>
      {conversations.length === 0 && (
        <p style={{ color: "#888" }}>No conversations yet.</p>
      )}
      {conversations.map(({ id, title }) => (
        <ConversationHistoryItem
          key={id}
          id={id}
          title={title}
          onSelectConversation={onSelectConversation}
        />
      ))}
    </div>
  );
}
