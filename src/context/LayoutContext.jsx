"use client";

import { createContext, useContext, useState } from "react";

const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  const [sidebarMode, setSidebarMode] = useState("expanded");

  function toggleSidebar() {
    setSidebarMode((current) =>
      current === "expanded" ? "collapsed" : "expanded",
    );
  }

  return (
    <LayoutContext.Provider
      value={{
        sidebarMode,
        setSidebarMode,
        toggleSidebar,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
