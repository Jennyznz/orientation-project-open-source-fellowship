export default function ConversationHistoryItem({
  id,
  title,
  onSelectConversation,
}) {
  return (
    <div key={id} onClick={() => onSelectConversation(id)}>
      {title}
    </div>
  );
}
