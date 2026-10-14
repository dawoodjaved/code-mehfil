export function LoadingIndicator({
  className = "",
  size = 36,
  label = "Loading",
  tone = "brand",
}: {
  className?: string;
  size?: number;
  label?: string;
  /** `light` is for use on the red buttons. */
  tone?: "brand" | "light";
}) {
  const track = tone === "light" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)";
  const head = tone === "light" ? "#ffffff" : "#ff0033";

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <span
        className="animate-spin rounded-full border-2"
        style={{
          width: size,
          height: size,
          borderColor: track,
          borderTopColor: head,
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function LoadingScreen({
  className = "min-h-screen bg-background",
}: {
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoadingIndicator size={40} />
    </div>
  );
}
