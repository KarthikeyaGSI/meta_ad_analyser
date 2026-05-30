import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home" },
      { name: "description", content: "Welcome to your app." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">Signed in as {user.email}</p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => signOut()}>Sign out</Button>
          <Button variant="outline" asChild>
            <Link to="/auth">Auth page</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
