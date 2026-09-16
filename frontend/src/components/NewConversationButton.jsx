export default function NewConversationButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        cursor: "pointer",
      }}
    >
      New Conversation
    </button>
  );
}
