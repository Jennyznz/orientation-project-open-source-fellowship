import ConversationHistory from "./ConversationHistory";
import NewConversationButton from "./NewConversationButton";

export default function Sidebar({ onSelectConversation, onNewConversation }) {
  return (
    <>
      <NewConversationButton onClick={onNewConversation} />
      <ConversationHistory onSelectConversation={onSelectConversation} />
    </>
  );
}
