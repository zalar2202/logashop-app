import { Card } from "@/components/common/Card";
import { Skeleton } from "@/components/common/Skeleton";

/**
 * Loading state for Send Notification page
 */
export default function SendNotificationLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Form skeleton */}
            <Card>
                <Skeleton type="form" count={6} />
            </Card>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <Skeleton className="h-20" />
                </Card>
                <Card>
                    <Skeleton className="h-20" />
                </Card>
                <Card>
                    <Skeleton className="h-20" />
                </Card>
            </div>
        </div>
    );
}

