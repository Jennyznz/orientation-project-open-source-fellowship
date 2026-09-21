export default function ConversationHistoryItem({
  id,
  title,
  onSelectConversation,
  isSelected,
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelectConversation(id)}
        className={`${isSelected ? "selected" : ""}`}
      >
        {title}
      </button>
    </li>
  );
}
