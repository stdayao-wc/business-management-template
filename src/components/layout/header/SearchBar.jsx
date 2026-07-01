"use client";

import { useState } from "react";

export default function SearchBar({ placeholder = "Search...", onSearch }) {
  const [value, setValue] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    } else {
      console.log("Search:", value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="
          w-full
          rounded-full
          border
          border-gray-300
          bg-white
          py-3
          pl-5
          pr-12
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
        "
      />

      <button
        type="button"
        onClick={handleSearch}
        className="
          absolute
          inset-y-0
          right-4
          flex
          items-center
          text-gray-400
          hover:text-gray-600
          transition-colors
        "
        aria-label="Search"
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
      </button>
    </div>
  );
}
