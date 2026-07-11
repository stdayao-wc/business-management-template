export default function DashboardHeader({ title, subtitle }) {
  return (
    <header>
      <h1 className="text-4xl font-bold">{title}</h1>

      {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
    </header>
  );
}
