import { createRootRoute, Outlet } from "@tanstack/react-router";
import { StrictMode } from "react";

import "../styles.css";

export const Route = createRootRoute({
  // beforeLoad: () => {
  //   const isAuthorized = true;

  //   if (isAuthorized) {
  //     throw redirect({ to: "/profile" });
  //   }
  // },
  component: () => (
    <StrictMode>
      <Outlet />
    </StrictMode>
  ),
});
