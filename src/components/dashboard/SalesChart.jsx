"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

const data = [
    { month: "Jan", sales: 18500 },
    { month: "Feb", sales: 22400 },
    { month: "Mar", sales: 19800 },
    { month: "Apr", sales: 26700 },
    { month: "May", sales: 31200 },
    { month: "Jun", sales: 28700 },
    { month: "Jul", sales: 35600 },
    { month: "Aug", sales: 38100 },
    { month: "Sep", sales: 42200 },
    { month: "Oct", sales: 48700 },
    { month: "Nov", sales: 56200 },
    { month: "Dec", sales: 63800 },
];

function formatCurrency(value) {
    return `₱${value.toLocaleString()}`;
}

export default function SalesChart() {
    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="month"
                    />

                    <YAxis
                        tickFormatter={(value) => `₱${value / 1000}k`}
                    />

                    <Tooltip
                        formatter={(value) => formatCurrency(value)}
                    />

                    <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{
                            r: 5,
                        }}
                        activeDot={{
                            r: 7,
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}