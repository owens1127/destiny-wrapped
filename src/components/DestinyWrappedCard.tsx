import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const DestinyWrappedCard = memo(
  ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => {
    return (
      <Card
        className={cn(
          className,
          "w-full max-w-md mx-auto overflow-hidden shadow-lg shadow-gray-700/50 dark:shadow-lg dark:shadow-gray-600/50"
        )}
      >
        {children}
      </Card>
    );
  }
);

DestinyWrappedCard.displayName = "DestinyWrappedCard";
