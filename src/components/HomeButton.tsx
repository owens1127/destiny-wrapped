"use client";

import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export const HomeButton = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Only show on wrapped page
  if (pathname !== "/wrapped") {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        router.push("/");
      }}
      aria-label="Go to home"
    >
      <Home className="w-4 h-4" />
    </Button>
  );
};
