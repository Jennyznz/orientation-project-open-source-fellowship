export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner">
      <span>{message}</span>
      <button className="error-banner-retry" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
