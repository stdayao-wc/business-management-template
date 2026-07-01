export default function HamburgerButton({ onClick, size = 28 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Toggle Sidebar"
      className="
        flex
        items-center
        justify-center
        rounded-lg
        p-2
        transition-colors
        hover:bg-gray-100
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
