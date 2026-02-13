"use client";

import { useEffect, useState, useMemo } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Package as PackageIcon, ShoppingCart, Info, CheckCircle2, Store, Filter } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const CATEGORIES = [
    { id: 'all', label: 'All Services' },
    { id: 'design', label: 'Design' },
    { id: 'development', label: 'Development' },
    { id: 'hosting', label: 'Hosting & Cloud' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'seo', label: 'SEO' },
    { id: 'marketing', label: 'Marketing' }
];

export default function ShopPage() {
    const router = useRouter();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const { refreshCart } = useCart();

    const fetchPackages = async () => {
        try {
            const res = await axios.get("/api/packages?all=true");
            // Only show active packages to users
            setPackages(res.data.data.filter(p => p.isActive));
        } catch (error) {
            toast.error("Failed to fetch packages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const addToCart = async (pkg) => {
        setAddingToCart(pkg._id);
        try {
            await axios.post("/api/cart", {
                packageId: pkg._id,
                quantity: 1,
                billingCycle: "monthly"
            });
            toast.success(`${pkg.name} added to cart!`, {
                action: {
                    label: "View Cart",
                    onClick: () => router.push("/panel/cart")
                }
            });
            refreshCart();
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setAddingToCart(null);
        }
    };

    const filteredPackages = useMemo(() => {
        if (activeCategory === 'all') return packages;
        return packages.filter(p => p.category === activeCategory);
    }, [packages, activeCategory]);

    return (
        <ContentWrapper>
            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm">
                                <Store className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Services & Packages</h1>
                        </div>
                        <p className="text-[var(--color-text-secondary)] max-w-2xl text-lg">
                            Select a professional service package tailored to your business needs. 
                        </p>
                    </div>
                </div>

                {/* Simplified "Mix it up" Category Filter */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-[var(--color-background-elevated)] border border-[var(--color-border)] rounded-2xl w-fit mb-8 shadow-sm">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                activeCategory === cat.id
                                    ? "bg-indigo-600 text-white shadow-md active:scale-95 translate-y-[-1px]"
                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-indigo-600"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="h-96 animate-pulse bg-[var(--color-background-elevated)]" />
                    ))}
                </div>
            ) : filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                    {filteredPackages.map((pkg) => (
                        <Card key={pkg._id} className="relative flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-300 border-[var(--color-border)] group hover:border-indigo-500/50 hover:translate-y-[-4px]">
                            {pkg.badge && (
                                <div className="absolute top-0 right-0 z-10">
                                    <div className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-lg">
                                        {pkg.badge}
                                    </div>
                                </div>
                            )}
                            
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="p-3 bg-indigo-600 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                        <PackageIcon size={28} />
                                    </div>
                                    <Badge size="sm" className="capitalize px-3 py-1 font-semibold tracking-wide" variant="primary">{pkg.category}</Badge>
                                </div>

                                <h3 className="text-2xl font-bold mb-2 text-[var(--color-text-primary)] leading-tight">{pkg.name}</h3>
                                
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                                            {pkg.startingPrice}
                                        </span>
                                        <span className="text-sm font-medium text-[var(--color-text-tertiary)] opacity-70">/ start</span>
                                    </div>
                                    <p className="text-xs text-indigo-500 font-bold mt-1 uppercase tracking-widest">{pkg.priceRange}</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-grow">
                                    {pkg.features?.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="p-1 bg-emerald-500/10 rounded-full mt-0.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                            </div>
                                            <span className="text-[0.925rem] text-[var(--color-text-secondary)] leading-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto space-y-3 pt-6 border-t border-[var(--color-border)]">
                                    <Button 
                                        fullWidth 
                                        onClick={() => addToCart(pkg)}
                                        loading={addingToCart === pkg._id}
                                        icon={<ShoppingCart className="w-4 h-4" />}
                                        className="h-12 text-sm font-bold shadow-indigo-500/20"
                                    >
                                        Add to Cart
                                    </Button>
                                    <button className="w-full py-2.5 text-xs font-bold text-[var(--color-text-tertiary)] hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5 opacity-70 hover:opacity-100">
                                        <Info className="w-3.5 h-3.5" />
                                        Custom Modification
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-[var(--color-background-elevated)] rounded-3xl border border-dashed border-[var(--color-border)]">
                    <Filter className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-30" />
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">No packages in this category</h3>
                    <p className="text-[var(--color-text-secondary)] mt-1">Try selecting another service category</p>
                    <button 
                        onClick={() => setActiveCategory('all')}
                        className="mt-6 text-indigo-600 font-bold hover:underline"
                    >
                        View all services
                    </button>
                </div>
            )}
        </ContentWrapper>
    );
}
