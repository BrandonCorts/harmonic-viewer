export function HarmonicLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" fill="#000" />
        <path
          d="M7 8.5C7 8.22386 7.22386 8 7.5 8H9.5C9.77614 8 10 8.22386 10 8.5V15.5C10 15.7761 9.77614 16 9.5 16H7.5C7.22386 16 7 15.7761 7 15.5V8.5Z"
          fill="white"
        />
        <path d="M11 11H13V13H11V11Z" fill="white" />
        <path
          d="M14 8.5C14 8.22386 14.2239 8 14.5 8H16.5C16.7761 8 17 8.22386 17 8.5V15.5C17 15.7761 16.7761 16 16.5 16H14.5C14.2239 16 14 15.7761 14 15.5V8.5Z"
          fill="white"
        />
      </svg>
      <span className="shell-label" style={{ fontSize: "13px", letterSpacing: "0.08em", color: "#000" }}>
        NEWLAB
      </span>
    </div>
  );
}
