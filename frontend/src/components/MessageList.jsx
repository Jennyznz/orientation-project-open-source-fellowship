import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MessageList({ messages, loading }) {
  return (
    <div id="message-list">
      {messages.length === 0 && (
        <p className="muted-text">Say hello to start the conversation.</p>
      )}
      {messages.map((m) => (
        <div key={m.id} className="message-item">
          <strong>{m.role === "user" ? "You" : "Assistant"}:</strong>{" "}

          {m.role === "assistant" ? (
            <div className="markdown-body" style={{ marginTop: "8px" }}>
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        style={dracula}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {m.content}
              </ReactMarkdown>
        </div>
      ) : (
        <span>{ m.content}</span>
      )}
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
