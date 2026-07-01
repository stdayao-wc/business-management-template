import Link from "next/link";
import Image from "next/image";

export default function Logo({
  href = "/",
  src,
  alt = "Company Logo",
  title = "Company",
  imageWidth = 40,
  imageHeight = 40,
}) {
  return (
    <Link
      href={href}
      className="
        inline-flex
        items-center
        gap-3
        rounded-lg
        px-2
        py-2
        transition-colors
        hover:bg-gray-100
      "
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          width={imageWidth}
          height={imageHeight}
          priority
        />
      )}

      <span className="text-xl font-bold whitespace-nowrap">{title}</span>
    </Link>
  );
}
