import { fetchProducts } from '../modules/fetchRender.js';

const state = {
  products: [],
  sortType: "popular"
};

const sorters = {
  popular: (a, b) => (b.id - a.id),
  priceLow: (a, b) => a.price - b.price,
  priceHigh: (a, b) => b.price - a.price,
  newest: (a, b) => b.id - a.id
}; 
const trigger = document.getElementById('sortTrigger');
const menu = document.getElementById('sortMenu');

trigger.addEventListener('click', () => {
  menu.classList.toggle('is-open');
});

menu.addEventListener('click', (e) => {
  if (!e.target.dataset.sort) return;

  state.sortType = e.target.dataset.sort;
  renderProducts();

  trigger.innerHTML = `${e.target.textContent} <span class="material-icons">keyboard_arrow_down</span>`;
  menu.classList.remove('is-open');
});
/* 초기화 */
async function initProductList() {
  await loadProducts();
  renderProducts();
  initSort();
}
function initSort() {
  const btns = document.querySelectorAll('[data-sort]');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.sortType = btn.dataset.sort;
      renderProducts();
      updateActiveUI(btn);
    });
  });
}
function updateActiveUI(activeBtn) {
  document.querySelectorAll('[data-sort]').forEach(btn => btn.classList.remove('is-active'));

  activeBtn.classList.add('is-active');
}
/* 데이터 */
async function loadProducts() {
  const products = await fetchProducts();
  state.products = products;
  console.log(products);
}
initProductList();
/* 렌더링 */
function renderProducts() {
  const container = document.querySelector('.product-cards');
  const sorted = sortProducts();
  container.innerHTML = sorted.map(createProductCard).join('');
  console.log(document.querySelector('.product-cards'));
}
function createProductCard(product) {
  return `
    <article class="product-card">
      <img src="${product.thumbnail}" alt="${product.title}"/>
      <p class="font-body-s-b-100">${product.brand}</p>
      <h3 class="font-body-sm">${product.title}</h3>
      <p class="font-body-s-b-100">${product.price}</p>
    </article>`;
}

function renderSkeleton() {

}
function renderError() {

}

/* 필터 */
function applyFilters() {

}
function handleFilterApply() {

}
function resetFilters() {

}

/* 정렬 */
function sortProducts() {
  const sortFn = sorters[state.sortType];
  return [...state.products].sort(sortFn);
}
function handleSortChange() {

}

/* 더보기 */
function handleLoadMore() {

}

/* 바텀시트 */
function initBottomSheet() {
  const handle = document.querySelector('.handle');
  const panel = document.querySelector('.bottom-sheet__panel');

  let startY = 0;
  let currentY = 0;
  let diff = 0;
  let isDragging = false;

  handle.addEventListener('pointerdown', (e) => {
    startY = e.clientY;
    isDragging = true;
    panel.style.transform = 'none';
  });
  handle.addEventListener('pointermove', (e) => {
    if(!isDragging) return;

    currentY = e.clientY;
    diff = currentY - startY;
    
    if(diff > 0) {
      requestAnimationFrame(() => {
        panel.style.transform = `translateY(${diff}px)`;
      });
    }
  });
  handle.addEventListener('pointerup', () => {
    isDragging = false;
    panel.style.transition = 'transform .3s ease';

    if(diff > 80) {
      closeSheet();
    } else {
      panel.style.transform = 'translateY(0)';
    }
  });
}
initBottomSheet();
function openFilterSheet() {

}
function closeFilterSheet() {

}
function toggleFilterSheet() {

}
