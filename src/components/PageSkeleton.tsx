import { Skeleton } from "@/components/ui/skeleton";

const CardSkeleton = () => <Skeleton className="min-h-[600] w-full" />;

export const PageSkeleton = () => {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Skeleton className="h-12 w-72 md:w-48" />
      <div className="grid gap-10 grid-cols-1 my-6 mx-auto w-72 md:w-[500]">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </main>
  );
};
