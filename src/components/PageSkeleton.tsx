import { Skeleton } from "@/components/ui/skeleton";

export const PageSkeleton = () => {
  return (
    <main className="min-h-screen container flex flex-col items-center">
      <Skeleton className="h-12 w-72 md:w-48" />
      <div className="grid gap-10 grid-cols-1 my-6 mx-auto w-72 md:w-[500]">
        <Skeleton className="min-h-[400] w-full" />
        <Skeleton className="min-h-[400] w-full" />
      </div>
    </main>
  );
};
