import { fetchProducts } from "../modules/fetchRender.js";
import { 
  addToCart, 
  toggleWishlist, 
  isProductLiked, 
  updateCartCount, 
  updateWishlistCount 
} from "../utils/storage.js"; 

const state = {
  products: [],
  baseProducts: [],  
  totalProducts: [],
  filteredProducts: [],
  isLoading: true,
  sortType: "popular",
  filters: {
    shape: [],
    gender: "all",
    size: [],
    color: [],
    price: Infinity
  },
  page: 1,
  limit: 12
};

const SNAP = {
  full: 0,
  half: window.innerHeight * 0.4,
  closed: window.innerHeight
};

let currentY = window.innerHeight;
let isDragging = false;
let startY = 0;
let startSheetY = 0;
let lastY = 0;
let lastTime = 0;
let velocity = 0;
const sheet = document.querySelector(".bottom-sheet");
const panel = document.querySelector(".bottom-sheet__panel");
const handle = document.querySelector(".handle");
const backdrop = document.querySelector(".bottom-sheet__backdrop");

const productCards = document.querySelector(".product-cards");
const sortTrigger = document.querySelector(".sort-trigger");
const sortMenu = document.querySelector(".sort-menu");
if (sortTrigger && sortMenu) {
  sortTrigger.addEventListener("click", () => {
    const open = sortMenu.classList.toggle("is-open");
    sortTrigger.setAttribute("aria-expanded", open);
  });
}

document.querySelectorAll("[data-sort]").forEach((el) => {
  el.addEventListener("click", () => {
    state.sortType = el.dataset.sort;
    state.page = 1;

    if (sortMenu) sortMenu.classList.remove("is-open");
    if (sortTrigger) sortTrigger.setAttribute("aria-expanded", "false");

    updateView();
  });
});
function bindEvents() {
  const openRecommendBtn = document.getElementById('openFrameRecommend');
  const recommendSheet = document.getElementById('recommendSheet');
  const closeRecommendElements = document.querySelectorAll('[data-close="recommend"]');

  if (openRecommendBtn && recommendSheet) {
    openRecommendBtn.addEventListener('click', () => {
      recommendSheet.removeAttribute('hidden');
    });
  }

  closeRecommendElements.forEach((element) => {
    element.addEventListener('click', () => {
      recommendSheet.setAttribute('hidden', '');
    });
  });
}
function bindTopCategories() {
  const categoryBtns = document.querySelectorAll('.btn-category');
  if (!categoryBtns.length) return;

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryBtns.forEach(b => b.classList.remove('is-active'));
      e.currentTarget.classList.add('is-active');

      const selectedCategory = e.currentTarget.dataset.cat;
      console.log('클릭된 카테고리:', selectedCategory);
      handleCategoryChange(selectedCategory);
    });
  });
}
function handleCategoryChange(category) {
  
  if (category === 'wishlist') {
  } else if (category === 'all') {
  }
}
async function init() {
  bindUI();
  initBottomSheet();
  bindEvents();
  initFilters();   
  initSort();
  initProductCardClicks();
  bindChipEvents();
  bindBottomSheetFilters();
  bindSidebarFilters();

  bindTopCategories()

  updateCartCount();
  updateWishlistCount();

  state.isLoading = true;
  updateView();
  
  try {
    const data = await fetchProducts();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (data && data.products) {
      state.products = data.products.map(p => {
        const cleanedPrice = typeof p.price === 'number' 
          ? p.price 
          : Number(String(p.price || 0).replace(/[^0-9]/g, ''));

        return {
          ...p,
          price: cleanedPrice, 
          shape: (p.category || "").toLowerCase(),
          color: (p.color || "").toLowerCase(),
          size: (p.size || "m").toLowerCase(),
          gender: (p.gender || "all").toLowerCase()
        };
      });
    }

    state.baseProducts = [...state.products];

    const prices = state.baseProducts.map(p => p.price);
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 500000; 

    const priceInput = document.querySelector("#priceMax");
    if (priceInput) {
      priceInput.max = maxPrice;
      priceInput.value = maxPrice;
    }
    await loadRecommendations();
    
  } catch (error) {
    console.error("데이터를 불러오는 중 에러가 발생했습니다:", error);
  } finally {
    state.isLoading = false;
    updateView();
  }
}
init();
async function loadRecommendations() {
  try {
    const track = document.querySelector('.frame-track');
    if (!track) return; 

    const response = await fetch('/data/products.json'); 
    if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
    
    const data = await response.json();
    const recommendations = data.recommendations || data.products || (Array.isArray(data) ? data : null);
    
    if (!recommendations) throw new Error('상품 배열을 찾을 수 없습니다.');
    
    renderRecommendations(recommendations); 
  } catch (error) {
    console.error('추천 상품 에러 발생:', error);
  }
}

