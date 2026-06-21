import { initHeaderSearch } from "../modules/headerSearch.js";
import { initHeaderMenu } from "../modules/headerMenu.js";
import { initHeaderMega } from "../modules/headerMega.js";
import { initHeaderBadge } from "../modules/headerBadge.js";
import { initHeaderScroll } from "../modules/headerScroll.js";


export function initGlobalHeader() {
  const headerRoot = document.getElementById("header-root");
  
  if (!headerRoot) return;
  
  headerRoot.innerHTML = headerMarkup;
  
  initHeaderSearch(headerRoot);
  initHeaderMenu(headerRoot);
  initHeaderMega(headerRoot);
  initHeaderBadge(headerRoot);
  initHeaderScroll(headerRoot);
}
const headerMarkup = `
<header class="site-header">
  <div class="header-inner">
    <h1 class="logo">
      <a href="index.html" class="logo-link">ROUNZ
      <img src="assets/images/logo.webp" alt=""></a>
    </h1>

    <nav class="desktop-nav">
      <ul class="nav-list">
        <li><a href="product-list.html">상품</a></li>
        <li><a href="fitting-and-analysis.html">체험하기</a></li>
        <li><a href="product-list.html">브랜드</a></li>
        <li><a href="index.html">이벤트</a></li>
        <li><a href="index.html">고객지원</a></li>
      </ul>
      <div class="hover-slide-bar"></div>
    </nav>

    <div class="header-utils">
      <button class="icon-btn search-btn" aria-label="검색">
        <span class="material-icons">search</span>
      </button>
      <button class="icon-btn cart-btn" aria-label="장바구니">
        <span class="material-icons">shopping_cart</span>
      </button>
      
      <a href="login.html" class="icon-btn login desktop-only" aria-label="로그인">
        <span class="material-icons">login</span>
      </a>
      <button class="icon-btn wishlist-btn desktop-only" aria-label="로그인">
        <span class="material-icons">favorite_border</span>
      </button>
      
      <button class="icon-btn menu-toggle-btn mobile-tablet-only" aria-label="메뉴 열기">
        <span class="material-icons">menu</span>
      </button>
    </div>
  </div>

  <div class="desktop-mega-wrap">
    <div class="mega-inner">
      <div class="mega-col recommend-col">
        <h3 class="col-title">추천 서비스</h3>
        <a href="/fitting-and-analysis.html" class="recommend-card">
          <div class="card-text">
            <span class="material-icons">face</span>
            <div class="card-text__text">
              <strong>얼굴 분석</strong>
              <p>내 얼굴형에 어울리는 안경을<br>추천받아보세요</p>
            </div>
          </div>
          <span class="arrow">→</span>
        </a>
        <a href="fitting-and-analysis.html" class="recommend-card">
          <div class="card-text">
            <span class="material-icons">view_in_ar</span>
            <div class="card-text__text">
              <strong>가상피팅 시작하기</strong>
              <p>카메라로 실시간 착용감을<br>확인해보세요</p>
            </div>
          </div>
          <span class="arrow">→</span>
        </a>
      </div>

      <div class="mega-col body-md">
        <ul>
          <li><a href="product-list.html" class="main-link">전체 상품</a></li>
          <li><a href="product-list.html">신상품</a></li>
          <li><a href="product-list.html">베스트</a></li>
          <li><a href="product-list.html">안경테</a></li>
          <li><a href="product-list.html">선글라스</a></li>
          <li><a href="product-list.html">블루라이트 차단</a></li>
          <li><a href="product-list.html">액세서리</a></li>
          <li class="brand-view-li"><a href="product-list.html">브랜드별 보기 <span class="sub-arrow">&gt;</span></a></li>
        </ul>
      </div>

      <div class="mega-col body-md">
        <ul>
          <li><a href="fitting-and-analysis.html">얼굴형 분석 해보기</a></li>
          <li><a href="fitting-and-analysis.html">안경 착용 해보기</a></li>
          <li><a href="fitting-and-analysis.html">퍼스널 컬러 찾기</a></li>
          <li><a href="product-list.html">상품 비교하기</a></li>
        </ul>
      </div>
      
      <div class="mega-col body-md">
        <ul>
          <li><a href="product-list.html">전체 브랜드</a></li>
          <li><a href="product-list.html">인기 브랜드</a></li>
          <li><a href="product-list.html">프리미엄 브랜드</a></li>
          <li><a href="product-list.html">국내 브랜드</a></li>
          <li><a href="product-list.html">해외 브랜드</a></li>
        </ul>
      </div>

      <div class="mega-col body-md">
        <ul>
          <li><a href="index.html">진행 중인 이벤트</a></li>
          <li><a href="index.html">종료된 이벤트</a></li>
          <li><a href="index.html">기획전 / 콜라보레이션</a></li>
          <li><a href="index.html">쿠폰 / 혜택</a></li>
          <li><a href="index.html">당첨자 발표</a></li>
        </ul>
      </div>

      <div class="mega-col body-md">
        <ul>
          <li><a href="index.html">공지사항</a></li>
          <li><a href="index.html">자주 묻는 질문</a></li>
          <li><a href="index.html">1:1 문의</a></li>
          <li><a href="index.html">배송 안내</a></li>
          <li><a href="index.html">교환/반품 안내</a></li>
          <li><a href="index.html">매장 안내</a></li>
        </ul>
      </div>

      <div class="mega-col banner-col">
        <div class="banner-bg shadow-overlay">
          <div class="banner-caption">
            <span class="badge">NEW COLLECTION</span>
            <h4 class="banner-title">2026 신제품 컬렉션</h4>
            <a href="index.html" class="banner-link">컬렉션 보러가기 →</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="mobile-nav-overlay">
    <div class="mobile-nav-inner">
      <div class="mobile-nav-header">
        <h2 class="logo"><a href="index.html" class="logo-link">ROUNZ<img src="assets/images/logo.webp" alt=""></a></h2>
        <button class="mobile-close-btn" aria-label="메뉴 닫기">✕</button>
      </div>
      
      <div class="mobile-search-box">
        <input type="text" placeholder="검색어를 입력해주세요" class="search-input">
        <button class="search-submit material-icons">search</button>
      </div>

      <nav class="mobile-menu-container">
        <ul class="mobile-menu-list">
          <li><a href="index.html"><span class="menu-icon material-icons">home</span>홈</a></li>
          
          <li class="has-dropdown">
            <a href="/product-list.html"><span class="menu-icon material-icons">shopping_bag</span>상품</a>
            <button class="depth-toggle">+</button>
            <ul class="mobile-depth2">
              <li><a href="product-list.html">전체 상품</a></li>
              <li><a href="product-list.html">신상품</a></li>
              <li><a href="product-list.html">베스트</a></li>
              <li><a href="product-list.html">안경테</a></li>
              <li><a href="product-list.html">선글라스</a></li>
              <li><a href="product-list.html">블루라이트 차단</a></li>
              <li><a href="product-list.html">액세서리</a></li>
            </ul>
          </li>
          
          <li class="has-dropdown">
            <a href="fitting-and-analysis.html"><span class="menu-icon material-icons">bar_chart</span>체험하기</a>
            <button class="depth-toggle">+</button>
            <ul class="mobile-depth2">
              <li><a href="fitting-and-analysis.html">얼굴형 분석 해보기</a></li>
              <li><a href="fitting-and-analysis.html">안경 착용 해보기</a></li>
              <li><a href="fitting-and-analysis.html">퍼스널 컬러 찾기</a></li>
              <li><a href="fitting-and-analysis.html">상품 비교하기</a></li>
            </ul>
          </li>
          
          <li class="has-dropdown">
            <a href="/index.html"><span class="menu-icon material-icons">sell</span>브랜드</a>
            <button class="depth-toggle">+</button>
            <ul class="mobile-depth2">
              <li><a href="product-list.html">전체 브랜드</a></li>
              <li><a href="product-list.html">인기 브랜드</a></li>
              <li><a href="product-list.html">프리미엄 브랜드</a></li>
              <li><a href="product-list.html">국내 브랜드</a></li>
              <li><a href="product-list.html">해외 브랜드</a></li>
            </ul>
          </li>
          
          <li class="has-dropdown">
            <a href="index.html"><span class="menu-icon material-icons">redeem</span>이벤트</a>
            <button class="depth-toggle">+</button>
            <ul class="mobile-depth2">
              <li><a href="index.html">진행 중인 이벤트</a></li>
              <li><a href="index.html">종료된 이벤트</a></li>
              <li><a href="index.html">기획전 / 콜라보레이션</a></li>
              <li><a href="index.html">쿠폰 / 혜택</a></li>
              <li><a href="index.html">당첨자 발표</a></li>
            </ul>
          </li>
          
          <li class="has-dropdown">
            <a href="index.html"><span class="menu-icon material-icons">headset_mic</span>고객지원</a>
            <button class="depth-toggle">+</button>
            <ul class="mobile-depth2">
              <li><a href="index.html">공지사항</a></li>
              <li><a href="index.html">자주 묻는 질문</a></li>
              <li><a href="index.html">1:1 문의</a></li>
              <li><a href="index.html">배송 안내</a></li>
              <li><a href="index.html">교환/반품 안내</a></li>
              <li><a href="index.html">매장 안내</a></li>
            </ul>
          </li>
        </ul>
      </nav>

      <div class="mobile-nav-footer">
        <a href="login.html" class="login-link"><span class="menu-icon material-icons">person</span> 로그인 / 회원가입</a>
      </div>
    </div>
  </div>
</header>
`;

initGlobalHeader();