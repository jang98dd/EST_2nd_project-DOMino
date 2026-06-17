const cart = "cart";

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
  const cartItems = getFromStorage(cart, []);
  return cartItems.reduce((total, item) => total + item.qty, 0);
}

export function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (!cartCount) return;

  cartCount.textContent = getCartCount();
}

export function addToCart(product, qty = 1) {
  if (!product) return;

  const cartItems = getFromStorage(cart, []);

  const existingItem = cartItems.find(
    item => item.id === product.id
  );

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      image: product.image || product.thumbnail || "",
      qty,
    });
  }

  saveToStorage(cart, cartItems);
  updateCartCount();
}