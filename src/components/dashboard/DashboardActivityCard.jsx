import DashboardCard from "./DashboardCard";

export default function DashboardActivityCard({ title, children }) {
  return (
    <DashboardCard>
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>

      {children}
    </DashboardCard>
  );
}