function renderRecommendations(products) {
  const track = document.querySelector('.frame-track');
  if (!track) return;
  track.innerHTML = products.map(product => `
    <article class="frame-card product-card">
      <a href="../product-detail.html?id=${product.id}">
        <img src="${product.image || product.thumbnail || ''}" alt="${product.name || product.title}" style="display:block; width:100%; border-radius: 8px;" />
        <h3 class="body-sm">${product.name || product.title}</h3>
        <p body-sm-bold--tight>₩${(product.price || 0).toLocaleString()}</p>
      </a>
    </article>
  `).join('');
}

function updateView() {
  const displayArea = document.querySelector(".product-display-area");
  if (displayArea) {
    displayArea.classList.toggle("is-loading", state.isLoading);
  }
  if (state.isLoading) {
    if (productCards) {
      productCards.innerHTML = Array.from({ length: 12 })
        .map(() => createSkeletonCard())
        .join("");
    }
    return;
  }
  
  const products = applySort(applyFilters([...state.baseProducts]));
  state.filteredProducts = products;
  const paginated = applyPagination(products);
  
  renderProducts(paginated);
  renderPagination();
  renderProductCount();
  updateLoadMoreButton();

  updateFilterUI();
  renderActiveFilterChips();
  updateFilterCountUI();
}

function initSort() {
  document.querySelectorAll("[data-sort]").forEach((el) => {
    el.addEventListener("click", () => {
      state.sortType = el.dataset.sort;
      state.page = 1;
      updateView();
    });
  });
}

function applySort(products) {
  const sorted = [...products];
  switch (state.sortType) {
    case "popular":
      return sorted.sort((a, b) => (b.popular ?? 0) - (a.popular ?? 0));
    case "newest":
      return sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    case "priceLow":
      return sorted.sort((a, b) => a.price - b.price);
    case "priceHigh":
      return sorted.sort((a, b) => b.price - a.price);
    case "sales":
      return sorted.sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0));
    default:
      return sorted;
  }
}

const DEFAULT_PRICE = Infinity;

function applyFilters(products) {
  const f = state.filters;

  return products.filter(p => {
    const ok =
      (f.shape.length === 0 || f.shape.includes(p.shape)) &&
      (f.size.length === 0 || f.size.includes(p.size)) &&
      (f.color.length === 0 || f.color.includes(p.color)) &&
      (f.gender === "all" || p.gender === f.gender) &&
      (f.price === Infinity || p.price <= f.price);

    return ok;
  });
}

function toggleFilter(type, value) {
  const arr = state.filters[type];
  const normalizedValue = String(value).toLowerCase();

  const idx = arr.indexOf(normalizedValue);
  if (idx === -1) arr.push(normalizedValue);
  else arr.splice(idx, 1);

  state.page = 1;
  updateView(); 
}

function setGender(value) {
  state.filters.gender = String(value).toLowerCase();
  state.page = 1;
  updateFilterUI();
  updateView();
}

function setPrice(value) {
  state.filters.price = Number(value);
  state.page = 1;
  updateView();
}

