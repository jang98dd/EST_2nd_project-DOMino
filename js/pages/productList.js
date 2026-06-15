import { fetchProducts } from "../modules/fetchRender.js";

const state = {
  products: [],
  
  sortType: "popular",

  filters: {
    shape: [],
    gender: 'all',
    size: [],
    color: [],
    price: 500000
  },

  page: 1,
  limit: 12
};
let isSheetOpen = false;

const productCards = document.querySelector('.product-cards');
async function init() {
  const data = await fetchProducts();
  console.log(state.products);

  state.products = data.products;
  initLikeButton();  
  updateView();
  bindUI();
}
init();

function updateView() {
  let products = [...state.products];
  console.log(state.products);
  state.filteredProducts = products;
  const paginatedProducts = applyPagination(products);
  products = applyPagination(products);
  renderProducts(paginatedProducts);
  renderProductCount();
  updateLoadMoreButton();
}
function renderProducts(products) {
  const container = document.querySelector('.product-cards');

  container.innerHTML = products
    .map(createProductCard)
    .join('');
}
function renderProductCount() {
  const visibleCount = Math.min(state.page * state.limit, 
    state.filteredProducts.length
  );
  const totalCount = state.filteredProducts.length;
  const countElement = document.querySelector('.product-count');
  countElement.innerHTML = `<span class="sr-only">전체 상품 수</span>
  ${visibleCount} / ${totalCount}개의 상품`
}
function createProductCard(product) {
  return `
    <article class="product-card">
      <div class="product-card__thumb">
      <img src="${product.thumbnail}" alt="${product.title}">
      <button class="btn-like btn--utility-sm" aria-pressed="false" aria-label="찜하기"><span class="material-icons">favorite_border</span></button>
      <button class="btn-fit btn--utility-sm font-body-sm">착용하기</button>
      </div>
      <p>${product.brand}</p>
      <h3>${product.title}</h3>
      <p>${product.price}</p>
    </article>`;
}
function initLikeButton() {
  productCards.addEventListener('click', handleLikeClick);
}

function handleLikeClick(e) {
  const likeBtn = e.target.closest('.btn-like');

  if(!likeBtn) return;

  toggleLikeButton(likeBtn);
}

function toggleLikeButton(button) {
  const icon = button.querySelector('.material-icons');

  const isLiked = button.getAttribute('aria-pressed') === 'true';

  button.setAttribute('aria-pressed', String(!isLiked));
  icon.textContent = isLiked ? "favorite_border" : "favorite";
}
function handleLoadMore() {
  state.page += 1;
  console.log('page:', state.page);
  updateView();
}

const excluded_product_count = 1;
function applyPagination(products) {
  const end = excluded_product_count + state.page * state.limit;

  return products.slice(excluded_product_count, end);
}
function updateLoadMoreButton() {
  const btn = document.querySelector('.btn-more');

  const visibleCount = state.page * state.limit;

  btn.hidden = visibleCount >= state.filteredProducts.length;
}
function bindUI() {
  const loadMoreBtn = document.querySelector('.btn-more');
  loadMoreBtn.addEventListener('click', handleLoadMore);
}