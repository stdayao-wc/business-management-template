const navigation = [
    {
        label: "Dashboard",
        href: "/",
        icon: "/icons/dashboard-alt.png",
        permission: "dashboard.read",
    },
    {
        label: "Products",
        href: "/products",
        icon: "/icons/inventory.png",
        permission: "products.read",
    },
    {
        label: "Inventory",
        href: "/inventory",
        icon: "/icons/warehouse.png",
        permission: "inventory.read",
    },
    {
        label: "POS",
        href: "/pos",
        icon: "/icons/pos.png",
        permission: "pos.read",
    },
    {
        label: "Orders",
        href: "/orders",
        icon: "/icons/orders.png",
        permission: "sales.read",
    },
    {
        label: "Finance",
        href: "/finance",
        icon: "/icons/finance.png",
        permission: "finance.read",
    },
    // {
    //     label: "Reports",
    //     href: "/reports",
    //     icon: "/icons/reports.png",
    //     permission: "reports.read",
    // },
];

export default navigation;