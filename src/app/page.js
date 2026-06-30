import AppLayout from "@/components/layout/AppLayout";

import navigation from "./config/navigation";
import themes from "./config/theme";
import layout from "./config/layout";

export default function Home() {
  return (
    <AppLayout
      navigation={navigation}
      theme={themes.light}
      layout={layout}
    >
      <h1>Dashboard</h1>
    </AppLayout>
  );
}