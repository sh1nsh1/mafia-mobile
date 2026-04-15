import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/_main")({
  component: NavbarWrapper,
});

function NavbarWrapper() {
  return (
    <div className="flex flex-row h-screen">
      <Navbar />
      <Outlet />
    </div>
  );
}
