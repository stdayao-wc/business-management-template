"use client";

import { useEffect, useState } from "react";

import LogoutButton from "@/components/auth/LogoutButton";
import DashboardActivityCard from "@/components/dashboard/DashboardActivityCard";
import DashboardChartCard from "@/components/dashboard/DashboardChartCard";
import DashboardSection from "@/components/dashboard/DashboardSection";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import DashboardStatsGrid from "@/components/dashboard/DashboardStatsGrid";
import SalesChart from "@/components/dashboard/SalesChart";

import {
    getDashboardStats,
    getMonthlySales,
    getRecentActivity,
} from "@/services/dashboard";

function formatCurrency(value) {
    return `₱${Number(value ?? 0).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
}

function formatActivityDate(date) {
    return new Date(date).toLocaleString(
        "en-PH",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    );
}

export default function Home() {
    const [stats, setStats] = useState({
        products: 0,
        ordersToday: 0,
        revenue: 0,
    });

    const [monthlySales, setMonthlySales] =
        useState([]);

    const [recentActivity, setRecentActivity] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);

                const [
                    statsData,
                    monthlySalesData,
                    activityData,
                ] = await Promise.all([
                    getDashboardStats(),
                    getMonthlySales(),
                    getRecentActivity(),
                ]);

                setStats(statsData);
                setMonthlySales(
                    monthlySalesData
                );
                setRecentActivity(
                    activityData
                );
            } catch (error) {
                console.error(
                    "Failed to load dashboard:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    return (
        <>
            {/* Statistics */}

            <DashboardSection>
                <DashboardStatsGrid>
                    <DashboardStatCard
                        title="Products"
                        value={
                            loading
                                ? "..."
                                : stats.products.toLocaleString()
                        }
                    />

                    <DashboardStatCard
                        title="Orders Today"
                        value={
                            loading
                                ? "..."
                                : stats.ordersToday.toLocaleString()
                        }
                    />

                    <DashboardStatCard
                        title="Revenue"
                        value={
                            loading
                                ? "..."
                                : formatCurrency(
                                      stats.revenue
                                  )
                        }
                    />

                    <DashboardStatCard
                        title="Sales This Month"
                        value={
                            loading
                                ? "..."
                                : formatCurrency(
                                      monthlySales[
                                          new Date().getMonth()
                                      ]?.sales
                                  )
                        }
                    />
                </DashboardStatsGrid>
            </DashboardSection>

            {/* Sales Chart + Activity */}

            <DashboardSection>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <DashboardChartCard title="Monthly Sales">
                            <SalesChart
                                data={monthlySales}
                            />
                        </DashboardChartCard>
                    </div>

                    <DashboardActivityCard title="Recent Activity">
                        <div className="space-y-5 text-sm">
                            {loading ? (
                                <p className="text-gray-500">
                                    Loading activity...
                                </p>
                            ) : recentActivity.length === 0 ? (
                                <p className="text-gray-500">
                                    No recent activity.
                                </p>
                            ) : (
                                recentActivity.map(
                                    (activity) => (
                                        <div
                                            key={
                                                activity.id
                                            }
                                            className="border-b pb-3 last:border-b-0"
                                        >
                                            <p className="font-semibold">
                                                {
                                                    activity.title
                                                }
                                            </p>

                                            <p className="text-gray-500">
                                                {
                                                    activity.description
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {
                                                    activity.type
                                                }{" "}
                                                •{" "}
                                                {formatActivityDate(
                                                    activity.date
                                                )}
                                            </p>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </DashboardActivityCard>
                </div>
            </DashboardSection>
        </>
    );
}