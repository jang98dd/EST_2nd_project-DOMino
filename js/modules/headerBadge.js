import { 
  updateCartCount, 
  updateWishlistCount, 
  getCartCount, 
  getWishlistCount 
} from "../utils/storage.js";

export function initHeaderBadge(headerRoot) {
  const cartBtn = headerRoot.querySelector(".cart-btn");
  const wishlistBtn = headerRoot.querySelector(".wishlist-btn");
  if (cartBtn) {
    cartBtn.onclick = () => {
      window.location.href = "/cart.html"; 
    };
    if (!cartBtn.querySelector(".cart-count")) {
      const badge = document.createElement("span");
      badge.className = "cart-count"; 
      cartBtn.appendChild(badge);
    }
  }

  if (wishlistBtn) {
    wishlistBtn.onclick = () => {
      window.location.href = "/cart.html";
    };
    if (!wishlistBtn.querySelector(".wishlist-count")) {
      const badge = document.createElement("span");
      badge.className = "wishlist-count"; 
      wishlistBtn.appendChild(badge);
    }
  }
  renderHeaderBadges(headerRoot);
}

function renderHeaderBadges(headerRoot) {
  updateCartCount();
  updateWishlistCount();

  const cartCountEl = headerRoot.querySelector(".cart-count");
  if (cartCountEl) {
    cartCountEl.style.display = getCartCount() > 0 ? "inline-block" : "none";
  }

  const wishlistCountEl = headerRoot.querySelector(".wishlist-count");
  if (wishlistCountEl) {
    wishlistCountEl.style.display = getWishlistCount() > 0 ? "inline-block" : "none";
  }
}