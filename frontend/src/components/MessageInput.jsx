import { useRef, useState } from "react";
import Icon from "./Icon.jsx";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const dialogRef = useRef(null);

  function handleSubmit() {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="message-input">
      <button className="icon-button attachment-button" aria-label="Attach a file" onClick={() => dialogRef.current?.showModal()}><Icon name="attach" /></button>
      <dialog ref={dialogRef} className="coming-soon-dialog" aria-labelledby="attachment-title" onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current.close(); }}>
        <span className="dialog-icon"><Icon name="attach" /></span>
        <h2 id="attachment-title">Coming soon</h2>
        <p>File attachments are on the way.</p>
        <form method="dialog"><button className="send-button" autoFocus>Got it</button></form>
      </dialog>
      <input
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
