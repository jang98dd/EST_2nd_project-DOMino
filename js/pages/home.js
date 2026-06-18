import { fetchProducts } from "../modules/fetchRender.js";

/* 엔트리포인트는 파일 맨 아래 */

let allProducts = [];
const swipers = {}; // 섹션별 Swiper 인스턴스 보관

/* 영상 데이터 */
const HERO_VIDEOS = [
  { id: "8UpMctZ0e74", title: "LE SPECS JANUARY 24 'FAST LOVE'" },
  { id: "Ph5ZnFPYeZg", title: "CARIN X NewJeans, Can't take my eyes off you, 카린 안경" },
  { id: "msfGAtyEi58", title: "PUBLIC BEACON 2026 BUCKLE COLLECTION" },
  { id: "ZqzRmbHyGHc", title: "2026 MAIN COLLECTION 'ROMANTIC SPEED'" },
  { id: "VczU0X342MI", title: "Jennie gets the best of both worlds." },
];
const BRAND_VIDEOS = [
  { id: "VSz8IfhtKFM", title: "The New Aviator Capsule." },
  { id: "gBakazoY4d8", title: "프로젝트 프로덕트(PROJEKT PRODUKT), PROJECT 13, Neo Nomad" },
  { id: "wM7_iTWnCl0", title: "2026 Bouquet Collection with FKA twigs" },
  { id: "Jl0gN5KbK2o", title: "LE SPECS X NO PROBLEMO" },
  { id: "G6KBfKVga-s", title: "Rudy Project x FCI: A New Chapter for Italian Cycling" },
];

/* 카테고리 모양은 index.html 정적 마크업 */

/* Best Pick 브랜드 탭 데이터 */
const BRANDS = [
  "all", "RAY-BAN", "FAKEME", "NINE ACCORD", "NISHIDE KAZUO",
  "PUBLIC BEACON", "HEISTER", "BLIZ", "MUSEUM BY BEACON",
  "RUDY PROJECT", "OAKLEY",
];

async function initHome() {
  // 영상 캐러셀
  initVideoSection("hero", HERO_VIDEOS);
  initVideoSection("brand", BRAND_VIDEOS);
  renderTabs(); // Best Pick 브랜드 탭 주입
  bindBestPickTabs(); // 탭 클릭 바인딩 — 미리 해서 이후 코드 에러와 무관하게 동작

  const data = await fetchProducts();
  // 노이즈 제거
  allProducts = (data.products || []).filter(
    (p) => p && p.thumbnail && Number(p.price) >= 10000
  );

  if (allProducts.length === 0) {
    showErrors();
    return;
  }

  renderBestPick("all");
  renderJennies();
  initCelebSwiper(); // 셀럽 캐러셀 + 첫 셀럽 상품 렌더
}

/* ---------- 공통 ---------- */
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

/* ---------- 영상 캐러셀 ---------- */
const videoSections = {}; // prefix → 상태

/* YouTube IFrame API는 페이지당 1회만 로드 */
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

/* 슬라이드 = 포스터 + 영상 자리 */
function videoSlides(prefix, videos) {
  return videos
    .map((v, i) => {
      const eager = prefix === "hero" && i === 0; // 히어로 첫 장면이 LCP
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
    players: [], // 지연 생성
    active: 0,
    muted: true, // 음소거로 자동재생
    userPaused: false, // 재생 버튼으로 직접 멈췄는지
    visible: false, // 화면에 보이는지
    started: false, // 첫 플레이어를 생성했는지
    swiper: null,
    raf: 0,
  };
  videoSections[prefix] = state;

  // 스와이프 + 진행바
  state.swiper = new Swiper(carousel, {
    slidesPerView: 1,
    rewind: true, // 마지막 → 처음 반복
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
  observeVisibility(state); // 보이는 동안 + 상호작용 후에 첫 플레이어 생성
  armInteraction(); // 첫 사용자 동작 때 영상 로드 시작
}

/* facade: 첫 동작 때 영상 로드 */
let userInteracted = false;
function armInteraction() {
  if (window.__videoInteractArmed) return;
  window.__videoInteractArmed = true;
  const events = ["pointerdown", "touchstart", "keydown", "wheel", "scroll", "mousemove"];
  const onFirst = () => {
    if (userInteracted) return;
    userInteracted = true;
    events.forEach((e) => window.removeEventListener(e, onFirst));
    // 지금 보이는 영상 섹션부터 시작
    Object.values(videoSections).forEach((s) => {
      if (s.visible) startSection(s);
    });
  };
  events.forEach((e) => window.addEventListener(e, onFirst, { passive: true }));
}

/* 첫 노출 시 활성 영상 플레이어 생성 */
async function startSection(state) {
  if (state.started) {
    syncPlayback(state);
    return;
  }
  state.started = true;
  updateControlIcons(state); // 재생 시작 아이콘
  await loadYouTubeAPI();
  ensurePlayer(state, state.active);
}

/* 플레이어 지연 생성 */
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
        // 영상 끝나면 다음으로
        if (i === state.active && e.data === 0) state.swiper.slideNext();
      },
    },
  });
}

