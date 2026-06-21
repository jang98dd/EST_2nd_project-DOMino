import { fetchProducts } from "../modules/fetchRender.js";

let allProducts = [];
const swipers = {};

/* 영상 데이터 */
const HERO_VIDEOS = [
  { id: "Ph5ZnFPYeZg", title: "CARIN X NewJeans, Can't take my eyes off you, 카린 안경" },
  { id: "msfGAtyEi58", title: "PUBLIC BEACON 2026 BUCKLE COLLECTION" },
  { id: "8UpMctZ0e74", title: "LE SPECS JANUARY 24 'FAST LOVE'" },
  { id: "ZqzRmbHyGHc", title: "2026 MAIN COLLECTION 'ROMANTIC SPEED'" },
  { id: "VczU0X342MI", title: "Jennie gets the best of both worlds." },
];
const BRAND_VIDEOS = [
  { id: "gBakazoY4d8", title: "프로젝트 프로덕트(PROJEKT PRODUKT), PROJECT 13, Neo Nomad" },
  { id: "VSz8IfhtKFM", title: "The New Aviator Capsule." },
  { id: "wM7_iTWnCl0", title: "2026 Bouquet Collection with FKA twigs" },
  { id: "Jl0gN5KbK2o", title: "LE SPECS X NO PROBLEMO" },
  { id: "G6KBfKVga-s", title: "Rudy Project x FCI: A New Chapter for Italian Cycling" },
];

/* Best Pick 브랜드 탭 데이터 */
const BRANDS = [
  "all", "RAY-BAN", "FAKEME", "NINE ACCORD", "NISHIDE KAZUO",
  "PUBLIC BEACON", "HEISTER", "BLIZ", "MUSEUM BY BEACON",
  "RUDY PROJECT", "OAKLEY",
];

async function initHome() {
  initVideoSection("hero", HERO_VIDEOS);
  initVideoSection("brand", BRAND_VIDEOS);
  renderTabs();
  bindBestPickTabs();
  initTabDragScroll();
  bindBestPickLoadMore();

  try {
    const data = await fetchProducts();
    allProducts = (data.products || []).filter(
      (p) => p && p.thumbnail && Number(p.price) >= 10000
    );

    if (allProducts.length === 0) {
      showErrors();
      return;
    }

    renderBestPick("all");
    renderJennies();
    initCelebSwiper();
  } catch (err) {
    console.error(err);
    showErrors();
  }
}

/* 공통 */
function formatPrice(n) {
  return Number(n).toLocaleString("ko-KR");
}

