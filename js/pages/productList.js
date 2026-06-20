import { fetchProducts } from "../modules/fetchRender.js";
import {
  addToCart,
  toggleWishlist,
  isProductLiked,
  updateCartCount,
  updateWishlistCount,
} from "../utils/storage.js";

const DEFAULT_PRICE = Infinity;

const DEFAULT_STATE = {
  shape: [],
  gender: "all",
  size: [],
  color: [],
  price: DEFAULT_PRICE,
};

const state = {
  products: [],
  baseProducts: [],
  totalProducts: [],
  filteredProducts: [],
  isLoading: true,
  sortType: "popular",
  filters: structuredClone(DEFAULT_STATE),
  currentPage: 1,
  limit: 12,
  isDesktop: window.innerWidth >= 1200,
};

function getColor(title) {
  const target = title || "";
  if (target.includes("블랙")) return "black";
  if (target.includes("투명")) return "clear";
  if (target.includes("골드")) return "gold";
  if (target.includes("실버")) return "silver";
  return "other";
}

function getSize(title) {
  const target = title || "";
  const match = target.match(/(\d+)mm/);
  if (!match) return "M";
  const size = Number(match[1]);
  if (size < 50) return "S";
  if (size <= 55) return "M";
  return "L";
}

function getShape(title) {
  const target = title || "";
  if (target.includes("라운드")) return "round";
  if (target.includes("캣아이")) return "cat-eye";
  if (target.includes("고글")) return "goggle";
  if (target.includes("보잉")) return "boeing";
  if (target.includes("오벌")) return "mix";
  return "other";
}

const SNAP = {
  full: 0,
  half: window.innerHeight * 0.4,
  closed: window.innerHeight,
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
    if (sortMenu) sortMenu.classList.remove("is-open");
    if (sortTrigger) sortTrigger.setAttribute("aria-expanded", "false");
    updateView();
  });
});

function bindEvents() {
  const openRecommendBtn = document.getElementById("openFrameRecommend");
  const recommendSheet = document.getElementById("recommendSheet");
  const closeRecommendElements = document.querySelectorAll(
    '[data-close="recommend"]',
  );

  if (openRecommendBtn && recommendSheet) {
    openRecommendBtn.addEventListener("click", () => {
      recommendSheet.removeAttribute("hidden");
    });
  }

  closeRecommendElements.forEach((element) => {
    element.addEventListener("click", () => {
      recommendSheet.setAttribute("hidden", "");
    });
  });
}

function bindTopCategories() {
  const categoryBtns = document.querySelectorAll(".btn-category");
  if (!categoryBtns.length) return;

  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      categoryBtns.forEach((b) => b.classList.remove("is-active"));
      e.currentTarget.classList.add("is-active");
      const selectedCategory = e.currentTarget.dataset.cat;
      console.log("클릭된 카테고리:", selectedCategory);
      handleCategoryChange(selectedCategory);
    });
  });
}

function handleCategoryChange(category) {}

async function init() {
  window.state = state;
  bindUI();
  initBottomSheet();
  bindEvents();
  initSort();
  initProductCardClicks();
  bindChipEvents();
  bindBottomSheetFilters();
  bindSidebarFilters();
  bindTopCategories();

  updateCartCount();
  updateWishlistCount();
  state.isLoading = true;
  updateView();

  try {
    const data = await fetchProducts();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const rawProducts =
      data && data.products ? data.products : Array.isArray(data) ? data : [];

    if (rawProducts.length > 0) {
      const products = rawProducts.filter((product) => product.id !== 1);
      state.products = products.map((product) => {
        const cleanedPrice =
          typeof product.price === "string"
            ? Number(product.price.replace(/[^0-9]/g, ""))
            : Number(product.price || 0);

        const productTitle = product.title || product.name || "";

        return {
          ...product,
          price: cleanedPrice,
          color: getColor(productTitle),
          size: getSize(productTitle),
          shape: getShape(productTitle),
          gender: product.id % 2 === 0 ? "male" : "female",
        };
      });
    }
    state.baseProducts = [...state.products];

    state.priceSteps = [
      ...new Set(state.baseProducts.map((p) => p.price)),
    ].sort((a, b) => a - b);

    if (!state.priceSteps.length) return;

    initFilters();
    const priceInputs = document.querySelectorAll(
      "#priceMaxSidebar, #priceMaxSheet",
    );
    if (state.priceSteps?.length > 0) {
      priceInputs.forEach((input) => {
        input.min = 0;
        input.max = state.priceSteps.length - 1;
        input.step = 1;
        input.value = state.priceSteps.length - 1;
      });
    }

    state.filters.price = Infinity;
    await loadRecommendations();
  } catch (error) {
    console.error("데이터를 불러오는 중 에러가 발생했습니다:", error);
  } finally {
    state.isLoading = false;
    updateView();
  }

  window.addEventListener("resize", () => {
    const currentIsDesktop = window.innerWidth >= 1200;
    if (state.isDesktop !== currentIsDesktop) {
      state.isDesktop = currentIsDesktop;
      updateView();
    }
  });
}

