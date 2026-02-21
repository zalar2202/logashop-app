"use client";

import Link from "next/link";
import { Mail, Users } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";

export default function MarketingPage() {
    return (
        <ContentWrapper>
            <div className="mb-8">
                <h1
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Marketing
                </h1>
                <p
                    className="text-sm mt-1"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Manage email campaigns and newsletter subscribers.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/panel/admin/marketing/email">
                    <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                                style={{ backgroundColor: "var(--color-primary)" }}
                            >
                                <Mail className="w-5 h-5 text-white flex-shrink-0" />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                    Send Email Campaign
                                </h3>
                                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                                    Create and send promotional emails to subscribers.
                                </p>
                            </div>
                        </div>
                    </Card>
                </Link>

                <Link href="/panel/admin/marketing/subscribers">
                    <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                                style={{ backgroundColor: "var(--color-primary)" }}
                            >
                                <Users className="w-5 h-5 text-white flex-shrink-0" />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                    View Subscribers
                                </h3>
                                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                                    Browse newsletter subscriber list.
                                </p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>
        </ContentWrapper>
    );
}
