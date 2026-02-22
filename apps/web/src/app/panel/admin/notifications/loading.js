import { Card } from "@/components/common/Card";
import { Skeleton } from "@/components/common/Skeleton";

/**
 * Loading state for Notifications page
 */
export default function NotificationsLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Tabs skeleton */}
            <Card>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                </div>
            </Card>

            {/* Notifications list skeleton */}
            <Card>
                <Skeleton type="list" count={5} />
            </Card>
        </div>
    );
}
