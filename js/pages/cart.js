import { getFromStorage, saveToStorage, updateCartCount } from '../utils/storage.js';
import { formatPrice } from '../utils/formatter.js';

// ── DOM ──────────────────────────────────────────────────────────────────────
const productsList = document.querySelector('.products-list');
const selectAllCheckbox = document.querySelector('.select-all-checkbox');
const checkboxLabel = document.querySelector('.checkbox-label');
const deleteSelectedBtn = document.querySelector('#delete-selected');
const subtotalEl = document.querySelector('#subtotal');
// const shippingEl = document.querySelector('#shipping');
const totalEl = document.querySelector('#total');
const checkoutBtn = document.querySelector('#checkout-btn');

// const SHIPPING_COST = 3000;
// const FREE_SHIPPING_THRESHOLD = 50000;

let cart = getFromStorage('cart', []);
let selectedIds = new Set();


function renderCart() {
  if (cart.length === 0) {
    productsList.innerHTML = `
      <div class="empty-cart">
        <p>장바구니가 비어있습니다.</p>
      </div>
    `;
    updateSelectState();
    updateTotalAmount();
    return;
  }

  productsList.innerHTML = cart
    .map(
      item => `
    <div class="product-card" data-id="${item.id}">
      <input class="product-checkbox" type="checkbox" ${selectedIds.has(item.id) ? 'checked' : ''} />
      <div class="product-image">
        <img src="${item.image}" alt="${item.name}" />
      </div>
      <div class="product-details">
        <p class="product-description">${item.name}</p>
        <span class="product-price">${formatPrice(item.price)}</span>
        <div class="quantity-controls">
          <button class="qty-btn qty-decrease" aria-label="수량 감소">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn qty-increase" aria-label="수량 증가">+</button>
        </div>
      </div>
      <button class="product-remove" aria-label="${item.name} 삭제">×</button>
    </div>
  `,
    )
    .join('');

  updateSelectState();
  updateTotalAmount();
}

function updateSelectState() {
  const checkboxes = getCheckboxes();
  const checkedCount = checkboxes.filter(cb => cb.checked).length;

  checkboxLabel.textContent = `전체선택 (${checkedCount}/${checkboxes.length})`;
  selectAllCheckbox.checked = checkedCount > 0 && checkedCount === checkboxes.length;
  selectedIds = new Set(getCheckedIds());
}

function updateTotalAmount() {
  const subtotal = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  // const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  // const total = subtotal + shipping;
  // shippingEl.textContent = formatPrice(shipping);
  subtotalEl.textContent = formatPrice(subtotal);
  
  totalEl.textContent = formatPrice(subtotal);

  if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
}

function saveCart() {
  saveToStorage('cart', cart);
  updateCartCount();
}


function getCheckboxes() {
  return [...productsList.querySelectorAll('.product-card .product-checkbox')];
}

function getCheckedIds() {
  return getCheckboxes()
    .filter(cb => cb.checked)
    .map(cb => Number(cb.closest('.product-card').dataset.id));
}


// 수량 증감 / 개별 삭제
productsList.addEventListener('click', e => {
  const card = e.target.closest('.product-card');
  if (!card) return;
  const id = Number(card.dataset.id);
  const item = cart.find(i => i.id === id);

  if (e.target.closest('.qty-decrease')) {
    if (item.qty > 1) {
      item.qty--;
      saveCart();
      renderCart();
    }
    return;
  }

  if (e.target.closest('.qty-increase')) {
    item.qty++;
    saveCart();
    renderCart();
    return;
  }

  if (e.target.closest('.product-remove')) {
    cart = cart.filter(i => i.id !== id);
    selectedIds.delete(id);
    saveCart();
    renderCart();
    return;
  }
});

// 개별 체크박스
productsList.addEventListener('change', e => {
  if (e.target.matches('.product-checkbox')) {
    updateSelectState();
  }
});

// 전체 선택
selectAllCheckbox.addEventListener('change', e => {
  getCheckboxes().forEach(cb => (cb.checked = e.target.checked));
  updateSelectState();
});

// 선택 삭제
deleteSelectedBtn.addEventListener('click', () => {
  const checkedIds = getCheckedIds();
  if (checkedIds.length === 0) return;
  cart = cart.filter(item => !checkedIds.includes(item.id));
  selectedIds.clear();
  saveCart();
  renderCart();
});

// 구매하기
checkoutBtn?.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('장바구니가 비어있습니다.');
    return;
  }
  const subtotal = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  alert(`총 ${formatPrice(subtotal)}의 구매를 진행합니다.\n(결제 기능 준비 중)`);
});

// ── 초기화 ────────────────────────────────────────────────────────────────────
updateCartCount();
renderCart();
