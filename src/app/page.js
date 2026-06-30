import SideNavbar from "@/components/layout/SideNavbar";
import navigation from "./config/navigation";
import themes from "./config/theme";

export default function Home() {
  const theme = themes.light;

  return (
    <div className="flex">
      <SideNavbar
        links={navigation}
        theme={theme.sidebar}
      />

      <main className="flex-1 p-8">
        <h1>Dashboard</h1>
      </main>
    </div>
  );
}