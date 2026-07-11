import DashboardCard from "./DashboardCard";

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  children,
}) {
  return (
    <DashboardCard>
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className="mt-2 text-4xl font-bold">{value}</h2>

      {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}

      {children}
    </DashboardCard>
  );
}
