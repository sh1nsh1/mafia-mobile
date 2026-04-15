import { createRootRoute, Outlet } from "@tanstack/react-router";
import { StrictMode } from "react";

import "@/styles.css";

export const Route = createRootRoute({
  component: () => (
    <StrictMode>
      <Outlet />
    </StrictMode>
  ),
});
