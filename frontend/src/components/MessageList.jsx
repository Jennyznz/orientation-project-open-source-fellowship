export default function MessageList({ messages, loading }) {
  return (
    <div id="message-list">
      {messages.length === 0 && (
        <p className="muted-text">Say hello to start the conversation.</p>
      )}
      {messages.map((m) => (
        <div key={m.id} className="message-item">
          <strong>{m.role === "user" ? "You" : "Assistant"}:</strong>{" "}
          {m.content}
        </div>
      ))}
      {loading && (
        <div className="message-item muted-text">
          <strong>Assistant:</strong> <span className="thinking-text">Thinking...</span>
        </div>
      )}
    </div>
  );
}
