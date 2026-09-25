import { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSend, disabled, conversationId }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled, conversationId]);

  function handleSubmit() {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="message-input">
      <input
        ref={inputRef}
        className="message-input-field"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Type a message..."
        aria-label="Message"
        disabled={disabled}
      />
      <button className="send-button" onClick={handleSubmit} disabled={disabled || !text.trim()}>
        Send
      </button>
    </div>
  );
}
