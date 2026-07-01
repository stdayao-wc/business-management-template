export default function Notifications({ count = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Notifications"
      className="
        relative
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        transition-colors
        hover:bg-gray-100
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
        />
      </svg>

      {count > 0 && (
        <span
          className="
            absolute
            -right-1
            -top-1
            flex
            h-5
            min-w-5
            items-center
            justify-center
            rounded-full
            bg-red-500
            px-1
            text-xs
            font-semibold
            text-white
          "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
