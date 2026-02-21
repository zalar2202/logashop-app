"use client";

import Link from "next/link";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { devNavigation } from "@/constants/navigation";
import { FlaskConical } from "lucide-react";

export default function ManagerToolsPage() {
    return (
        <ContentWrapper>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--color-primary-light)" }}
                    >
                        <FlaskConical className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
                    </div>
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Dev & Testing Tools
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                            Development, debugging, and testing pages
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Card
                                hoverable
                                className="p-5 h-full flex items-center gap-4 transition-all"
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: "var(--color-background-tertiary)" }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                                </div>
                                <div className="min-w-0">
                                    <h3
                                        className="font-semibold truncate"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {item.name}
                                    </h3>
                                    <p
                                        className="text-xs truncate"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    >
                                        {item.href}
                                    </p>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </ContentWrapper>
    );
}