function resetFilters() {
  state.filters = {
    shape: [],
    gender: "all",
    size: [],
    color: [],
    price: DEFAULT_PRICE
  };

  state.page = 1;
  updateFilterUI();
  updateView();
}

function initFilters() {
  const inputs = document.querySelectorAll('input[data-filter-type]');

  inputs.forEach(el => el.addEventListener('change', (e) => {
    const type = e.target.dataset.filterType;
    if (e.target.dataset.role === 'all') {
      if (e.target.checked) {
        state.filters[type] = []; 
        document.querySelectorAll(`input[data-filter-type="${type}"]:not([data-role="all"])`)
          .forEach(cb => cb.checked = false);
      }
      state.page = 1;
      updateView();
    } else {
      handleNormalCheckbox(type, e.target);
    }
  }));

  const priceInput = document.querySelector("#priceMax");
  if (priceInput) {
    priceInput.addEventListener("input", (e) => {
      const value = Number(e.target.value);
      const max = Number(e.target.max);
      state.filters.price = (value === max) ? Infinity : value;
      state.page = 1;
      updateView();
    });
  }
}

function updateFilterUI() {
  document.querySelectorAll("[data-filter-type]").forEach((el) => {
    const type = el.dataset.filterType;
    if (type === 'price' || type === 'gender') return; 

    const rawValue = el.dataset.filterValue || el.value; 
    const value = String(rawValue || "").toLowerCase();
    const active = state.filters[type].includes(value);

    el.setAttribute("aria-pressed", String(active));
    el.classList.toggle("is-active", active);
    
    if (el.tagName === "INPUT" && el.dataset.role !== "all") {
      el.checked = active;
    }
  });

  document.querySelectorAll('input[data-role="all"]').forEach((allInput) => {
    const type = allInput.dataset.filterType;
    allInput.checked = state.filters[type].length === 0;
  });

  document.querySelectorAll("[data-gender], input[name='gender']").forEach((el) => {
    const val = String(el.dataset.gender || el.value).toLowerCase();
    const isActive = state.filters.gender === val;

    el.classList.toggle("is-active", isActive);
    el.setAttribute("aria-pressed", String(isActive));
    
    if (el.tagName === "INPUT" && el.type === "radio") {
      el.checked = isActive;
    }
  });

  const priceInput = document.querySelector("#priceMax");
  if (priceInput) {
    const isFilterOff = state.filters.price === Infinity;
    priceInput.value = isFilterOff ? priceInput.max : state.filters.price;
    
    const maxPriceText = document.querySelector(".price-current span:last-child");
    if (maxPriceText) {
      const displayPrice = isFilterOff ? priceInput.max : state.filters.price;
      maxPriceText.textContent = `₩${Number(displayPrice).toLocaleString()}`;
    }
  }
}

function renderProducts(list) {
  if (productCards) {
    productCards.innerHTML = list.map(createProductCard).join("");
  }
}
function createProductCard(product) {
  const formattedPrice = typeof product.price === 'number'
    ? `${product.price.toLocaleString()}원` 
    : product.price;

  const isLiked = isProductLiked(product.id);
  const iconText = isLiked ? "favorite" : "favorite_border";

  return `
    <article class="product-card" style="position: relative; cursor: pointer;">
      <a href="../product-detail.html?id=${product.id}" 
         class="product-card__main-link" 
         aria-label="${product.title} 상세 페이지로 이동">
      </a>
      <div class="product-card__thumb">
        <img src="${product.thumbnail}" alt="${product.title}" />
        
        <button class="btn-like btn--utility-sm"
          data-id="${product.id}"
          aria-pressed="${isLiked ? 'true' : 'false'}"
          aria-label="찜하기">
          <span class="material-icons">${iconText}</span>
        </button>

        <button class="btn-cart btn--utility-sm" 
          data-id="${product.id}" 
          aria-label="장바구니 담기">
          <span class="material-icons">shopping_cart</span>
        </button>

        <a href="../fitting-and-analysis.html?id=${product.id}" 
           class="btn-fit btn--utility-sm" data-id="${product.id}">
          착용하기
        </a>
      </div>
      <p class="body-sm-bold--tight">${product.brand}</p>
      <h3 class="body-sm">${product.title}</h3>
      <p class="price">${formattedPrice}</p>
    </article>
  `;
}
function createSkeletonCard() {
  return `
    <article class="product-card skeleton-card">
      <div class="product-card__thumb"></div>
      <p class="skeleton-text"></p>
      <h3 class="skeleton-text"></h3>
      <p class="skeleton-text"></p>
    </article>
  `;
}

