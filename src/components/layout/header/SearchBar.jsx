export default function SearchBar({
  value = "",
  placeholder = "Search...",
  onChange,
  onSearch,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Icon */}
      <div
        className="
          absolute
          inset-y-0
          left-4
          flex
          items-center
          pointer-events-none
          text-gray-400
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 20l-3.5-3.5"
          />
        </svg>
      </div>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="
          w-full
          rounded-full
          border
          border-gray-300
          bg-white
          py-3
          pl-12
          pr-5
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
        "
      />
    </div>
  );
}