init();

async function loadRecommendations() {
  try {
    const track = document.querySelector(".frame-track");
    if (!track) return;

    const response = await fetch("/data/products.json");
    if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");

    const data = await response.json();
    const recommendations =
      data.recommendations ||
      data.products ||
      (Array.isArray(data) ? data : null);

    if (!recommendations) throw new Error("상품 배열을 찾을 수 없습니다.");
    const filteredRecommendations = recommendations.filter(
      (product) => product.id !== 1,
    );

    renderRecommendations(filteredRecommendations);
  } catch (error) {
    console.error("추천 상품 에러 발생:", error);
  }
}

function renderRecommendations(products) {
  const track = document.querySelector(".frame-track");
  if (!track) return;
  track.innerHTML = products
    .map(
      (product) => `
    <article class="frame-card product-card">
      <a href="../product-detail.html?id=${product.id}">
        <img src="${product.image || product.thumbnail || ""}" alt="${product.name || product.title}" style="display:block; width:100%;" />
        <h3 class="body-sm">${product.name || product.title}</h3>
        <p body-sm-bold--tight>₩${(product.price || 0).toLocaleString()}</p>
      </a>
    </article>
  `,
    )
    .join("");
}

function updateView() {
  if (state.isLoading) {
    if (productCards) {
      productCards.innerHTML = Array(state.limit)
        .fill(createSkeletonCard())
        .join("");
    }
    const countEl = document.querySelector(".product-count");
    if (countEl) countEl.textContent = "로딩 중...";

    const btnMore = document.querySelector(".btn-more");
    if (btnMore) {
      btnMore.style.display = window.innerWidth >= 1200 ? "none" : "block";
      btnMore.disabled = true;
      btnMore.innerHTML = `로딩 중...`;
    }
    const pagination = document.querySelector(".pagination");
    if (pagination) pagination.style.display = "none";
    return;
  }
  const products = applySort(applyFilters([...state.baseProducts]));
  state.filteredProducts = products;
  state.isDesktop = window.innerWidth >= 1200;

  const maxPage = Math.ceil(products.length / state.limit) || 1;
  state.currentPage = Math.min(state.currentPage, maxPage);
  if (state.currentPage < 1) state.currentPage = 1;

  let visibleProducts = [];

  if (state.isDesktop) {
    const start = (state.currentPage - 1) * state.limit;
    visibleProducts = products.slice(start, start + state.limit);
  } else {
    const end = state.currentPage * state.limit;
    visibleProducts = products.slice(0, end);
  }

  renderProducts(visibleProducts);

  const btnMore = document.querySelector(".btn-more");
  const pagination = document.querySelector(".pagination");

  if (state.isDesktop) {
    renderPagination();
    if (btnMore) btnMore.style.display = "none";
    if (pagination) pagination.style.display = "flex";
  } else {
    updateLoadMoreButton();
    if (btnMore) btnMore.style.display = "flex";
    if (pagination) pagination.style.display = "none";
  }

  renderProductCount();
  updateFilterUI();
  renderActiveFilterChips();
  updateFilterCountUI();
  updatePriceFilter();
}
function initSort() {
  document.querySelectorAll("[data-sort]").forEach((el) => {
    el.addEventListener("click", () => {
      state.sortType = el.dataset.sort;
      resetPaging();
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

function applyFilters(products) {
  let filtered = [...products];

  if (state.filters.shape.length) {
    filtered = filtered.filter((product) =>
      state.filters.shape.includes(product.shape),
    );
  }
  if (state.filters.size.length) {
    filtered = filtered.filter((product) =>
      state.filters.size.includes(product.size.toLowerCase()),
    );
  }
  if (state.filters.color.length) {
    filtered = filtered.filter((product) =>
      state.filters.color.includes(product.color),
    );
  }
  if (state.filters.gender !== "all") {
    filtered = filtered.filter(
      (product) => product.gender === state.filters.gender,
    );
  }

  filtered = filtered.filter((product) => product.price <= state.filters.price);
  return filtered;
}

function toggleFilter(type, value) {
  if (value === "all") {
    state.filters[type] = [];
    resetPaging();
    updateView();
    return;
  }

  const arr = state.filters[type];
  const normalizedValue = String(value).toLowerCase();
  const idx = arr.indexOf(normalizedValue);

  if (idx === -1) arr.push(normalizedValue);
  else arr.splice(idx, 1);
  resetPaging();
  updateView();
}

function setGender(value) {
  state.filters.gender = String(value).toLowerCase();
  updateFilterUI();
  resetPaging();
  updateView();
}

function setPrice(value) {
  state.filters.price = Number(value);
  resetPaging();
  updateView();
}

function resetFilters() {
  state.filters = structuredClone(DEFAULT_STATE);
  state.sortType = "popular";
  document.querySelectorAll("[data-filter-type]").forEach((el) => {
    el.classList.remove("is-active");
    el.setAttribute("aria-pressed", "false");
    if (el.tagName === "INPUT") el.checked = false;
  });
  closeSheet();
  resetPaging();

  document.querySelectorAll("[data-role='all']").forEach((all) => {
    if (all.tagName === "INPUT") all.checked = true;
  });

  document.querySelectorAll("[data-gender]").forEach((el) => {
    el.classList.remove("is-active");
    el.setAttribute("aria-pressed", "false");
  });

  const chipWrap = document.querySelector(".active-filters");
  if (chipWrap) chipWrap.innerHTML = "";

  updateView();
}

function initFilters() {
  const inputs = document.querySelectorAll("input[data-filter-type]");
  const priceLen = state.priceSteps?.length ?? 0;
  state.filters.priceIndex = priceLen ? priceLen - 1 : 0;
  inputs.forEach((el) =>
    el.addEventListener("change", (e) => {
      const type = e.target.dataset.filterType;
      if (e.target.dataset.role === "all") {
        if (e.target.checked) {
          state.filters[type] = [];
          document
            .querySelectorAll(
              `input[data-filter-type="${type}"]:not([data-role="all"])`,
            )
            .forEach((cb) => (cb.checked = false));
        }
        resetPaging();
        updateView();
      } else {
        handleNormalCheckbox(type, e.target);
      }
    }),
  );
  const priceInputs = document.querySelectorAll(
    "#priceMaxSidebar, #priceMaxSheet",
  );
  state.filters.priceIndex = state.priceSteps.length - 1;

  priceInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = Number(e.target.value);

      state.filters.priceIndex = index;
      state.filters.price = state.priceSteps[index] ?? Infinity;
      resetPaging();
      updateView();
    });
  });
}

function updateFilterUI() {
  document
    .querySelectorAll("[data-gender], input[name='gender']")
    .forEach((el) => {
      const val = String(el.dataset.gender || el.value).toLowerCase();
      const isActive = state.filters.gender === val;

      el.classList.toggle("is-active", isActive);
      el.setAttribute("aria-pressed", String(isActive));

      if (el.tagName === "INPUT" && el.type === "radio") {
        el.checked = isActive;
      }
    });
}

function renderProducts(list) {
  if (!productCards) return;
  productCards.innerHTML = list.map(createProductCard).join("");
}

function createProductCard(product) {
  const formattedPrice =
    typeof product.price === "number"
      ? `${product.price.toLocaleString()}원`
      : product.price;
  const isLiked = isProductLiked(product.id);
  const iconText = isLiked ? "favorite" : "favorite_border";

  return `
    <article class="product-card" style="position: relative; cursor: pointer;">
      <a href="../product-detail.html?id=${product.id}" 
         class="product-card__main-link" 
         aria-label="${product.title || product.name} 상세 페이지로 이동">
      </a>
      <div class="product-card__thumb">
        <img src="${product.thumbnail}" alt="${product.title || product.name}" />
        <button class="btn-like btn--utility-sm" data-id="${product.id}" aria-pressed="${isLiked ? "true" : "false"}" aria-label="찜하기">
          <span class="material-icons">${iconText}</span>
        </button>
        <button class="btn-cart btn--utility-sm" data-id="${product.id}" aria-label="장바구니 담기">
          <span class="material-icons">shopping_cart</span>
        </button>
        <a href="../fitting-and-analysis.html?id=${product.id}" class="btn-fit btn--utility-sm" data-id="${product.id}">
          착용하기
        </a>
      </div>
      <p class="body-sm-bold--tight">${product.brand || ""}</p>
      <h3 class="body-sm">${product.title || product.name}</h3>
      <p class="price">${formattedPrice}</p>
    </article>
  `;
}

function createSkeletonCard() {
  return `
    <article class="product-card skeleton-card">
      <div class="product-card__thumb"></div>
      <p class="skeleton-text" ></p>
      <h3 class="skeleton-text"></h3>
      <p class="skeleton-text"></p>
    </article>
  `;
}

function renderProductCount() {
  const total = state.filteredProducts.length;
  const visible = Math.min(state.currentPage * state.limit, total);

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
      const productData = state.baseProducts.find(
        (p) => String(p.id) === String(productId),
      );

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
      const productData = state.baseProducts.find(
        (p) => String(p.id) === String(productId),
      );

      if (productData) {
        addToCart(productData, 1);
        alert(
          `${productData.title || productData.name}\n상품이 장바구니에 담겼습니다.`,
        );
      }
      return;
    }
    const fitBtn = e.target.closest(".btn-fit");
    if (fitBtn) {
      e.preventDefault();
      e.stopPropagation();
      const glassesId = fitBtn.dataset.id;
      const productData = state.baseProducts.find(
        (p) => String(p.id) === String(glassesId),
      );

      if (productData) {
        localStorage.setItem("selectedGlasses", glassesId);
        localStorage.setItem(
          "selectedGlassesItem",
          JSON.stringify(productData),
        );
      }
      window.location.href = fitBtn.href;
      return;
    }

    const card = e.target.closest(".product-card");
    if (card && !card.classList.contains("skeleton-card")) {
      const mainLink = card.querySelector(".product-card__main-link");
      if (mainLink) window.location.href = mainLink.href;
    }
  });
}

