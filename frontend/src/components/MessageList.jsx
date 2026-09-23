import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);

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
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
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
