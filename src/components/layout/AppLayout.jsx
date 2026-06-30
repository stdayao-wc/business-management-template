import Header from "./Header";
import SideNavbar from "./SideNavbar";

export default function AppLayout({
  children,
  navigation,
  theme,
  layout,
}) {
  return (
    <>
      <Header />

      <div className="flex">
        <SideNavbar
          links={navigation}
          theme={theme.sidebar}
          layout={layout}
        />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </>
  );
}