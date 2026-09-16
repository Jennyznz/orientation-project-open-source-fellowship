export default function ConversationHistoryItem({
  id,
  title,
  onSelectConversation,
}) {
  return (
    <li key={id}>
      <button type="button" onClick={() => onSelectConversation(id)}>
        {title}
      </button>
    </li>
  );
}