function renderProductCount() {
  const total = state.baseProducts.length; 
  const visible = Math.min(state.page * state.limit, state.filteredProducts.length);
  const countEl = document.querySelector(".product-count");
  if (countEl) countEl.textContent = `${visible} / ${total}`;
}
function initProductCardClicks() {
  if (!productCards) return;

  productCards.addEventListener("click", (e) => {
    const likeBtn = e.target.closest(".btn-like");
    if (likeBtn) {
      e.stopPropagation(); 
      const productId = likeBtn.dataset.id; 
      const productData = state.baseProducts.find(p => String(p.id) === String(productId));
      
      if (productData) {
        const isLiked = toggleWishlist(productData); 
        likeBtn.setAttribute("aria-pressed", String(isLiked));
        const icon = likeBtn.querySelector(".material-icons");
        if (icon) icon.textContent = isLiked ? "favorite" : "favorite_border";
      }
      return; 
    }
    const cartBtn = e.target.closest(".btn-cart");
    if (cartBtn) {
      e.stopPropagation(); 
      const productId = cartBtn.dataset.id;
      const productData = state.baseProducts.find(p => String(p.id) === String(productId));

      if (productData) {
        addToCart(productData, 1); 
        alert(`${productData.title}\n상품이 장바구니에 담겼습니다.`);
      }
      return;
    }
    const fitBtn = e.target.closest(".btn-fit");
    if (fitBtn) {
      e.preventDefault();
      e.stopPropagation();
      const glassesId = fitBtn.dataset.id; 
      localStorage.setItem('selectedGlasses', glassesId);
      window.location.href = fitBtn.href || `../fitting-and-analysis.html?id=${glassesId}`; 
      return; 
    }
    const card = e.target.closest(".product-card");
    if (card && !card.classList.contains("skeleton-card")) {
      const mainLink = card.querySelector(".product-card__main-link");
      if (mainLink) {
        window.location.href = mainLink.href;
      }
    }
  });
}

function applyPagination(products) {
  const start = (state.page - 1) * state.limit;
  const end = start + state.limit;
  return products.slice(start, end);
}