function escapeHtml(str = "") {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* 영상 캐러셀 */
const videoSections = {};

let ytApiPromise;
function loadYouTubeAPI() {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

function videoSlides(prefix, videos) {
  return videos
    .map((v, i) => {
      const eager = prefix === "hero" && i === 0;
      return `
    <div class="swiper-slide">
      <div class="${prefix}__video">
        <img class="${prefix}__poster" src="https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg"
          onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg'"
          alt="${escapeHtml(v.title)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} />
        <div id="${prefix}-yt-${i}"></div>
      </div>
    </div>`;
    })
    .join("");
}

function initVideoSection(prefix, videos) {
  const carousel = document.querySelector(`.${prefix}__carousel`);
  const root = document.querySelector(`.${prefix}`);
  const wrapper = carousel?.querySelector(".swiper-wrapper");
  if (!carousel || !root || !wrapper) return;

  wrapper.innerHTML = videoSlides(prefix, videos);

  const state = {
    prefix, root, videos,
    players: [],
    active: 0,
    muted: true,
    userPaused: false,
    visible: false,
    started: false,
    swiper: null,
    raf: 0,
  };
  videoSections[prefix] = state;

  state.swiper = new Swiper(carousel, {
    slidesPerView: 1,
    rewind: true,
    pagination: {
      el: `.${prefix}__pagination`,
      clickable: true,
      renderBullet: (i, cls) =>
        `<button type="button" class="${cls}"><span class="video-bar__fill"></span></button>`,
    },
    on: { slideChange: () => onSlideChange(state) },
  });

  bindVideoControls(state);
  startProgressLoop(state);
  updateControlIcons(state);
  observeVisibility(state);
  armInteraction();
}

let userInteracted = false;
function armInteraction() {
  if (window.__videoInteractArmed) return;
  window.__videoInteractArmed = true;
  const events = ["pointerdown", "touchstart", "keydown", "wheel", "scroll", "mousemove"];
  const onFirst = () => {
    if (userInteracted) return;
    userInteracted = true;
    events.forEach((e) => window.removeEventListener(e, onFirst));
    Object.values(videoSections).forEach((s) => {
      if (s.visible) startSection(s);
    });
  };
  events.forEach((e) => window.addEventListener(e, onFirst, { passive: true }));
}

async function startSection(state) {
  if (state.started) {
    syncPlayback(state);
    return;
  }
  state.started = true;
  updateControlIcons(state);
  await loadYouTubeAPI();
  ensurePlayer(state, state.active);
}

function ensurePlayer(state, i) {
  if (i < 0 || i >= state.videos.length || state.players[i]) return;
  const YT = window.YT;
  if (!YT || !YT.Player) return;
  state.players[i] = new YT.Player(`${state.prefix}-yt-${i}`, {
    videoId: state.videos[i].id,
    playerVars: {
      controls: 0, rel: 0, playsinline: 1, modestbranding: 1,
      fs: 0, disablekb: 1, iv_load_policy: 3, mute: 1,
    },
    events: {
      onReady: (e) => {
        applyMute(e.target, state.muted);
        if (i === state.active) syncPlayback(state);
      },
      onStateChange: (e) => {
        if (i === state.active && e.data === 0) state.swiper.slideNext();
      },
    },
  });
}

function onSlideChange(state) {
  state.active = state.swiper.activeIndex;
  state.userPaused = false;
  if (state.started) {
    ensurePlayer(state, state.active);
    state.players.forEach((p, i) => {
      if (!p || !p.seekTo) return;
      applyMute(p, state.muted);
      if (i === state.active) safe(() => p.seekTo(0, true));
      else safe(() => p.pauseVideo());
    });
    syncPlayback(state);
  }
  updateControlIcons(state);
  resetBars(state);
}

function syncPlayback(state) {
  const p = state.players[state.active];
  if (!p || !p.playVideo) return;
  if (state.userPaused || !state.visible) safe(() => p.pauseVideo());
  else safe(() => p.playVideo());
}

function bindVideoControls(state) {
  const { root, prefix } = state;
  root
    .querySelector(`.${prefix}__control[data-action="play"]`)
    ?.addEventListener("click", () => {
      if (!state.started) {
        state.userPaused = false;
        startSection(state);
      } else {
        state.userPaused = !state.userPaused;
        syncPlayback(state);
      }
      updateControlIcons(state);
    });
  root
    .querySelector(`.${prefix}__control[data-action="mute"]`)
    ?.addEventListener("click", () => {
      state.muted = !state.muted;
      state.players.forEach((p) => applyMute(p, state.muted));
      updateControlIcons(state);
    });
}

function applyMute(p, muted) {
  if (!p || !p.mute) return;
  safe(() => (muted ? p.mute() : p.unMute()));
}

function updateControlIcons(state) {
  const { root, prefix } = state;
  const playBtn = root.querySelector(`.${prefix}__control[data-action="play"]`);
  const muteBtn = root.querySelector(`.${prefix}__control[data-action="mute"]`);
  if (playBtn) {
    const playing = state.started && !state.userPaused;
    const icon = playBtn.querySelector(".material-symbols-rounded");
    if (icon) icon.textContent = playing ? "pause_circle" : "play_circle";
    playBtn.setAttribute("aria-label", playing ? "영상 일시정지" : "영상 재생");
  }
  if (muteBtn) {
    const icon = muteBtn.querySelector(".material-symbols-rounded");
    if (icon) icon.textContent = state.muted ? "volume_off" : "volume_up";
    muteBtn.setAttribute("aria-label", state.muted ? "음소거 해제" : "음소거");
  }
}

/* 진행바 */
function barFills(state) {
  return [
    ...state.root.querySelectorAll(`.${state.prefix}__pagination .video-bar__fill`),
  ];
}
function resetBars(state) {
  barFills(state).forEach((fill, i) => {
    fill.style.width = i < state.active ? "100%" : "0%";
  });
}
function startProgressLoop(state) {
  cancelAnimationFrame(state.raf);
  const tick = () => {
    const p = state.players[state.active];
    if (p && p.getDuration) {
      const dur = p.getDuration() || 0;
      const cur = p.getCurrentTime ? p.getCurrentTime() : 0;
      const ratio = dur > 0 ? Math.min(cur / dur, 1) : 0;
      barFills(state).forEach((fill, i) => {
        if (i < state.active) fill.style.width = "100%";
        else if (i > state.active) fill.style.width = "0%";
        else fill.style.width = ratio * 100 + "%";
      });
    }
    state.raf = requestAnimationFrame(tick);
  };
  state.raf = requestAnimationFrame(tick);
}

function observeVisibility(state) {
  new IntersectionObserver(
    ([entry]) => {
      state.visible = entry.isIntersecting;
      if (state.visible && userInteracted) startSection(state);
      else syncPlayback(state);
    },
    { threshold: 0.3, rootMargin: "200px" }
  ).observe(state.root);
}

function safe(fn) {
  try {
    fn();
  } catch (e) {}
}

/* Best Pick 브랜드 탭 */
function createTab(brand, isFirst) {
  const label = brand === "all" ? "ALL" : brand;
  const id = "bp-tab-" + brand.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `<button type="button" role="tab" id="${id}" class="best-pick__tab${
    isFirst ? " is-active" : ""
  }" aria-selected="${isFirst}" aria-controls="bp-panel"${
    isFirst ? "" : ' tabindex="-1"'
  } data-brand="${brand}">${label}</button>`;
}

function renderTabs() {
  const tabs = document.querySelector(".best-pick__tabs");
  if (tabs) tabs.innerHTML = BRANDS.map((b, i) => createTab(b, i === 0)).join("");
}

function productCardHtml(p) {
  return `
    <a class="product-card" href="product-detail.html?id=${p.id}">
      <div class="product-card__img">
        <img src="${p.thumbnail}" alt="${escapeHtml(p.title)}" width="264" height="264" loading="lazy" />
      </div>
      <div class="product-card__info">
        <p class="product-card__brand">${escapeHtml(p.brand)}</p>
        <h3 class="product-card__name">${escapeHtml(p.title)}</h3>
        <p class="product-card__price">${formatPrice(p.price)}</p>
      </div>
    </a>`;
}

function createProductCard(p) {
  return `<div class="swiper-slide">${productCardHtml(p)}</div>`;
}

function renderInto(carouselSelector, products) {
  const wrapper = document.querySelector(`${carouselSelector} .swiper-wrapper`);
  if (!wrapper) return;
  wrapper.innerHTML = products.map(createProductCard).join("");
}

function initSwiper(key, carouselSelector, scrollbarSelector, extra = {}) {
  if (swipers[key]) swipers[key].destroy(true, true);
  swipers[key] = new Swiper(carouselSelector, {
    slidesPerView: "auto",
    spaceBetween: 8,
    scrollbar: { el: scrollbarSelector, draggable: true },
    ...extra,
  });
}

function finishLoading(sectionSelector) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;
  section.querySelector('[class*="__error"]')?.setAttribute("hidden", "");
}

/* Best Pick */
const bestPick = { list: [], shown: 0 };
const BEST_PICK_INITIAL = 24;
const LOAD_MORE_STEP = 10;

function bestPickCards(start, count) {
  const { list } = bestPick;
  const out = [];
  for (let i = 0; i < count; i++) out.push(list[(start + i) % list.length]);
  return out;
}

function bestPickPairSlides(products) {
  let html = "";
  for (let i = 0; i < products.length; i += 2) {
    const pair = products.slice(i, i + 2).map(productCardHtml).join("");
    html += `<div class="swiper-slide">${pair}</div>`;
  }
  return html;
}

function renderBestPickGrid(products) {
  const wrapper = document.querySelector(".best-pick__carousel .swiper-wrapper");
  if (!wrapper) return;
  wrapper.innerHTML = bestPickPairSlides(products);
}

function renderBestPick(brand) {
  const list =
    brand === "all" ? allProducts : allProducts.filter((p) => p.brand === brand);

  bestPick.list = list;
  let count = list.length ? BEST_PICK_INITIAL : 0;
  if (count % 2 === 1) count += 1;
  bestPick.shown = count;
  renderBestPickGrid(count ? bestPickCards(0, count) : []);
  initSwiper("bestpick", ".best-pick__carousel", ".best-pick__scrollbar");
  finishLoading(".best-pick");
}

function loadMoreBestPick() {
  const { list, shown } = bestPick;
  if (!list.length) return;

  const next = bestPickCards(shown, LOAD_MORE_STEP);
  bestPick.shown = shown + LOAD_MORE_STEP;

  const slides = [];
  for (let i = 0; i < next.length; i += 2) {
    const pair = next.slice(i, i + 2).map(productCardHtml).join("");
    slides.push(`<div class="swiper-slide">${pair}</div>`);
  }

  const sw = swipers.bestpick;
  if (!sw || !sw.appendSlide) return;
  const firstNewIndex = sw.slides.length;
  sw.appendSlide(slides);
  sw.update();
  const target = Math.min(firstNewIndex, sw.slides.length - 1);
  requestAnimationFrame(() => sw.slideTo(target, 600));
}

function bindBestPickLoadMore() {
  document
    .querySelector('.best-pick [data-action="load-more"]')
    ?.addEventListener("click", loadMoreBestPick);
}

function bindBestPickTabs() {
  const tabs = [...document.querySelectorAll(".best-pick__tab")];

  const activate = (tab) => {
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
      t.tabIndex = -1;
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    tab.tabIndex = 0;
    renderBestPick(tab.dataset.brand);
  };

  const moveFocus = (index) => {
    const t = tabs[index];
    if (!t) return;
    tabs.forEach((x) => (x.tabIndex = -1));
    t.tabIndex = 0;
    t.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(tab));

    tab.addEventListener("keydown", (e) => {
      let target;
      switch (e.key) {
        case "ArrowRight":
          target = (i + 1) % tabs.length;
          break;
        case "ArrowLeft":
          target = (i - 1 + tabs.length) % tabs.length;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = tabs.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      moveFocus(target);
    });
  });
}

