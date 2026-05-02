export function MinecraftIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#4CAF50"/>
      <rect x="6" y="6" width="4" height="4" fill="#2E7D32"/>
      <rect x="14" y="6" width="4" height="4" fill="#2E7D32"/>
      <rect x="6" y="14" width="4" height="4" fill="#2E7D32"/>
      <rect x="14" y="14" width="4" height="4" fill="#2E7D32"/>
    </svg>
  );
}