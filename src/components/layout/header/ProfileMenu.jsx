import Image from "next/image";

export default function ProfileMenu({
  name = "User",
  role = "",
  avatar,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        items-center
        gap-3
        rounded-lg
        px-2
        py-2
        transition-colors
        hover:bg-gray-100
      "
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-gray-300
            text-sm
            font-semibold
          "
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="hidden text-left md:block">
        <div className="font-semibold">{name}</div>

        {role && <div className="text-sm text-gray-500">{role}</div>}
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
