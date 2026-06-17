import { fetchProducts } from "../modules/fetchRender.js";

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

sortTrigger.addEventListener("click", () => {
  const open = sortMenu.classList.toggle("is-open");
  sortTrigger.setAttribute("aria-expanded", open);
});
document.querySelectorAll("[data-sort]").forEach((el) => {
  el.addEventListener("click", () => {
    state.sortType = el.dataset.sort;
    state.page = 1;

    sortMenu.classList.remove("is-open");
    sortTrigger.setAttribute("aria-expanded", "false");

    updateView();
  });
});
async function init() {
  const data = await fetchProducts();
  state.isLoading = true;
  updateView();
  await new Promise(resolve => setTimeout(resolve, 1000));
  state.isLoading = false;
  updateView();

state.products = (data.products || []).map(p => ({
  ...p,
  shape: (p.category || "").toLowerCase(),
  color: (p.color || "").toLowerCase(),
  size: (p.size || "m").toLowerCase(),
  gender: (p.gender || "all").toLowerCase()
}));

  state.baseProducts = [...state.products];

  bindUI();
  initFilters();
  initSort();
  initLikeButton();
  bindChipEvents();
  initBottomSheet();

  updateView();
}

init();
function updateView() {
  const skeletonList = document.querySelector(".skeleton-list");
  if (state.isLoading) {
    productCards.innerHTML = Array.from({ length: 12 })
      .map(() => createSkeletonCard())
      .join("");
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
function safeIncludes(filterArr, value) {
  if (!filterArr.length) return true;
  return filterArr.includes(value ?? "");
}

function applyFilters(products) {
  const f = state.filters;

  return products.filter(p => {
    const ok =
      (f.shape.length === 0 || f.shape.includes(p.shape)) &&
      (f.size.length === 0 || f.size.includes(p.size)) &&
      (f.color.length === 0 || f.color.includes(p.color)) &&
      (f.gender === "all" || p.gender === f.gender) &&
      (p.price <= f.price);

    if (!ok) {
      console.log("DROP:", {
        p,
        f
      });
    }

    return ok;
  });
}
function toggleFilter(type, value) {
  const arr = state.filters[type];

  const idx = arr.indexOf(value);
  if (idx === -1) arr.push(value);
  else arr.splice(idx, 1);

  state.page = 1;

  updateView(); 
}
function setGender(value) {
  state.filters.gender = value;
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
  const buttons = document.querySelectorAll('button[data-filter-type], button[data-gender]');

  inputs.forEach(el => el.addEventListener('change', (e) => {
    if(e.target.dataset.filterType === 'shape') {
        toggleFilter(e.target.dataset.filterType, e.target.value);
    }
  }));

  buttons.forEach(el => el.addEventListener('click', (e) => {
      if(el.dataset.filterType) toggleFilter(el.dataset.filterType, el.dataset.filterValue);
      if(el.dataset.gender) setGender(el.dataset.gender);
  }));
}

function updateFilterUI() {
  document.querySelectorAll("[data-filter-type]").forEach((btn) => {
    const type = btn.dataset.filterType;
    const value = btn.dataset.filterValue;

    const active = state.filters[type].includes(value);

    btn.setAttribute("aria-pressed", String(active));
    btn.classList.toggle("is-active", active);
  });
}
function renderProducts(list) {
  productCards.innerHTML = list.map(createProductCard).join("");
}

function createProductCard(product) {
  const formattedPrice = typeof product.price === 'number' 
    ? `${product.price.toLocaleString()}원` 
    : product.price;

  return `
    <article class="product-card" style="position: relative;">
      
      <a href="../product-detail.html?id=${product.id}" 
         class="product-card__main-link" 
         aria-label="${product.title} 상세 페이지로 이동">
      </a>

      <div class="product-card__thumb">
        <img src="${product.thumbnail}" alt="${product.title}" />

        <button class="btn-like btn--utility-sm"
          aria-pressed="false"
          aria-label="찜하기">
          <span class="material-icons">favorite_border</span>
        </button>

        <a href="../fitting-and-analysis.html?id=${product.id}" 
           class="btn-fit btn--utility-sm" data-id="${product.id}">
          착용하기
        </a>
      </div>

      <p>${product.brand}</p>
      <h3>${product.title}</h3>
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

  const visible = Math.min(
    state.page * state.limit,
    state.filteredProducts.length
  );

  document.querySelector(".product-count").textContent =
    `${visible} / ${total}`;
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
  btn.innerHTML = `
    <span class="material-icons">check</span>
    마지막 상품입니다
  `;
  } else {
    btn.innerHTML = `더 보기 <span class="material-icons">chevron_right</span>`
  }
}

function initLikeButton() {
  productCards.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-like");
    if (!btn) return;

    const icon = btn.querySelector(".material-icons");
    const isLiked = btn.getAttribute("aria-pressed") === "true";

    btn.setAttribute("aria-pressed", String(!isLiked));
    icon.textContent = isLiked ? "favorite_border" : "favorite";
  });
}
function bindUI() {
  document.querySelector(".btn-more")
    ?.addEventListener("click", handleLoadMore);

  document.querySelectorAll(".btn--filter")
    .forEach(btn => btn.addEventListener("click", openSheet));

  document.querySelector(".close-btn")
    ?.addEventListener("click", closeSheet);

  document.querySelector(".btn-apply")
    ?.addEventListener("click", () => {
      state.page = 1;
      updateView();
      closeSheet();
    });

  document.querySelector(".btn-reset")
    ?.addEventListener("click", resetFilters);
}

function initBottomSheet() {
  handle?.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  backdrop?.addEventListener("click", closeSheet);
}

function openSheet() {
  sheet.hidden = false;
  sheet.classList.add("is-open");
  setSheet(window.innerHeight * 0.4, true);
}

function closeSheet() {
  setSheet(window.innerHeight, true);

  setTimeout(() => {
    sheet.classList.remove("is-open");
    sheet.hidden = true;
  }, 250);
}

function setSheet(y, animate = false) {
  currentY = Math.max(0, Math.min(window.innerHeight, y));
  panel.style.transition = animate
    ? "transform 0.35s cubic-bezier(0.2, 0.9, 0.2, 1)"
    : "none";

  panel.style.transform = `translateY(${currentY}px)`;
}
function bindBottomSheetFilters() {
  document.querySelectorAll(".bottom-sheet [data-filter-type]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        toggleFilter(btn.dataset.filterType, btn.dataset.filterValue);
      });
    });

  document.querySelectorAll(".bottom-sheet [data-gender]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        setGender(btn.dataset.gender);
      });
    });

  document.querySelector("#priceMax")
    ?.addEventListener("input", (e) => setPrice(e.target.value));
}
function bindSidebarFilters() {
  const root = document.querySelector(".filter-sidebar");
  if (!root) {
    console.warn("sidebar 없음");
    return;
  }

  root.querySelectorAll("[data-filter-type]").forEach(btn => {
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
}
function handleSelectAll(type) {
  state.filters[type] = [];

  const root = document.querySelector(".filter-sidebar");
  const items = root.querySelectorAll(
    `[data-filter-type="${type}"]:not([data-role="all"])`
  );

  items.forEach(btn => {
    btn.classList.remove("is-active");
    btn.setAttribute("aria-pressed", "false");
  });

  updateFilterUI();
  updateView();
}
function handleNormal(type, value, btn) {
  const arr = state.filters[type];

  const idx = arr.indexOf(value);

  if (idx === -1) arr.push(value);
  else arr.splice(idx, 1);
  const root = document.querySelector(".filter-sidebar");
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

  const arr = state.filters[type];

  const idx = arr.indexOf(cb.value);

  if (cb.checked) {
    if (idx === -1) arr.push(cb.value);
  } else {
    if (idx !== -1) arr.splice(idx, 1);
  }
  const group = document.querySelectorAll(
    `[data-filter-type="${type}"]:not([data-role="all"])`
  );

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
    const value = chip.dataset.value;

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

  if (f.gender !== "all") {
    chips.push({ type: "gender", value: f.gender });
  }

  if (f.price < DEFAULT_PRICE) {
    chips.push({ type: "price", value: `₩${f.price}` });
  }

  wrap.innerHTML = chips.map(c => `
    <button class="chip" data-type="${c.type}" data-value="${c.value}">
      ${c.value} ×
    </button>
  `).join("");
}

function getActiveFilterCount() {
  const f = state.filters;

  let count = 0;
  count += f.shape.length;
  count += f.size.length;
  count += f.color.length;

  if (f.gender !== "all") count += 1;
  if (f.price !== DEFAULT_PRICE) count += 1;

  return count;
}

function updateFilterCountUI() {
  const el = document.querySelector(".filter-count");
  if (!el) return;

  el.textContent = getActiveFilterCount();
}
function onPointerDown(e) {
  isDragging = true;

  startY = e.clientY;
  startSheetY = currentY;

  lastY = e.clientY;
  lastTime = performance.now();

  panel.style.transition = "none";
  panel.setPointerCapture?.(e.pointerId);
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
console.log(document.querySelector("#sortMenu"));
console.log(document.querySelector(".bottom-sheet"));
console.log(document.querySelector(".handle"));
console.log("SAMPLE PRODUCT:", state.products?.[0]);
console.log(Object.keys(state.products?.[0] ?? {}));
console.log(state.products.filter(p => !p.size));
console.log("SAMPLE PRODUCT FULL:", state.products[0]);

productCards.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-fit')) {
    const glassesId = e.target.dataset.id; 
    localStorage.setItem('selectedGlasses', glassesId);
    window.location.href = '../fitting-and-analysis.html'; 
  }
});