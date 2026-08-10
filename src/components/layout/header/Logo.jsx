import Link from "next/link";
import Image from "next/image";

export default function Logo({
  href = "/",
  src,
  alt = "Company Logo",
  imageWidth = 180,
  imageHeight = 50,
}) {
  return (
    <Link
      href={href}
      className="
        inline-flex
        items-center
        rounded-lg
        px-2
        py-2
        transition-colors
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
    </Link>
  );
}
