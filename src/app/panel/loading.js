import { Loader } from "@/components/common/Loader";
import { Skeleton } from "@/components/common/Skeleton";

/**
 * Dashboard loading UI - shown while dashboard pages load
 * Provides a skeleton of the dashboard layout
 */
export default function DashboardLoading() {
    return (
        <div className="p-6">
            {/* Page Title Skeleton */}
            <div className="mb-6">
                <Skeleton variant="text" className="h-8 w-64 mb-2" />
                <Skeleton variant="text" className="h-4 w-96" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-[var(--color-card-background)] rounded-lg p-6 border border-[var(--color-border)]"
                    >
                        <Skeleton variant="text" className="h-4 w-20 mb-3" />
                        <Skeleton variant="text" className="h-8 w-32 mb-2" />
                        <Skeleton variant="text" className="h-3 w-24" />
                    </div>
                ))}
            </div>

            {/* Table/Content Skeleton */}
            <div className="bg-[var(--color-card-background)] rounded-lg p-6 border border-[var(--color-border)]">
                <Skeleton variant="text" className="h-6 w-48 mb-4" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} variant="text" className="h-12 w-full" />
                    ))}
                </div>
            </div>

            {/* Centered Loader */}
            <div className="flex justify-center mt-8">
                <Loader size="md" />
            </div>
        </div>
    );
}