/* 탭 마우스 드래그 가로 스크롤(데스크탑) */
function initTabDragScroll() {
  const tabs = document.querySelector(".best-pick__tabs");
  if (!tabs) return;

  let isDown = false;
  let moved = false;
  let startX = 0;
  let startScroll = 0;

  tabs.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return;
    isDown = true;
    moved = false;
    startX = e.clientX;
    startScroll = tabs.scrollLeft;
    tabs.classList.add("is-dragging");
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    tabs.scrollLeft = startScroll - dx;
  });

  const end = () => {
    if (!isDown) return;
    isDown = false;
    tabs.classList.remove("is-dragging");
  };
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);

  tabs.addEventListener(
    "click",
    (e) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    },
    true
  );
}

/* Jennie's Collection */
function renderJennies() {
  const products = allProducts.slice(0, 9);
  const wrapper = document.querySelector(".collection__carousel .swiper-wrapper");
  if (wrapper) {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      let html = "";
      for (let i = 0; i < products.length; i += 3) {
        const group = products.slice(i, i + 3).map(productCardHtml).join("");
        html += `<div class="swiper-slide">${group}</div>`;
      }
      wrapper.innerHTML = html;
    } else {
      wrapper.innerHTML = products.map(createProductCard).join("");
    }
  }
  initSwiper("jennie", ".collection__carousel", ".collection__scrollbar");
  finishLoading(".collection");
}

