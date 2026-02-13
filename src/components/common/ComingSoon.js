"use client";

import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";

export default function ComingSoonPage({ title = "Feature" }) {
    const router = useRouter();

    return (
        <ContentWrapper>
            <div className="mb-6">
                <Button
                    variant="secondary"
                    icon={<ArrowLeft size={18} />}
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    Back
                </Button>
                <h1 className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {title}
                </h1>
            </div>

            <Card className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-6">
                    <Construction className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                    Coming Soon
                </h2>
                <p className="text-[var(--color-text-secondary)] max-w-md mx-auto mb-8">
                    We're working hard to bring you the {title.toLowerCase()} management features. 
                    This section will be available in a future update.
                </p>
                <Button onClick={() => router.push("/panel/dashboard")}>
                    Return to Dashboard
                </Button>
            </Card>
        </ContentWrapper>
    );
}
