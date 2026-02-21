import { redirect } from "next/navigation";

/**
 * Wishlist - Redirect to account wishlist
 * Wishlist has been moved to /account/wishlist
 */
export default function WishlistPage() {
    redirect("/account/wishlist");
}