function renderPagination() {
  const container = document.querySelector(".pagination");
  if (!container) return; 

  const totalPages = Math.ceil(state.filteredProducts.length / state.limit);
  
  container.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `btn-page ${i === state.page ? "is-active" : ""}`;
    
    btn.addEventListener("click", () => {
      state.page = i;
      updateView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    container.appendChild(btn);
  }
}

function handleLoadMore() {
  state.page++;
  updateView();
}

function updateLoadMoreButton() {
  const btn = document.querySelector(".btn-more");
  if (!btn) return;

  const total = state.filteredProducts.length;
  const loaded = state.page * state.limit;
  const isEnd = loaded >= total;

  btn.disabled = isEnd;
  if (isEnd) {
    btn.innerHTML = `<span class="material-icons">check</span> 마지막 상품입니다`;
  } else {
    btn.innerHTML = `더 보기 <span class="material-icons">chevron_right</span>`;
  }
}

function bindUI() {
  document.querySelector(".btn-more")?.addEventListener("click", handleLoadMore);
  document.querySelectorAll(".btn--filter").forEach(btn => {
    if (btn.id === "openFrameRecommend") return; 
    
    btn.addEventListener("click", openSheet);
  });

  document.querySelector(".close-btn")?.addEventListener("click", closeSheet);

  document.querySelector(".btn-apply")?.addEventListener("click", () => {
    state.page = 1;
    updateView();
    closeSheet();
  });

  document.querySelector(".btn-reset")?.addEventListener("click", resetFilters);
}

function initBottomSheet() {
  handle?.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  backdrop?.addEventListener("click", closeSheet);
}

function openSheet() {
  if (!sheet) return;
  sheet.hidden = false;
  sheet.classList.add("is-open");
  setSheet(window.innerHeight * 0.4, true);
}

function closeSheet() {
  setSheet(window.innerHeight, true);
  setTimeout(() => {
    if (sheet) {
      sheet.classList.remove("is-open");
      sheet.hidden = true;
    }
  }, 250);
}

function setSheet(y, animate = false) {
  if (!panel) return;
  currentY = Math.max(0, Math.min(window.innerHeight, y));
  panel.style.transition = animate
    ? "transform 0.35s cubic-bezier(0.2, 0.9, 0.2, 1)"
    : "none";

  panel.style.transform = `translateY(${currentY}px)`;
}

function snapTo(key) {
  const targetY = SNAP[key];
  setSheet(targetY, true); 
  
  if (key === "closed") {
    setTimeout(() => {
      if (sheet) {
        sheet.classList.remove("is-open");
        sheet.hidden = true;
      }
    }, 250);
  }
}

function bindBottomSheetFilters() {
  document.querySelectorAll(".bottom-sheet [data-filter-type]").forEach(btn => {
    if (btn.tagName === "INPUT") return; 
    btn.addEventListener("click", () => {
      toggleFilter(btn.dataset.filterType, btn.dataset.filterValue);
    });
  });
  document.querySelectorAll(".bottom-sheet [data-gender]").forEach(el => {
    const eventType = el.tagName === "INPUT" ? "change" : "click";
    el.addEventListener(eventType, () => {
      const value = el.dataset.gender || el.value;
      setGender(value);
    });
  });

  const priceInput = document.querySelector("#priceMax");
  if (priceInput) {
    priceInput.addEventListener("input", (e) => setPrice(e.target.value));
    priceInput.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });
    priceInput.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
  }
}
function bindSidebarFilters() {
  const root = document.querySelector(".filter-sidebar");
  if (!root) return;
  root.querySelectorAll("[data-filter-type]").forEach(btn => {
    if (btn.tagName === "INPUT") return; 

    btn.addEventListener("click", () => {
      const type = btn.dataset.filterType;
      const value = btn.dataset.filterValue;

      if (btn.dataset.role === "all") {
        handleSelectAll(type);
        return;
      }
      handleNormal(type, value, btn);
    });
  });
  root.querySelectorAll("[data-gender]").forEach(el => {
    const eventType = el.tagName === "INPUT" ? "change" : "click";
    el.addEventListener(eventType, () => {
      const value = el.dataset.gender || el.value;
      setGender(value);
    });
  });
}
function handleSelectAll(type) {
  state.filters[type] = [];
  const root = document.querySelector(".filter-sidebar");
  if (!root) return;

  const items = root.querySelectorAll(`[data-filter-type="${type}"]:not([data-role="all"])`);
  items.forEach(btn => {
    btn.classList.remove("is-active");
    btn.setAttribute("aria-pressed", "false");
  });

  updateFilterUI();
  updateView();
}

function handleNormal(type, value, btn) {
  const arr = state.filters[type];
  const normalizedValue = String(value).toLowerCase();
  const idx = arr.indexOf(normalizedValue);

  if (idx === -1) arr.push(normalizedValue);
  else arr.splice(idx, 1);
  
  const root = document.querySelector(".filter-sidebar");
  if (!root) return;

  const allBtn = root.querySelector(`[data-role="all"][data-filter-type="${type}"]`);

  if (arr.length === 0) {
    if (allBtn) {
      allBtn.classList.add("is-active");
      allBtn.setAttribute("aria-pressed", "true");
    }
  } else {
    if (allBtn) {
      allBtn.classList.remove("is-active");
      allBtn.setAttribute("aria-pressed", "false");
    }
  }

  updateView();
}

