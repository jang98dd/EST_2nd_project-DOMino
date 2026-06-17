/**
 * 장바구니 페이지 스크립트
 */

import { formatPrice, parsePrice } from '../utils/formatter.js';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage.js';

// ========================================
// 상태 관리
// ========================================

const cartState = {
  items: [], // 장바구니 아이템
  selectedIds: new Set(), // 선택된 아이템 ID들
};

// ========================================
// DOM 선택자
// ========================================

const DOM = {
  selectAllCheckbox: document.getElementById('select-all'),
  deleteSelectedBtn: document.getElementById('delete-selected'),
  productsList: document.getElementById('products-list'),
  emptyCart: document.querySelector('.empty-cart'),
  subtotalEl: document.getElementById('subtotal'),
  shippingEl: document.getElementById('shipping'),
  discountRow: document.getElementById('discount-row'),
  discountEl: document.getElementById('discount'),
  totalEl: document.getElementById('total'),
  checkoutBtn: document.getElementById('checkout-btn'),
  continueShoppingBtn: document.querySelector('.continue-shopping-btn'),
};

// ========================================
// 상수
// ========================================

const CONFIG = {
  SHIPPING_COST: 3000,
  FREE_SHIPPING_THRESHOLD: 50000,
  DISCOUNT_RATE: 0.1, // 10% 할인 (테스트용)
  DISCOUNT_THRESHOLD: 100000, // 100,000원 이상 할인
};

// ========================================
// 초기화
// ========================================

function init() {
  loadCartFromStorage();
  renderProducts();
  attachEventListeners();
  calculateTotal();
  updateUI();
}

// ========================================
// 데이터 로드/저장
// ========================================

function loadCartFromStorage() {
  const stored = getFromStorage(STORAGE_KEYS.CART, []);
  cartState.items = stored.length > 0 ? stored : getDefaultCartItems();
  saveToStorage(STORAGE_KEYS.CART, cartState.items);
}

function saveCartToStorage() {
  saveToStorage(STORAGE_KEYS.CART, cartState.items);
}

/**
 * 기본 테스트 아이템들
 */
function getDefaultCartItems() {
  return [
    {
      id: 1,
      name: '선글라스',
      description: '고급 스타일의 자외선 차단 선글라스',
      price: 39000,
      quantity: 1,
      image: 'assets/placeholder.jpg',
    },
    {
      id: 2,
      name: '스포츠 모자',
      description: '편안한 착용감의 스포츠 모자',
      price: 29000,
      quantity: 2,
      image: 'assets/placeholder.jpg',
    },
  ];
}

// ========================================
// 렌더링
// ========================================

function renderProducts() {
  if (cartState.items.length === 0) {
    DOM.productsList.style.display = 'none';
    DOM.emptyCart.style.display = 'block';
    return;
  }

  DOM.productsList.style.display = 'flex';
  DOM.emptyCart.style.display = 'none';
  DOM.productsList.innerHTML = cartState.items
    .map((item) => createProductCardHTML(item))
    .join('');

  attachProductEventListeners();
}

function createProductCardHTML(item) {
  const isSelected = cartState.selectedIds.has(item.id);
  const selectedClass = isSelected ? 'selected' : '';

  return `
    <div class="product-card ${selectedClass}" data-id="${item.id}">
      <input class="product-checkbox" type="checkbox" ${isSelected ? 'checked' : ''} />
      <div class="product-image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="product-details">
        <h3 class="product-name">${item.name}</h3>
        <p class="product-description">${item.description}</p>
        <div class="product-price-row">
          <span class="product-price">${formatPrice(item.price)}</span>
        </div>
        <div class="quantity-controls">
          <button class="qty-btn qty-decrease" aria-label="수량 감소">−</button>
          <span class="qty-value" data-id="qty-${item.id}">${item.quantity}</span>
          <button class="qty-btn qty-increase" aria-label="수량 증가">+</button>
        </div>
      </div>
      <button class="product-remove" aria-label="제품 제거">×</button>
    </div>
  `;
}

// ========================================
// 이벤트 리스너
// ========================================

function attachEventListeners() {
  // 전체 선택
  DOM.selectAllCheckbox?.addEventListener('change', (e) => {
    handleSelectAll(e.target.checked);
  });

  // 선택 삭제
  DOM.deleteSelectedBtn?.addEventListener('click', handleDeleteSelected);

  // 계속 쇼핑하기
  DOM.continueShoppingBtn?.addEventListener('click', () => {
    window.location.href = 'product-list.html';
  });

  // 구매하기
  DOM.checkoutBtn?.addEventListener('click', handleCheckout);
}