/* 슬라이드 전환 */
function onSlideChange(state) {
  state.active = state.swiper.activeIndex;
  state.userPaused = false; // 이동하면 해당 영상 자동재생
  if (state.started) {
    ensurePlayer(state, state.active); // 처음 보는 영상이면 이때 생성
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

/* 사용자 일시정지 또는 화면 밖이면 정지, 아니면 재생 */
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
        // 아직 영상 미로드 → 재생 버튼이 첫 동작이면 로드+재생
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
      state.muted = !state.muted; // 한 번 켜면 계속 유지
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
    // 재생 상태에 따라 아이콘
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

/* 노출·정지 제어 */
function observeVisibility(state) {
  new IntersectionObserver(
    ([entry]) => {
      state.visible = entry.isIntersecting;
      if (state.visible && userInteracted) startSection(state);
      else syncPlayback(state); // 미상호작용·화면 밖 → 시작 안 함/정지
    },
    { threshold: 0.3, rootMargin: "200px" } // 200px 전에 미리 준비
  ).observe(state.root);
}

/* YT API 호출이 준비 전이면 throw 가능 → 안전 래퍼 */
function safe(fn) {
  try {
    fn();
  } catch (e) {}
}

/* ---------- Best Pick 브랜드 탭 ---------- */
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

/* 로딩 완료: 스켈레톤·에러 숨김 */
function finishLoading(sectionSelector) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;
  section.querySelector('[class*="__error"]')?.setAttribute("hidden", "");
}

/* ---------- Best Pick ---------- */
/* 카드 2장을 세로로 묶어 슬라이드 1개 = 2행 가로 스크롤 */
function renderBestPickGrid(products) {
  const wrapper = document.querySelector(".best-pick__carousel .swiper-wrapper");
  if (!wrapper) return;
  let html = "";
  for (let i = 0; i < products.length; i += 2) {
    const pair = products.slice(i, i + 2).map(productCardHtml).join("");
    html += `<div class="swiper-slide">${pair}</div>`;
  }
  wrapper.innerHTML = html;
}

function renderBestPick(brand) {
  const list =
    brand === "all" ? allProducts : allProducts.filter((p) => p.brand === brand);

  renderBestPickGrid(list.slice(0, 16)); /* 16개 = 8열 */
  initSwiper("bestpick", ".best-pick__carousel", ".best-pick__scrollbar");
  finishLoading(".best-pick");
}

function bindBestPickTabs() {
  const tabs = [...document.querySelectorAll(".best-pick__tab")];
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
        t.tabIndex = -1;
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      tab.tabIndex = 0;
      renderBestPick(tab.dataset.brand);
    });
  });
}

/* ---------- Jennie's Collection ---------- */
function renderJennies() {
  const products = allProducts.slice(0, 9);
  const wrapper = document.querySelector(".collection__carousel .swiper-wrapper");
  if (wrapper) {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      // 데스크탑: 3장씩 묶어 3행
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

/* ---------- More Collection ---------- */
function initCelebSwiper() {
  const celebEl = document.querySelector(".more-collection__celebs");
  if (!celebEl) return;

  swipers.celeb = new Swiper(celebEl, {
    slidesPerView: "auto",
    centeredSlides: true,
    spaceBetween: 16,
    loop: true, // 1>2>3>1>2>3 무한 반복
    breakpoints: {
      // 데스크탑: 칸 260 + 간격 182 → 활성(576)·비활성(260) 사이 시각상 24
      1200: { spaceBetween: 182 },
    },
    on: { init: syncCeleb, slideChange: syncCeleb },
  });
}

/* 셀럽 순서 */
const CELEBS = [
  { celeb: "gd", name: "지드래곤" },
  { celeb: "nayoung", name: "나영" },
  { celeb: "dex", name: "덱스" },
];

function syncCeleb(swiper) {
  const c = CELEBS[swiper.realIndex];
  if (!c) return;
  document
    .querySelectorAll("[data-celeb-label]")
    .forEach((el) => (el.textContent = c.name));
  renderMore(c.celeb);
}

function renderMore(celeb) {
  // 셀럽마다 다른 묶음
  const offset = { gd: 0, nayoung: 8, dex: 16 }[celeb] ?? 0;
  renderInto(".more-collection__carousel", allProducts.slice(offset, offset + 8));
  initSwiper("more", ".more-collection__carousel", ".more-collection__scrollbar");
  finishLoading(".more-collection");
}

/* ---------- 에러 / 재시도 ---------- */
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
  bindRetry(); // 다시 시도 버튼
  initHome();

  // 제니 리사이즈 시 재렌더
  let jennieResizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(jennieResizeTimer);
    jennieResizeTimer = setTimeout(() => {
      if (allProducts.length) renderJennies();
    }, 200);
  });
}
