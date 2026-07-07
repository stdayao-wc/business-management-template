import Image from "next/image";

export default function ItemCard({
  image,
  name,
  code,
  description,
  status,
  children,
}) {
  return (
    <div
      className="
        flex
        flex-col
        rounded-xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        transition-shadow
        hover:shadow-md
      "
    >
      <div className="relative mb-5 h-48 w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-col items-center text-center flex-grow">
        <h2 className="text-xl font-semibold">
          {name}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {code}
        </p>

        <p className="mt-4 text-gray-600">
          {description}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          {status}

          {children}
        </div>
      </div>
    </div>
  );
}