function handleNormalCheckbox(type, cb) {
  const all = document.querySelector(`[data-role="all"][data-filter-type="${type}"]`);
  if (all) all.checked = false;

  const val = String(cb.dataset.filterValue || cb.value).toLowerCase();
  const arr = state.filters[type];
  const idx = arr.indexOf(val);

  if (cb.checked) {
    if (idx === -1) arr.push(val);
  } else {
    if (idx !== -1) arr.splice(idx, 1);
  }
  
  const group = document.querySelectorAll(`[data-filter-type="${type}"]:not([data-role="all"])`);
  const noneChecked = [...group].every(x => !x.checked);

  if (noneChecked && all) {
    all.checked = true;
    state.filters[type] = [];
  }

  state.page = 1;
  updateView();
}

function bindChipEvents() {
  const wrap = document.querySelector(".active-filters");
  if (!wrap) return;

  wrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    const type = chip.dataset.type;
    const value = String(chip.dataset.value).toLowerCase();

    if (type === "gender") state.filters.gender = "all";
    else if (type === "price") state.filters.price = DEFAULT_PRICE;
    else {
      const arr = state.filters[type];
      const idx = arr.indexOf(value);
      if (idx !== -1) arr.splice(idx, 1);
    }

    state.page = 1;
    updateFilterUI();
    updateView();
  });
}

function renderActiveFilterChips() {
  const wrap = document.querySelector(".active-filters");
  if (!wrap) return;

  const f = state.filters;
  const chips = [];

  f.shape.forEach(v => chips.push({ type: "shape", value: v }));
  f.size.forEach(v => chips.push({ type: "size", value: v }));
  f.color.forEach(v => chips.push({ type: "color", value: v }));

  if (f.gender !== "all") chips.push({ type: "gender", value: f.gender });
  if (f.price < DEFAULT_PRICE) chips.push({ type: "price", value: `₩${f.price}` });

  wrap.innerHTML = chips.map(c => `
    <button class="chip" data-type="${c.type}" data-value="${c.value}">
      ${c.value} ×
    </button>
  `).join("");
}

function getActiveFilterCount() {
  const f = state.filters;
  let count = f.shape.length + f.size.length + f.color.length;

  if (f.gender !== "all") count += 1;
  if (f.price !== DEFAULT_PRICE) count += 1;

  return count;
}

function updateFilterCountUI() {
  const el = document.querySelector(".filter-count");
  if (el) el.textContent = getActiveFilterCount();
}

function onPointerDown(e) {
  isDragging = true;
  startY = e.clientY;
  startSheetY = currentY;
  lastY = e.clientY;
  lastTime = performance.now();

  if (panel) {
    panel.style.transition = "none";
    panel.setPointerCapture?.(e.pointerId);
  }
}

function onPointerMove(e) {
  if (!isDragging) return;
  const dy = e.clientY - startY;
  setSheet(startSheetY + dy);

  const now = performance.now();
  velocity = (e.clientY - lastY) / (now - lastTime);
  lastY = e.clientY;
  lastTime = now;
}

function onPointerUp() {
  if (!isDragging) return;
  isDragging = false;

  const momentum = velocity * 250;
  const projected = currentY + momentum;

  const targets = [
    { key: "full", value: SNAP.full },
    { key: "half", value: SNAP.half },
    { key: "closed", value: SNAP.closed }
  ];

  const closest = targets.reduce((a, b) =>
    Math.abs(b.value - projected) < Math.abs(a.value - projected) ? b : a
  );

  snapTo(closest.key);
}