function renderPagination() {
  const container = document.querySelector(".pagination");
  if (!container) return;

  const totalPages = Math.ceil(state.filteredProducts.length / state.limit);
  container.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `btn-page ${i === state.currentPage ? "is-active" : ""}`;

    btn.addEventListener("click", () => {
      state.currentPage = i;
      updateView();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    container.appendChild(btn);
  }
}

function resetPaging() {
  state.currentPage = 1;
}

function handleLoadMore() {
  state.currentPage++;
  updateView();
}

function updateLoadMoreButton() {
  const btn = document.querySelector(".btn-more");
  if (!btn) return;

  const loadedCount = state.currentPage * state.limit;
  const totalCount = state.filteredProducts.length;
  const isEnd = loadedCount >= totalCount;

  btn.disabled = isEnd;

  if (isEnd) {
    btn.innerHTML = `<span class="material-icons">check</span> 마지막 상품입니다`;
  } else {
    btn.innerHTML = `더 보기 <span class="material-icons">chevron_right</span>`;
  }
}

function bindUI() {
  document
    .querySelector(".btn-more")
    ?.addEventListener("click", handleLoadMore);
  document.querySelectorAll(".btn--filter").forEach((btn) => {
    if (btn.id === "openFrameRecommend") return;
    btn.addEventListener("click", openSheet);
  });

  document.querySelector(".close-btn")?.addEventListener("click", closeSheet);
  document.querySelector(".btn-apply")?.addEventListener("click", () => {
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
  document
    .querySelectorAll(".bottom-sheet [data-filter-type]")
    .forEach((btn) => {
      if (btn.tagName === "INPUT") return;
      btn.addEventListener("click", () => {
        toggleFilter(btn.dataset.filterType, btn.dataset.filterValue);
      });
    });
  document.querySelectorAll(".bottom-sheet [data-gender]").forEach((el) => {
    const eventType = el.tagName === "INPUT" ? "change" : "click";
    el.addEventListener(eventType, () => {
      const value = el.dataset.gender || el.value;
      setGender(value);
    });
  });
}

function bindSidebarFilters() {
  const root = document.querySelector(".filter-sidebar");
  if (!root) return;
  root.querySelectorAll("[data-filter-type]").forEach((btn) => {
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
  root.querySelectorAll("[data-gender]").forEach((el) => {
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

  const items = root.querySelectorAll(
    `[data-filter-type="${type}"]:not([data-role="all"])`,
  );
  items.forEach((btn) => {
    btn.classList.remove("is-active");
    btn.setAttribute("aria-pressed", "false");
  });

  resetPaging();
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

  const allBtn = root.querySelector(
    `[data-role="all"][data-filter-type="${type}"]`,
  );

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

  resetPaging();
  updateView();
}

function handleNormalCheckbox(type, cb) {
  const all = document.querySelector(
    `[data-role="all"][data-filter-type="${type}"]`,
  );
  if (all) all.checked = false;

  const val = String(cb.dataset.filterValue || cb.value).toLowerCase();
  const arr = state.filters[type];
  const idx = arr.indexOf(val);
  if (cb.checked) {
    if (idx === -1) arr.push(val);
  } else {
    if (idx !== -1) arr.splice(idx, 1);
  }

  const group = document.querySelectorAll(
    `[data-filter-type="${type}"]:not([data-role="all"])`,
  );
  const noneChecked = [...group].every((x) => !x.checked);

  if (noneChecked && all) {
    all.checked = true;
    state.filters[type] = [];
  }
  resetPaging();
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
    updateFilterUI();
    resetPaging();
    updateView();
  });
}

function renderActiveFilterChips() {
  const wrap = document.querySelector(".active-filters");
  if (!wrap) return;

  const f = state.filters;
  const chips = [];

  f.shape.forEach((v) => chips.push({ type: "shape", value: v }));
  f.size.forEach((v) => chips.push({ type: "size", value: v }));
  f.color.forEach((v) => chips.push({ type: "color", value: v }));

  if (f.gender !== "all") chips.push({ type: "gender", value: f.gender });
  if (f.price < DEFAULT_PRICE) {
    chips.push({ type: "price", value: `₩${f.price.toLocaleString()}` });
  }

  wrap.innerHTML = chips
    .map(
      (c) => `
    <button class="chip" data-type="${c.type}" data-value="${c.value}">
      ${c.value} x
    </button>
  `,
    )
    .join("");
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
    { key: "closed", value: SNAP.closed },
  ];

  const closest = targets.reduce((a, b) =>
    Math.abs(b.value - projected) < Math.abs(a.value - projected) ? b : a,
  );

  snapTo(closest.key);
}

function updatePriceFilter() {
  const priceInputs = document.querySelectorAll(
    "#priceMaxSidebar, #priceMaxSheet",
  );
  const maxPriceTexts = document.querySelectorAll(
    ".price-current span:last-child",
  );

  if (!state.priceSteps?.length) return;

  const idx = state.filters.priceIndex ?? state.priceSteps.length - 1;

  const safeIdx = Math.max(0, Math.min(idx, state.priceSteps.length - 1));
  const displayPrice = state.priceSteps[safeIdx];

  priceInputs.forEach((input) => {
    input.value = safeIdx;
  });

  maxPriceTexts.forEach((el) => {
    el.textContent = `₩${displayPrice.toLocaleString()}`;
  });
}
