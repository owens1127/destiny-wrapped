import { BungieSession } from "next-bungie-auth/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";
import { PageSkeleton } from "./PageSkeleton";

export const Unauthorized = (
  props: BungieSession & {
    status: "unauthorized" | "unavailable" | "stale" | "pending";
  }
) => {
  if (props.isPending) {
    return <PageSkeleton />;
  }

  const getMessage = () => {
    switch (props.status) {
      case "unauthorized":
        return "You must authorize this tool in order to proceed";
      case "unavailable":
        return "This tool is currently unavailable. Please try again later.";
      default:
        return "An unknown error occurred.";
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px] dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Unauthenticated</CardTitle>
          <CardDescription>Sign in with Bungie to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{getMessage()}</p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full p-0"
            disabled={props.status === "unavailable"}
          >
            <Link
              prefetch={false}
              href="/api/auth/authorize"
              className="w-full h-full py-2 px-4"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/api/auth/authorize";
              }}
            >
              Sign In
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
