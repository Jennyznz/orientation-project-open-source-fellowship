import ConversationHistory from "./ConversationHistory";
import NewConversationButton from "./NewConversationButton";

export default function Sidebar({
  conversations,
  onSelectConversation,
  onNewConversation,
  selectedConversationId,
  onLoadMore,
  canLoadMore,
  loadingMore,
}) {
  return (
    <div id="sidebar">
      <NewConversationButton onClick={onNewConversation} />
      <ConversationHistory
        conversations={conversations}
        onSelectConversation={onSelectConversation}
        selectedConversationId={selectedConversationId}
        onLoadMore={onLoadMore}
        canLoadMore={canLoadMore}
        loadingMore={loadingMore}
      />
    </div>
  );
}