function attachProductEventListeners() {
  const cards = document.querySelectorAll('.product-card');

  cards.forEach((card) => {
    const id = parseInt(card.dataset.id, 10);
    const checkbox = card.querySelector('.product-checkbox');
    const decreaseBtn = card.querySelector('.qty-decrease');
    const increaseBtn = card.querySelector('.qty-increase');
    const removeBtn = card.querySelector('.product-remove');

    checkbox?.addEventListener('change', () => {
      handleProductCheckboxChange(id, checkbox.checked);
    });

    decreaseBtn?.addEventListener('click', () => {
      handleQuantityChange(id, -1);
    });

    increaseBtn?.addEventListener('click', () => {
      handleQuantityChange(id, 1);
    });

    removeBtn?.addEventListener('click', () => {
      handleRemoveProduct(id);
    });
  });
}

// ========================================
// 이벤트 핸들러
// ========================================

function handleSelectAll(checked) {
  if (checked) {
    cartState.items.forEach((item) => {
      cartState.selectedIds.add(item.id);
    });
  } else {
    cartState.selectedIds.clear();
  }

  updateUI();
  renderProducts();
}

function handleProductCheckboxChange(id, checked) {
  if (checked) {
    cartState.selectedIds.add(id);
  } else {
    cartState.selectedIds.delete(id);
  }

  updateSelectAllCheckbox();
  calculateTotal();
}

function handleQuantityChange(id, delta) {
  const item = cartState.items.find((p) => p.id === id);
  if (!item) return;

  item.quantity = Math.max(1, item.quantity + delta);
  saveCartToStorage();
  renderProducts();
  calculateTotal();
}

function handleRemoveProduct(id) {
  if (confirm('이 상품을 제거하시겠습니까?')) {
    cartState.items = cartState.items.filter((item) => item.id !== id);
    cartState.selectedIds.delete(id);
    saveCartToStorage();
    renderProducts();
    updateSelectAllCheckbox();
    calculateTotal();
  }
}

function handleDeleteSelected() {
  if (cartState.selectedIds.size === 0) {
    alert('선택된 상품이 없습니다.');
    return;
  }

  if (
    confirm(
      `${cartState.selectedIds.size}개의 상품을 삭제하시겠습니까?`
    )
  ) {
    cartState.items = cartState.items.filter(
      (item) => !cartState.selectedIds.has(item.id)
    );
    cartState.selectedIds.clear();
    saveCartToStorage();
    renderProducts();
    updateSelectAllCheckbox();
    calculateTotal();
  }
}

function handleCheckout() {
  if (cartState.items.length === 0) {
    alert('장바구니가 비어있습니다.');
    return;
  }

  const subtotal = calculateSubtotal();
  alert(
    `총 ${formatPrice(subtotal)}의 구매를 진행하시겠습니까?\n\n(결제 기능은 준비 중입니다)`
  );
}

// ========================================
// 계산 함수
// ========================================

/**
 * 소계 계산
 */
function calculateSubtotal() {
  return cartState.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}

/**
 * 배송료 계산
 */
function calculateShipping(subtotal) {
  if (subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return CONFIG.SHIPPING_COST;
}

/**
 * 할인 계산
 */
function calculateDiscount(subtotal) {
  if (subtotal >= CONFIG.DISCOUNT_THRESHOLD) {
    return Math.floor(subtotal * CONFIG.DISCOUNT_RATE);
  }
  return 0;
}

/**
 * 총액 계산 및 UI 업데이트
 */
function calculateTotal() {
  const subtotal = calculateSubtotal();
  const shipping = calculateShipping(subtotal);
  const discount = calculateDiscount(subtotal);
  const total = subtotal + shipping - discount;

  // DOM 업데이트
  if (DOM.subtotalEl) DOM.subtotalEl.textContent = formatPrice(subtotal);
  if (DOM.shippingEl) DOM.shippingEl.textContent = formatPrice(shipping);

  if (discount > 0) {
    DOM.discountRow.style.display = 'flex';
    DOM.discountEl.textContent = formatPrice(-discount);
  } else {
    DOM.discountRow.style.display = 'none';
  }

  if (DOM.totalEl) DOM.totalEl.textContent = formatPrice(total);

  // 구매 버튼 활성화/비활성화
  if (DOM.checkoutBtn) {
    DOM.checkoutBtn.disabled = cartState.items.length === 0;
  }
}

// ========================================
// UI 업데이트
// ========================================

function updateSelectAllCheckbox() {
  if (!DOM.selectAllCheckbox) return;

  const allSelected = cartState.items.every((item) =>
    cartState.selectedIds.has(item.id)
  );
  const someSelected = cartState.selectedIds.size > 0;

  DOM.selectAllCheckbox.checked = allSelected && someSelected;
  DOM.selectAllCheckbox.indeterminate = someSelected && !allSelected;
}

function updateUI() {
  updateSelectAllCheckbox();
  calculateTotal();

  // 선택삭제 버튼 활성화/비활성화
  if (DOM.deleteSelectedBtn) {
    DOM.deleteSelectedBtn.disabled = cartState.selectedIds.size === 0;
  }
}

// ========================================
// 시작
// ========================================

document.addEventListener('DOMContentLoaded', init);

// 핫 리로드 (개발 중)
if (module.hot) {
  module.hot.accept(() => {
    location.reload();
  });
}
