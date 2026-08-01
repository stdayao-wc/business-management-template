import AppLayout from "@/components/layout/AppLayout";

import navigation from "../config/navigation";
import themes from "../config/theme";
import layout from "../config/layout";

export default function ProtectedLayout({ children }) {
  return (
    <AppLayout
      navigation={navigation}
      theme={themes.light}
      layout={layout}
    >
      {children}
    </AppLayout>
  );
}