import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/simulations")({
  head: () => ({
    meta: [
      { title: "Physics Lab Simulations — Easy Padhai" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SimulationsRedirect,
});

function SimulationsRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/simulations/index.html");
    }
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#0b1420] text-[#a2edca] px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-[#a2edca] border-t-transparent" />
        <p className="text-sm font-medium">Opening Physics Lab Simulations...</p>
      </div>
    </div>
  );
}
