import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const isAuthorized = true;

    if (isAuthorized) {
      throw redirect({ to: "/profile" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/"!</div>;
}
