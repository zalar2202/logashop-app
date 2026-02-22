"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    MapPin,
    Truck,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    ShoppingBag,
    Shield,
    Check,
    Lock,
    AlertCircle,
    Package,
    X,
    Tag,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import PaymentWrapper from "@/components/checkout/PaymentWrapper";

const STEPS = [
    { id: "shipping", label: "Shipping", icon: MapPin },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
];

const FALLBACK_SHIPPING_METHODS = [
    {
        id: "standard",
        methodId: "standard",
        label: "Standard Shipping",
        description: "5-7 business days",
        price: 499,
        freeThreshold: 5000,
        estimatedDays: "5-7 business days",
    },
    {
        id: "express",
        methodId: "express",
        label: "Express Shipping",
        description: "2-3 business days",
        price: 999,
        freeThreshold: null,
        estimatedDays: "2-3 business days",
    },
    {
        id: "overnight",
        methodId: "overnight",
        label: "Overnight Shipping",
        description: "Next business day",
        price: 1999,
        freeThreshold: null,
        estimatedDays: "Next business day",
    },
];

const INITIAL_ADDRESS = {
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
};

// Defined outside to prevent re-mounting on every keystroke (focus loss bug)
const Input = ({ label, name, value, onChange, error, type = "text", placeholder, required }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 rounded-lg border ${
                error
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-[var(--color-border)] focus:ring-[var(--color-primary)]/20"
            } focus:outline-none focus:ring-2 transition bg-white`}
        />
        {error && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
            </p>
        )}
    </div>
);

export default function CheckoutPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { items, subtotal, itemCount, refreshCart } = useCart();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    // Form state
    const [guestEmail, setGuestEmail] = useState("");
    const [shippingAddress, setShippingAddress] = useState(INITIAL_ADDRESS);
    const [billingAddress, setBillingAddress] = useState(INITIAL_ADDRESS);
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [shippingMethod, setShippingMethod] = useState("standard");
    const [customerNote, setCustomerNote] = useState("");

    // Saved addresses
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [saveAddress, setSaveAddress] = useState(false);

    // Dynamic shipping methods from zone lookup
    const [availableMethods, setAvailableMethods] = useState(FALLBACK_SHIPPING_METHODS);
    const [zoneName, setZoneName] = useState("");
    const [loadingMethods, setLoadingMethods] = useState(false);

    // Stripe State
    const [clientSecret, setClientSecret] = useState("");
    const [showStripe, setShowStripe] = useState(false);
    const [stripeOrderId, setStripeOrderId] = useState("");

    // Validation errors
    const [errors, setErrors] = useState({});

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState("");

    // Geo data from Country State City API
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

    // Fetch countries on mount
    useEffect(() => {
        axios
            .get("/api/geo/countries")
            .then(({ data }) => {
                if (data.success && Array.isArray(data.data)) {
                    setCountries(data.data);
                }
            })
            .catch(console.error);
    }, []);

    // Fetch states when shipping country changes
    useEffect(() => {
        const country = shippingAddress.country?.trim();
        if (!country) {
            setStates([]);
            return;
        }
        setLoadingStates(true);
        axios
            .get("/api/geo/states", { params: { country } })
            .then(({ data }) => {
                if (data.success && Array.isArray(data.data)) {
                    setStates(data.data);
                } else {
                    setStates([]);
                }
            })
            .catch(() => setStates([]))
            .finally(() => setLoadingStates(false));
    }, [shippingAddress.country]);

    // Fetch cities when country + state are selected (for autocomplete)
    const fetchCitiesForShipping = useCallback(() => {
        const country = shippingAddress.country?.trim();
        const state = shippingAddress.state?.trim();
        if (!country || !state) {
            setCities([]);
            return;
        }
        setLoadingCities(true);
        axios
            .get("/api/geo/cities", { params: { country, state } })
            .then(({ data }) => {
                if (data.success && Array.isArray(data.data)) {
                    setCities(data.data);
                } else {
                    setCities([]);
                }
            })
            .catch(() => setCities([]))
            .finally(() => setLoadingCities(false));
    }, [shippingAddress.country, shippingAddress.state]);

    // Fetch cities when state changes and we have both country & state
    useEffect(() => {
        if (shippingAddress.country && shippingAddress.state && states.length > 0) {
            fetchCitiesForShipping();
        } else {
            setCities([]);
        }
    }, [shippingAddress.country, shippingAddress.state, states.length, fetchCitiesForShipping]);

    // Fetch saved addresses for logged-in users
    useEffect(() => {
        if (isAuthenticated) {
            axios
                .get("/api/addresses")
                .then(({ data }) => {
                    if (data.success) {
                        setSavedAddresses(data.data);
                        // Auto-fill with default address
                        const defaultAddr = data.data.find((a) => a.isDefault);
                        if (defaultAddr) {
                            setShippingAddress({
                                firstName: defaultAddr.firstName,
                                lastName: defaultAddr.lastName,
                                company: defaultAddr.company || "",
                                address1: defaultAddr.address1,
                                address2: defaultAddr.address2 || "",
                                city: defaultAddr.city,
                                state: defaultAddr.state,
                                zipCode: defaultAddr.zipCode,
                                country: defaultAddr.country || "US",
                                phone: defaultAddr.phone || "",
                            });
                        }
                    }
                })
                .catch(console.error);
        }
    }, [isAuthenticated]);

    // Pre-fill guest email from user if authenticated
    useEffect(() => {
        if (user?.email) {
            setGuestEmail(user.email);
        }
    }, [user]);

    // Redirect if cart is empty
    useEffect(() => {
        if (itemCount === 0 && !loading) {
            // Give time for cart to load
            const timer = setTimeout(() => {
                if (itemCount === 0) {
                    router.push("/cart");
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [itemCount, loading, router]);

    // Select saved address
    const selectSavedAddress = (addr) => {
        setShippingAddress({
            firstName: addr.firstName,
            lastName: addr.lastName,
            company: addr.company || "",
            address1: addr.address1,
            address2: addr.address2 || "",
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country || "US",
            phone: addr.phone || "",
        });
    };

    // Fetch shipping methods when address country/state changes
    useEffect(() => {
        const country = shippingAddress.country;
        const state = shippingAddress.state;

        if (!country) return;

        const controller = new AbortController();
        setLoadingMethods(true);

        axios
            .get("/api/shipping-zones", {
                params: { country, state: state || undefined },
                signal: controller.signal,
            })
            .then(({ data }) => {
                if (data.success && data.data) {
                    const methods = data.data.methods.map((m) => ({
                        id: m.methodId,
                        ...m,
                    }));
                    setAvailableMethods(methods.length > 0 ? methods : FALLBACK_SHIPPING_METHODS);
                    setZoneName(data.data.zoneName);

                    // If current method isn't available in new zone, switch to first available
                    const currentValid = methods.some((m) => m.methodId === shippingMethod);
                    if (!currentValid && methods.length > 0) {
                        setShippingMethod(methods[0].methodId);
                    }
                } else {
                    setAvailableMethods(FALLBACK_SHIPPING_METHODS);
                    setZoneName(null);
                }
            })
            .catch((err) => {
                if (err.name !== "CanceledError") {
                    setAvailableMethods(FALLBACK_SHIPPING_METHODS);
                    setZoneName(null);
                }
            })
            .finally(() => setLoadingMethods(false));

        return () => controller.abort();
    }, [shippingAddress.country, shippingAddress.state]);

    // Get human-readable state name for display (we store iso2/code for API, show name to user)
    const getStateDisplayName = useCallback(
        (stateValue) => {
            if (!stateValue) return "";
            const s = states.find(
                (x) => (x.iso2 || x.name) === stateValue || String(x.id) === stateValue
            );
            return s ? s.name : stateValue;
        },
        [states]
    );

    // Calculate shipping cost
    const getShippingCost = useCallback(() => {
        const method = availableMethods.find((m) => (m.methodId || m.id) === shippingMethod);
        if (!method) return availableMethods[0]?.price ?? 499;
        if (method.freeThreshold && subtotal >= method.freeThreshold) return 0;
        return method.price;
    }, [shippingMethod, subtotal, availableMethods]);

    // Calculate tax (8.5%)
    const taxAmount = Math.round(subtotal * 0.085);
    const shippingCost = getShippingCost();
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const total = Math.max(0, subtotal + shippingCost + taxAmount - discountAmount);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        try {
            setValidatingCoupon(true);
            setCouponError("");
            const { data } = await axios.post("/api/coupons/validate", {
                code: couponCode,
                subtotal,
            });

            if (data.success) {
                setAppliedCoupon(data.data);
                toast.success("Coupon applied!");
                setCouponCode("");
            }
        } catch (error) {
            setAppliedCoupon(null);
            const msg = error.response?.data?.error || "Invalid coupon";
            setCouponError(msg);
            toast.error(msg);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    // Validate shipping step
    const validateShipping = () => {
        const newErrors = {};
        if (!isAuthenticated && !guestEmail.trim()) {
            newErrors.guestEmail = "Email is required";
        } else if (!isAuthenticated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
            newErrors.guestEmail = "Invalid email address";
        }
        if (!shippingAddress.firstName.trim()) newErrors.firstName = "First name is required";
        if (!shippingAddress.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!shippingAddress.address1.trim()) newErrors.address1 = "Address is required";
        if (!shippingAddress.country?.trim()) newErrors.country = "Country is required";
        if (!shippingAddress.city.trim()) newErrors.city = "City is required";
        if (!shippingAddress.state.trim()) newErrors.state = "State is required";
        if (!shippingAddress.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate billing
    const validateBilling = () => {
        if (billingSameAsShipping) return true;
        const newErrors = {};
        if (!billingAddress.firstName.trim()) newErrors.bilFirstName = "First name is required";
        if (!billingAddress.lastName.trim()) newErrors.bilLastName = "Last name is required";
        if (!billingAddress.address1.trim()) newErrors.bilAddress1 = "Address is required";
        if (!billingAddress.city.trim()) newErrors.bilCity = "City is required";
        if (!billingAddress.state.trim()) newErrors.bilState = "State is required";
        if (!billingAddress.zipCode.trim()) newErrors.bilZipCode = "ZIP code is required";
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    // Navigate steps
    const goNext = () => {
        if (currentStep === 0) {
            if (!validateShipping()) return;
            if (!validateBilling()) return;
        }
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        window.scrollTo(0, 0);
    };

    const goBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo(0, 0);
    };

    // Place order
    const handlePlaceOrder = async () => {
        try {
            setPlacingOrder(true);

            // Save address if requested
            if (isAuthenticated && saveAddress) {
                await axios
                    .post("/api/addresses", {
                        ...shippingAddress,
                        label: "Shipping",
                        isDefault: false, // will be handled by model logic
                    })
                    .catch(() => {});
            }

            const { data } = await axios.post("/api/checkout", {
                shippingAddress,
                billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
                billingSameAsShipping,
                shippingMethod,
                customerNote,
                guestEmail: !user ? guestEmail : undefined,
                couponCode: appliedCoupon?.code,
            });

            if (data.success) {
                const { orderId, orderNumber } = data.data;
                setStripeOrderId(orderId);

                // Create Stripe Payment Intent
                try {
                    const intentRes = await axios.post("/api/payments/create-intent", {
                        orderId,
                    });

                    if (intentRes.data.success) {
                        setClientSecret(intentRes.data.clientSecret);
                        setShowStripe(true);
                        // We don't refresh cart yet, we do it after success
                        toast.success("Order reserved. Please complete payment.");
                    } else {
                        throw new Error(intentRes.data.error || "Failed to initialize payment");
                    }
                } catch (intentError) {
                    console.error("Intent Error:", intentError);
                    toast.error(
                        "Order created, but payment failed to initialize. Please check your account orders."
                    );
                    router.push(`/checkout/confirmation?order=${orderNumber}`);
                }
            }
        } catch (error) {
            const message = error.response?.data?.error || "Failed to place order";
            toast.error(message);
        } finally {
            setPlacingOrder(false);
        }
    };

    if (itemCount === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        Add some items before checking out.
                    </p>
                    <Link
                        href="/products"
                        className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
                    <Link
                        href="/cart"
                        className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                        <ChevronLeft size={16} /> Back to Cart
                    </Link>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-10">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isComplete = index < currentStep;

                        return (
                            <div key={step.id} className="flex items-center">
                                <button
                                    onClick={() => {
                                        if (index < currentStep) setCurrentStep(index);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                                        isActive
                                            ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25"
                                            : isComplete
                                              ? "bg-green-100 text-green-700"
                                              : "bg-gray-100 text-[var(--color-text-secondary)]"
                                    }`}
                                >
                                    {isComplete ? <Check size={18} /> : <Icon size={18} />}
                                    <span className="hidden sm:inline">{step.label}</span>
                                </button>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`w-12 md:w-20 h-0.5 mx-2 ${
                                            index < currentStep ? "bg-green-400" : "bg-gray-200"
                                        }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* STEP 0: Shipping Address */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                {/* Guest email */}
                                {!isAuthenticated && (
                                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                        <h2 className="text-lg font-bold mb-4">
                                            Contact Information
                                        </h2>
                                        <Input
                                            label="Email Address"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            error={errors.guestEmail}
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                        />
                                        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                                            We'll send your order confirmation to this email.{" "}
                                            <Link
                                                href="/login?redirect=/checkout"
                                                className="text-[var(--color-primary)] hover:underline"
                                            >
                                                Sign in for a faster checkout
                                            </Link>
                                        </p>
                                    </div>
                                )}

                                {/* Saved Addresses */}
                                {savedAddresses.length > 0 && (
                                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                        <h2 className="text-lg font-bold mb-4">Saved Addresses</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {savedAddresses.map((addr) => (
                                                <button
                                                    key={addr._id}
                                                    onClick={() => selectSavedAddress(addr)}
                                                    className={`text-left p-4 rounded-lg border-2 transition ${
                                                        shippingAddress.address1 ===
                                                            addr.address1 &&
                                                        shippingAddress.zipCode === addr.zipCode
                                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                                    }`}
                                                >
                                                    <p className="font-medium text-sm">
                                                        {addr.firstName} {addr.lastName}
                                                        {addr.isDefault && (
                                                            <span className="ml-2 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                                        {addr.address1}, {addr.city}, {addr.state}{" "}
                                                        {addr.zipCode}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Shipping Address Form */}
                                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <MapPin size={20} className="text-[var(--color-primary)]" />
                                        Shipping Address
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            value={shippingAddress.firstName}
                                            onChange={(e) =>
                                                setShippingAddress((prev) => ({
                                                    ...prev,
                                                    firstName: e.target.value,
                                                }))
                                            }
                                            error={errors.firstName}
                                            required
                                        />
                                        <Input
                                            label="Last Name"
                                            value={shippingAddress.lastName}
                                            onChange={(e) =>
                                                setShippingAddress((prev) => ({
                                                    ...prev,
                                                    lastName: e.target.value,
                                                }))
                                            }
                                            error={errors.lastName}
                                            required
                                        />
                                        <div className="sm:col-span-2">
                                            <Input
                                                label="Company"
                                                value={shippingAddress.company}
                                                onChange={(e) =>
                                                    setShippingAddress((prev) => ({
                                                        ...prev,
                                                        company: e.target.value,
                                                    }))
                                                }
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Input
                                                label="Address Line 1"
                                                value={shippingAddress.address1}
                                                onChange={(e) =>
                                                    setShippingAddress((prev) => ({
                                                        ...prev,
                                                        address1: e.target.value,
                                                    }))
                                                }
                                                error={errors.address1}
                                                placeholder="123 Main St"
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Input
                                                label="Address Line 2"
                                                value={shippingAddress.address2}
                                                onChange={(e) =>
                                                    setShippingAddress((prev) => ({
                                                        ...prev,
                                                        address2: e.target.value,
                                                    }))
                                                }
                                                placeholder="Apt, Suite, etc. (Optional)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={shippingAddress.country}
                                                onChange={(e) =>
                                                    setShippingAddress((prev) => ({
                                                        ...prev,
                                                        country: e.target.value,
                                                        state: "",
                                                        city: "",
                                                    }))
                                                }
                                                className={`w-full px-4 py-2.5 rounded-lg border ${
                                                    errors.country
                                                        ? "border-red-500 focus:ring-red-500/20"
                                                        : "border-[var(--color-border)] focus:ring-[var(--color-primary)]/20"
                                                } focus:outline-none focus:ring-2 transition bg-white`}
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map((c) => (
                                                    <option key={c.iso2} value={c.iso2}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.country && (
                                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> {errors.country}
                                                </p>
                                            )}
                                        </div>
                                        {states.length > 0 ? (
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                                                    State / Province <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={shippingAddress.state}
                                                    onChange={(e) =>
                                                        setShippingAddress((prev) => ({
                                                            ...prev,
                                                            state: e.target.value,
                                                            city: "",
                                                        }))
                                                    }
                                                    disabled={loadingStates}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${
                                                        errors.state
                                                            ? "border-red-500 focus:ring-red-500/20"
                                                            : "border-[var(--color-border)] focus:ring-[var(--color-primary)]/20"
                                                    } focus:outline-none focus:ring-2 transition bg-white`}
                                                >
                                                    <option value="">
                                                        {loadingStates ? "Loading..." : "Select State / Province"}
                                                    </option>
                                                    {states.map((s) => (
                                                        <option key={s.id} value={s.iso2 || s.name}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.state && (
                                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle size={12} /> {errors.state}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <Input
                                                label="State / Province"
                                                value={shippingAddress.state}
                                                onChange={(e) =>
                                                    setShippingAddress((prev) => ({
                                                        ...prev,
                                                        state: e.target.value,
                                                    }))
                                                }
                                                error={errors.state}
                                                placeholder="State or Province"
                                                required
                                            />
                                        )}
                                        {/* City: autocomplete when we have cities from API, else plain input */}
                                        {cities.length > 0 ? (
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                                                    City <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={shippingAddress.city}
                                                    onChange={(e) => {
                                                        setShippingAddress((prev) => ({
                                                            ...prev,
                                                            city: e.target.value,
                                                        }));
                                                        setCityDropdownOpen(true);
                                                    }}
                                                    onFocus={() => setCityDropdownOpen(true)}
                                                    onBlur={() =>
                                                        setTimeout(() => setCityDropdownOpen(false), 150)
                                                    }
                                                    placeholder={
                                                        loadingCities
                                                            ? "Loading cities..."
                                                            : "Type to search or select"
                                                    }
                                                    disabled={loadingCities}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${
                                                        errors.city
                                                            ? "border-red-500 focus:ring-red-500/20"
                                                            : "border-[var(--color-border)] focus:ring-[var(--color-primary)]/20"
                                                    } focus:outline-none focus:ring-2 transition bg-white`}
                                                />
                                                {cityDropdownOpen && (
                                                    <div className="absolute z-10 w-full mt-0.5 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                        {(() => {
                                                            const filtered = cities.filter((c) =>
                                                                !shippingAddress.city
                                                                    ? true
                                                                    : c.name
                                                                          .toLowerCase()
                                                                          .includes(
                                                                              shippingAddress.city.toLowerCase()
                                                                          )
                                                            ).slice(0, 12);
                                                            return filtered.length > 0 ? (
                                                                filtered.map((c) => (
                                                                    <button
                                                                        key={c.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setShippingAddress((prev) => ({
                                                                                ...prev,
                                                                                city: c.name,
                                                                            }));
                                                                            setCityDropdownOpen(false);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-primary)]/10 transition"
                                                                    >
                                                                        {c.name}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <p className="px-4 py-2.5 text-xs text-[var(--color-text-secondary)]">
                                                                    Type your city if not listed
                                                                </p>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                                {errors.city && (
                                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle size={12} /> {errors.city}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <Input
                                                label="City"
                                                value={shippingAddress.city}
                                                onChange={(e) =>
                                                    setShippingAddress((prev) => ({
                                                        ...prev,
                                                        city: e.target.value,
                                                    }))
                                                }
                                                error={errors.city}
                                                placeholder="City"
                                                required
                                            />
                                        )}
                                        <Input
                                            label="ZIP Code"
                                            value={shippingAddress.zipCode}
                                            onChange={(e) =>
                                                setShippingAddress((prev) => ({
                                                    ...prev,
                                                    zipCode: e.target.value,
                                                }))
                                            }
                                            error={errors.zipCode}
                                            required
                                        />
                                        <Input
                                            label="Phone"
                                            value={shippingAddress.phone}
                                            onChange={(e) =>
                                                setShippingAddress((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value,
                                                }))
                                            }
                                            type="tel"
                                            placeholder="Optional"
                                        />
                                    </div>

                                    {/* Save address checkbox */}
                                    {isAuthenticated && (
                                        <label className="flex items-center gap-2 mt-4 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={saveAddress}
                                                onChange={(e) => setSaveAddress(e.target.checked)}
                                                className="accent-[var(--color-primary)]"
                                            />
                                            <span className="text-sm text-[var(--color-text-secondary)]">
                                                Save this address for future orders
                                            </span>
                                        </label>
                                    )}
                                </div>

                                {/* Billing Address */}
                                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                    <h2 className="text-lg font-bold mb-4">Billing Address</h2>
                                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                                        <input
                                            type="checkbox"
                                            checked={billingSameAsShipping}
                                            onChange={(e) =>
                                                setBillingSameAsShipping(e.target.checked)
                                            }
                                            className="accent-[var(--color-primary)]"
                                        />
                                        <span className="text-sm">Same as shipping address</span>
                                    </label>

                                    {!billingSameAsShipping && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                            <Input
                                                label="First Name"
                                                value={billingAddress.firstName}
                                                onChange={(e) =>
                                                    setBillingAddress((prev) => ({
                                                        ...prev,
                                                        firstName: e.target.value,
                                                    }))
                                                }
                                                error={errors.bilFirstName}
                                                required
                                            />
                                            <Input
                                                label="Last Name"
                                                value={billingAddress.lastName}
                                                onChange={(e) =>
                                                    setBillingAddress((prev) => ({
                                                        ...prev,
                                                        lastName: e.target.value,
                                                    }))
                                                }
                                                error={errors.bilLastName}
                                                required
                                            />
                                            <div className="sm:col-span-2">
                                                <Input
                                                    label="Address Line 1"
                                                    value={billingAddress.address1}
                                                    onChange={(e) =>
                                                        setBillingAddress((prev) => ({
                                                            ...prev,
                                                            address1: e.target.value,
                                                        }))
                                                    }
                                                    error={errors.bilAddress1}
                                                    required
                                                />
                                            </div>
                                            <Input
                                                label="City"
                                                value={billingAddress.city}
                                                onChange={(e) =>
                                                    setBillingAddress((prev) => ({
                                                        ...prev,
                                                        city: e.target.value,
                                                    }))
                                                }
                                                error={errors.bilCity}
                                                required
                                            />
                                            <Input
                                                label="State / Province"
                                                value={billingAddress.state}
                                                onChange={(e) =>
                                                    setBillingAddress((prev) => ({
                                                        ...prev,
                                                        state: e.target.value,
                                                    }))
                                                }
                                                error={errors.bilState}
                                                placeholder="State or Province"
                                                required
                                            />
                                            <Input
                                                label="ZIP Code"
                                                value={billingAddress.zipCode}
                                                onChange={(e) =>
                                                    setBillingAddress((prev) => ({
                                                        ...prev,
                                                        zipCode: e.target.value,
                                                    }))
                                                }
                                                error={errors.bilZipCode}
                                                required
                                            />
                                            <Input
                                                label="Phone"
                                                value={billingAddress.phone}
                                                onChange={(e) =>
                                                    setBillingAddress((prev) => ({
                                                        ...prev,
                                                        phone: e.target.value,
                                                    }))
                                                }
                                                type="tel"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 1: Delivery Method */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Truck size={20} className="text-[var(--color-primary)]" />
                                        Delivery Method
                                        {zoneName && (
                                            <span className="text-xs font-normal text-[var(--color-text-secondary)] ml-2">
                                                Zone: {zoneName}
                                            </span>
                                        )}
                                    </h2>
                                    {loadingMethods ? (
                                        <div className="flex items-center gap-2 py-6 justify-center text-[var(--color-text-secondary)]">
                                            <div className="animate-spin w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
                                            <span className="text-sm">
                                                Loading shipping options...
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {availableMethods.map((method) => {
                                                const methodKey = method.methodId || method.id;
                                                const isFree =
                                                    method.freeThreshold &&
                                                    subtotal >= method.freeThreshold;
                                                return (
                                                    <label
                                                        key={methodKey}
                                                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                                                            shippingMethod === methodKey
                                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                name="shipping"
                                                                checked={
                                                                    shippingMethod === methodKey
                                                                }
                                                                onChange={() =>
                                                                    setShippingMethod(methodKey)
                                                                }
                                                                className="accent-[var(--color-primary)] w-4 h-4"
                                                            />
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {method.label}
                                                                </p>
                                                                <p className="text-xs text-[var(--color-text-secondary)]">
                                                                    {method.estimatedDays ||
                                                                        method.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {isFree ? (
                                                                <span className="font-bold text-green-600 text-sm">
                                                                    FREE
                                                                </span>
                                                            ) : method.price === 0 ? (
                                                                <span className="font-bold text-green-600 text-sm">
                                                                    FREE
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-sm">
                                                                    $
                                                                    {(method.price / 100).toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Dynamic free shipping upsell */}
                                    {(() => {
                                        const standardMethod = availableMethods.find(
                                            (m) =>
                                                (m.methodId || m.id) === "standard" &&
                                                m.freeThreshold
                                        );
                                        if (
                                            standardMethod &&
                                            subtotal < standardMethod.freeThreshold
                                        ) {
                                            const remaining = (
                                                (standardMethod.freeThreshold - subtotal) /
                                                100
                                            ).toFixed(2);
                                            return (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-sm text-blue-700">
                                                        💡 Add{" "}
                                                        <span className="font-bold">
                                                            ${remaining}
                                                        </span>{" "}
                                                        more for free standard shipping!
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                {/* Order Note */}
                                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                    <h2 className="text-lg font-bold mb-4">Order Note</h2>
                                    <textarea
                                        value={customerNote}
                                        onChange={(e) => setCustomerNote(e.target.value)}
                                        placeholder="Any special instructions for your order? (Optional)"
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-none bg-white"
                                    />
                                </div>

                                {/* Shipping address summary */}
                                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-sm flex items-center gap-2">
                                            <MapPin
                                                size={16}
                                                className="text-[var(--color-primary)]"
                                            />
                                            Shipping To
                                        </h3>
                                        <button
                                            onClick={() => setCurrentStep(0)}
                                            className="text-xs text-[var(--color-primary)] hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {shippingAddress.firstName} {shippingAddress.lastName}
                                        <br />
                                        {shippingAddress.address1}
                                        {shippingAddress.address2 && (
                                            <>, {shippingAddress.address2}</>
                                        )}
                                        <br />
                                        {shippingAddress.city},{" "}
                                        {getStateDisplayName(shippingAddress.state)}
                                        {shippingAddress.zipCode && ` ${shippingAddress.zipCode}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Review & Payment */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                {/* Order Review */}
                                <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Package
                                            size={20}
                                            className="text-[var(--color-primary)]"
                                        />
                                        Review Your Order
                                    </h2>
                                    <div className="divide-y divide-[var(--color-border)]">
                                        {items.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                                            >
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm truncate">
                                                        {item.name}
                                                    </h4>
                                                    {item.variantInfo && (
                                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                                            {Object.entries(item.variantInfo)
                                                                .map(([k, v]) => `${k}: ${v}`)
                                                                .join(", ")}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-sm whitespace-nowrap">
                                                    $
                                                    {((item.price * item.quantity) / 100).toFixed(
                                                        2
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Address & Shipping Summary */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-sm">Shipping Address</h3>
                                            <button
                                                onClick={() => setCurrentStep(0)}
                                                className="text-xs text-[var(--color-primary)] hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            {shippingAddress.firstName} {shippingAddress.lastName}
                                            <br />
                                            {shippingAddress.address1}
                                            <br />
                                            {shippingAddress.city},{" "}
                                            {getStateDisplayName(shippingAddress.state)}
                                            {shippingAddress.zipCode && ` ${shippingAddress.zipCode}`}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-sm">Delivery Method</h3>
                                            <button
                                                onClick={() => setCurrentStep(1)}
                                                className="text-xs text-[var(--color-primary)] hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            {
                                                availableMethods.find(
                                                    (m) => (m.methodId || m.id) === shippingMethod
                                                )?.label
                                            }
                                            <br />
                                            {availableMethods.find(
                                                (m) => (m.methodId || m.id) === shippingMethod
                                            )?.estimatedDays ||
                                                availableMethods.find(
                                                    (m) => (m.methodId || m.id) === shippingMethod
                                                )?.description}
                                        </p>
                                    </div>
                                </div>

                                {showStripe && clientSecret ? (
                                    <PaymentWrapper
                                        clientSecret={clientSecret}
                                        orderId={stripeOrderId}
                                        amount={total}
                                        onSuccess={async () => {
                                            await refreshCart();
                                            router.push(
                                                `/checkout/confirmation?order_id=${stripeOrderId}`
                                            );
                                        }}
                                        onCancel={() => setShowStripe(false)}
                                    />
                                ) : (
                                    <>
                                        {/* Payment Selection Info */}
                                        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <CreditCard
                                                    size={20}
                                                    className="text-[var(--color-primary)]"
                                                />
                                                Payment Method
                                            </h2>
                                            <div className="p-4 border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5 rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                                        <CreditCard
                                                            size={20}
                                                            className="text-[var(--color-primary)]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">
                                                            Credit / Debit Card
                                                        </p>
                                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                                            Secure payment via Stripe
                                                        </p>
                                                    </div>
                                                </div>
                                                <Check
                                                    className="text-[var(--color-primary)]"
                                                    size={20}
                                                />
                                            </div>
                                        </div>

                                        {/* Place Order Button */}
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={placingOrder}
                                            className="w-full py-4 bg-[var(--color-primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--color-primary-dark)] transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[var(--color-primary)]/25"
                                        >
                                            {placingOrder ? (
                                                <>
                                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={20} />
                                                    Confirm & Pay — ${(total / 100).toFixed(2)}
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}

                                {/* Trust badges */}
                                <div className="flex items-center justify-center gap-6 text-xs text-[var(--color-text-secondary)]">
                                    <span className="flex items-center gap-1">
                                        <Shield size={14} /> Secure Checkout
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Lock size={14} /> SSL Encrypted
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {currentStep < 2 && (
                            <div className="flex items-center justify-between pt-4">
                                {currentStep > 0 ? (
                                    <button
                                        onClick={goBack}
                                        className="flex items-center gap-2 px-6 py-3 border border-[var(--color-border)] rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                                    >
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                ) : (
                                    <div />
                                )}
                                <button
                                    onClick={goNext}
                                    className="flex items-center gap-2 px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition shadow-lg shadow-[var(--color-primary)]/25"
                                >
                                    Continue <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
                                <h3 className="font-bold text-lg mb-4">Order Summary</h3>

                                {/* Items */}
                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={item._id} className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                        N/A
                                                    </div>
                                                )}
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-primary)] text-white text-xs rounded-full flex items-center justify-center">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {item.name}
                                                </p>
                                            </div>
                                            <p className="text-sm font-medium whitespace-nowrap">
                                                ${((item.price * item.quantity) / 100).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--color-text-secondary)]">
                                            Subtotal ({itemCount} items)
                                        </span>
                                        <span>${(subtotal / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--color-text-secondary)]">
                                            Shipping
                                        </span>
                                        <span>
                                            {shippingCost === 0 ? (
                                                <span className="text-green-600 font-medium">
                                                    FREE
                                                </span>
                                            ) : (
                                                `$${(shippingCost / 100).toFixed(2)}`
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--color-text-secondary)]">
                                            Estimated Tax
                                        </span>
                                        <span>${(taxAmount / 100).toFixed(2)}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 flex items-center gap-1 font-medium">
                                                <Tag size={14} /> Coupon ({appliedCoupon.code})
                                                <button
                                                    onClick={removeCoupon}
                                                    className="text-red-500 hover:text-red-700 ml-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                            <span className="text-green-600 font-bold">
                                                -${(discountAmount / 100).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t border-[var(--color-border)] pt-3 mt-3">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-[var(--color-primary)]">
                                                ${(total / 100).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            {!appliedCoupon && (
                                <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleApplyCoupon();
                                                    }
                                                }}
                                                placeholder="Coupon code"
                                                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 text-sm uppercase"
                                            />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleApplyCoupon();
                                            }}
                                            disabled={validatingCoupon || !couponCode.trim()}
                                            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50"
                                        >
                                            {validatingCoupon ? "..." : "Apply"}
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className="mt-1.5 text-xs text-red-500 font-medium">
                                            {couponError}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Trust Signals */}
                            <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                        <Shield size={16} className="text-green-500" />
                                        <span>Secure 256-bit SSL encryption</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                        <Truck size={16} className="text-blue-500" />
                                        <span>Free shipping on orders over $50</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                        <Package size={16} className="text-purple-500" />
                                        <span>30-day return policy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
