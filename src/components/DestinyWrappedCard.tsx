import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DestinyWrappedCard = memo(
  ({ children, title }: { title: string; children: React.ReactNode }) => {
    return (
      <Card className="w-full overflow-hidden shadow-2xl transition-all duration-300 bg-gradient-to-br from-gray-900 to-gray-400 dark:from-gray-800 dark:to-gray-700 hover:shadow-gray-700/50 dark:hover:shadow-gray-800/50">
        <CardHeader className="relative z-10">
          <CardTitle className="text-3xl font-bold text-center text-gray-100 dark:text-gray-50 drop-shadow-lg">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 text-gray-100 dark:text-gray-50">
          {children}
        </CardContent>
      </Card>
    );
  }
);

DestinyWrappedCard.displayName = "DestinyWrappedCard";
