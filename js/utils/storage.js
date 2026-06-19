export function getFromStorage(key, defaultValue = null) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`스토리지 읽기 오류 (${key}):`, error);
    return defaultValue;
  }
}

export function saveToStorage(key, data) {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`스토리지 저장 오류 (${key}):`, error);
  }
}

export function getCartCount() {
  const currentCart = getFromStorage("cart", []);
  return currentCart.reduce((total, item) => total + item.qty, 0);
}

export function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    cartCount.textContent = getCartCount();
  }
  window.dispatchEvent(new CustomEvent("cartUpdated"));
}

export function addToCart(product, qty = 1) {
  if (!product) return;
  
  const currentCart = getFromStorage("cart", []);
  const productId = String(product.id);
  const existingItem = currentCart.find(item => String(item.id) === productId);

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    currentCart.push({
      id: productId,
      brand: product.brand || '',
      title: product.title || '',
      price: product.price || 0,
      thumbnail: product.thumbnail || '',
      qty,
    });
  }

  saveToStorage("cart", currentCart);
  updateCartCount();
}
export function getWishlistCount() {
  const currentWishlist = getFromStorage("wishlist", []);
  return currentWishlist.length;
}

export function updateWishlistCount() {
  const wishlistCount = document.querySelector(".wishlist-count");
  if (wishlistCount) {
    wishlistCount.textContent = getWishlistCount();
  }
  window.dispatchEvent(new CustomEvent("wishlistUpdated"));
}

export function toggleWishlist(product) {
  if (!product) return;
  
  const currentWishlist = getFromStorage("wishlist", []);
  const productId = String(product.id);
  const index = currentWishlist.findIndex(item => String(item.id) === productId);

  if (index !== -1) {
    currentWishlist.splice(index, 1);
  } else {
    currentWishlist.push({
      id: productId,
      brand: product.brand || '',
      title: product.title || '',
      price: product.price || 0,
      thumbnail: product.thumbnail || '',
    });
  }

  saveToStorage("wishlist", currentWishlist);
  updateWishlistCount();
  
  return index === -1; 
}

export function isProductLiked(productId) {
  const currentWishlist = getFromStorage("wishlist", []);
  return currentWishlist.some(item => String(item.id) === String(productId));
}