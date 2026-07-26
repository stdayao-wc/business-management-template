export default function ItemGrid({ children }) {
  return (
    <div className="flex justify-center">
      <div
        className="
          grid
          w-full
          max-w-5xl
          grid-cols-1
          gap-8
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {children}
      </div>
    </div>
  );
}
