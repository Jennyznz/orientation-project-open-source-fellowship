import ConversationHistoryItem from "./ConversationHistoryItem.jsx";

export default function ConversationHistory({
  conversations,
  onSelectConversation,
  selectedConversationId,
}) {
  return (
    <div className="conversation-history">
      <p>Conversation history</p>
      <ul>
        {conversations.length === 0 && (
          <p style={{ color: "#888" }}>No conversations yet.</p>
        )}
        {conversations.map(({ id, title }) => (
          <ConversationHistoryItem
            key={id}
            id={id}
            title={title}
            onSelectConversation={onSelectConversation}
            isSelected={id === selectedConversationId}
          />
        ))}
      </ul>
    </div>
  );
}
