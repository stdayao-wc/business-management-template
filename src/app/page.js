import DashboardActivityCard from "@/components/dashboard/DashboardActivityCard";
import DashboardChartCard from "@/components/dashboard/DashboardChartCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSection from "@/components/dashboard/DashboardSection";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import DashboardStatsGrid from "@/components/dashboard/DashboardStatsGrid";

export default function Home() {
  return (
    <>
      <DashboardHeader
        title="Dashboard"
        subtitle="Welcome back."
      />

      <DashboardSection>
        <DashboardStatsGrid>
          <DashboardStatCard
            title="Products"
            value="328"
            subtitle="+12 this month"
          />

          <DashboardStatCard
            title="Orders"
            value="82"
            subtitle="+8 today"
          />

          <DashboardStatCard
            title="Revenue"
            value="₱125,430"
            subtitle="+15%"
          />

          <DashboardStatCard
            title="Customers"
            value="1,240"
            subtitle="+42"
          />
        </DashboardStatsGrid>
      </DashboardSection>

      <DashboardSection>
        <DashboardChartCard title="Monthly Sales">
          <div className="flex h-72 items-center justify-center rounded-lg bg-gray-100">
            Chart Placeholder
          </div>
        </DashboardChartCard>
      </DashboardSection>

      <DashboardSection>
        <DashboardActivityCard title="Recent Activity">
          <div className="space-y-3">
            <p>John added Coca-Cola 1.5L</p>
            <p>Mary updated Coffee Beans</p>
            <p>Purchase Order #421 was created</p>
          </div>
        </DashboardActivityCard>
      </DashboardSection>
    </>
  );
}