/* More Collection : 셀럽 캐러셀 */
function initCelebSwiper() {
  const root = document.querySelector(".more-collection__celebs");
  const track = root?.querySelector(".swiper-wrapper");
  if (!root || !track || track.children.length !== 3) return;

  const DURATION = 600;
  let isAnimating = false;

  function setRoles(roles) {
    [...track.children].forEach((el, i) => {
      el.classList.remove("is-prev", "is-active", "is-next");
      el.classList.add(roles[i]);
    });
  }

  function sync() {
    const active = track.children[1];
    if (!active) return;
    document
      .querySelectorAll("[data-celeb-label]")
      .forEach((el) => (el.textContent = active.dataset.celebName || ""));
    renderMore(active.dataset.celeb);
  }

  function stepSize() {
    const side =
      track.querySelector(".is-prev") || track.querySelector(".is-next");
    const w = side ? side.offsetWidth : track.children[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return w + gap;
  }

  function rotate(direction, dragOffset = 0) {
    if (isAnimating) return;
    isAnimating = true;

    const step = stepSize();

    root.classList.remove("is-sliding");
    track.style.transition = "none";
    if (direction === "next") {
      track.appendChild(track.firstElementChild);
      track.style.transform = `translateX(${step + dragOffset}px)`;
      setRoles(["is-active", "is-next", "is-prev"]);
    } else {
      track.insertBefore(track.lastElementChild, track.firstElementChild);
      track.style.transform = `translateX(${-step + dragOffset}px)`;
      setRoles(["is-next", "is-prev", "is-active"]);
    }

    void track.offsetHeight;

    root.classList.add("is-sliding");
    track.style.transition = `transform ${DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    track.style.transform = "translateX(0px)";
    setRoles(["is-prev", "is-active", "is-next"]);
    sync();

    let safety;
    const done = (e) => {
      if (e && (e.target !== track || e.propertyName !== "transform")) return;
      track.removeEventListener("transitionend", done);
      clearTimeout(safety);
      root.classList.remove("is-sliding");
      isAnimating = false;
    };
    track.addEventListener("transitionend", done);
    safety = setTimeout(done, DURATION + 120);
  }

  /* 드래그 / 스와이프 */
  let startX = 0;
  let dragDistance = 0;
  let isDragging = false;
  let dragMoved = false;

  const pointX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  function onDragStart(e) {
    if (isAnimating) return;
    isDragging = true;
    dragMoved = false;
    dragDistance = 0;
    startX = pointX(e);
    root.classList.remove("is-sliding");
    track.style.transition = "none";
  }
  function onDragMove(e) {
    if (!isDragging || isAnimating) return;
    dragDistance = pointX(e) - startX;
    if (Math.abs(dragDistance) > 5) dragMoved = true;
    if (e.cancelable && e.touches && Math.abs(dragDistance) > 10) e.preventDefault();
    track.style.transform = `translateX(${dragDistance}px)`;
  }
  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    const threshold = 60;
    if (dragDistance < -threshold) {
      const off = dragDistance;
      dragDistance = 0;
      rotate("next", off);
    } else if (dragDistance > threshold) {
      const off = dragDistance;
      dragDistance = 0;
      rotate("prev", off);
    } else {
      track.style.transition = "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)";
      track.style.transform = "translateX(0px)";
      dragDistance = 0;
    }
  }

  track.addEventListener("mousedown", onDragStart);
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);
  track.addEventListener("touchstart", onDragStart, { passive: true });
  window.addEventListener("touchmove", onDragMove, { passive: false });
  window.addEventListener("touchend", onDragEnd);
  track.addEventListener("dragstart", (e) => e.preventDefault());

  track.addEventListener("click", (e) => {
    if (dragMoved) return;
    const slide = e.target.closest(".swiper-slide");
    if (!slide) return;
    if (slide.classList.contains("is-next")) rotate("next");
    else if (slide.classList.contains("is-prev")) rotate("prev");
  });

  track.insertBefore(track.lastElementChild, track.firstElementChild);
  setRoles(["is-prev", "is-active", "is-next"]);
  sync();
}

function renderMore(celeb) {
  const offset = { gd: 0, nayoung: 8, dex: 16 }[celeb] ?? 0;
  renderInto(".more-collection__carousel", allProducts.slice(offset, offset + 8));
  initSwiper("more", ".more-collection__carousel", ".more-collection__scrollbar");
  finishLoading(".more-collection");
}

/* 에러 / 재시도 */
function showErrors() {
  [".best-pick", ".collection", ".more-collection"].forEach((sel) => {
    const section = document.querySelector(sel);
    section?.querySelector('[class*="__error"]')?.removeAttribute("hidden");
  });
}

function bindRetry() {
  document
    .querySelectorAll('[data-action="retry"]')
    .forEach((btn) => btn.addEventListener("click", initHome));
}

/* 엔트리포인트 */
if (document.body.dataset.page === "home") {
  bindRetry();
  initHome();

  let jennieResizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(jennieResizeTimer);
    jennieResizeTimer = setTimeout(() => {
      if (allProducts.length) renderJennies();
    }, 200);
  });
}
