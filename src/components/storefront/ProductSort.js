"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function ProductSort({ currentSort }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChange = (e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <select
            id="product-sort"
            name="sort"
            defaultValue={currentSort}
            onChange={handleChange}
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-white"
        >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="popular">Most Popular</option>
        </select>
    );
}
