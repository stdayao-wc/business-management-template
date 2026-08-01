import LogoutButton from "@/components/auth/LogoutButton";
import DashboardActivityCard from "@/components/dashboard/DashboardActivityCard";
import DashboardChartCard from "@/components/dashboard/DashboardChartCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSection from "@/components/dashboard/DashboardSection";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import DashboardStatsGrid from "@/components/dashboard/DashboardStatsGrid";

import SalesChart from "@/components/dashboard/SalesChart";

export default function Home() {
    return (
        <>
            <DashboardHeader
                title="Dashboard"
                subtitle="Welcome back! Here's an overview of your business."
            />

            {/* Statistics */}
            <DashboardSection>
                <DashboardStatsGrid>
                    <DashboardStatCard
                        title="Products"
                        value="328"
                        subtitle="+12 added this month"
                    />

                    <DashboardStatCard
                        title="Orders Today"
                        value="82"
                        subtitle="+8 since yesterday"
                    />

                    <DashboardStatCard
                        title="Revenue"
                        value="₱125,430"
                        subtitle="+15% from last month"
                    />

                    <DashboardStatCard
                        title="Customers"
                        value="1,240"
                        subtitle="+42 new customers"
                    />
                </DashboardStatsGrid>
            </DashboardSection>

            {/* Sales Chart + Activity */}
            <DashboardSection>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                    <div className="xl:col-span-2">
                        <DashboardChartCard title="Monthly Sales">
                            <SalesChart />
                        </DashboardChartCard>
                    </div>

                    <DashboardActivityCard title="Recent Activity">
                        <div className="space-y-5 text-sm">

                            <div className="border-b pb-3">
                                <p className="font-semibold">
                                    John added Fujima NG-45
                                </p>
                                <p className="text-gray-500">
                                    Inventory • 5 minutes ago
                                </p>
                            </div>

                            <div className="border-b pb-3">
                                <p className="font-semibold">
                                    Mary updated Hoyoma Japan GX35
                                </p>
                                <p className="text-gray-500">
                                    Inventory • 18 minutes ago
                                </p>
                            </div>

                            <div className="border-b pb-3">
                                <p className="font-semibold">
                                    Purchase Order #421 created
                                </p>
                                <p className="text-gray-500">
                                    Purchasing • 1 hour ago
                                </p>
                            </div>

                            <div className="border-b pb-3">
                                <p className="font-semibold">
                                    Invoice #1034 paid
                                </p>
                                <p className="text-gray-500">
                                    Finance • 2 hours ago
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold">
                                    New customer registered
                                </p>
                                <p className="text-gray-500">
                                    Customer Management • Today
                                </p>
                            </div>

                        </div>
                    </DashboardActivityCard>

                </div>
                <LogoutButton />
            </DashboardSection>
        </>
    );
}