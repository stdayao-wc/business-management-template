export default function DashboardSection({ children, className = "" }) {
  return (
    <section
      className={`
        mt-10
        ${className}
      `}
    >
      {children}
    </section>
  );
}
