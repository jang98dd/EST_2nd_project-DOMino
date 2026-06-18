import { fetchProducts } from "../modules/fetchRender.js";
import { 
  addToCart, 
  toggleWishlist, 
  isProductLiked, 
  updateCartCount, 
  updateWishlistCount 
} from "../utils/storage.js";

async function init() {
  const data = await fetchProducts();

  const params = new URLSearchParams(location.search);
  const productId = Number(params.get('id')) || 1;

  const products = data.products || [];
  const product = products.find(item => item.id === productId);
  
  if (!productId) {
  alert("올바르지 않은 접근입니다. 상품 목록으로 이동합니다.");
  window.location.href = "./product-list.html"; 
  return;
}
  updateCartCount();
  updateWishlistCount();
  
  renderProductDetail(product);
  renderRecommendations(products, productId);
  
  initSlider();
  initAccordionTabs();
  initNavigation(product);
  initRecommendBox(); 
  initActions(product); 
}

function renderProductDetail(product) {
  const pId = product.id || 1; 
  
  const scoresPool = [4.8, 4.2, 4.5, 3.9, 4.7, 4.1, 4.6, 4.3];
  const reviewsPool = [128, 45, 89, 214, 34, 167, 92, 56];
  const mockScore = scoresPool[pId % scoresPool.length]; 
  const mockReviewCount = reviewsPool[(pId * 3) % reviewsPool.length];
  
  const mockColors = product.title?.includes('투명') 
    ? ['#f1f5f9', '#111111', '#475569'] 
    : ['#111111', '#3b2314', '#64748b'];

  const score = (product.rating && product.rating > 0) ? product.rating : mockScore;
  const reviewCount = (product.reviewCount && product.reviewCount > 0) ? product.reviewCount : mockReviewCount;

  const brandName = product.brand || 'ROUNZ';
  const productTitle = product.title || product.name || 'RZ-193';
  
  document.getElementById('brand').textContent = brandName;
  document.getElementById('title').textContent = productTitle;
  document.getElementById('price').textContent = product.price ? `${Number(product.price).toLocaleString()}원` : '가격 정보 없음';
  const ratingWrapper = document.querySelector('.rating-wrapper');
  if (ratingWrapper) {
    const starPercentage = (score / 5) * 100; 

    ratingWrapper.innerHTML = `
      <div class="rating-stars-outer">
        ★★★★★
        <div class="rating-stars-inner" style="width: ${starPercentage}%;">
          ★★★★★
        </div>
      </div>
      <span class="rating-count-text">
        ${score.toFixed(1)} (${reviewCount})
      </span>
    `;

    ratingWrapper.style.cursor = 'pointer';
    ratingWrapper.addEventListener('click', () => {
      const reviewTabBtn = document.getElementById('reviewTabBtn');
      if (reviewTabBtn) {
        reviewTabBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (!reviewTabBtn.classList.contains('active')) {
          reviewTabBtn.click();
        }
      }
    });
  }
  const colorList = document.getElementById('colorList');
  const targetColors = product.colors || mockColors;
  if (colorList && targetColors) {
    colorList.innerHTML = targetColors.map(color => `
      <div class="color-chip" style="background-color: ${color};" title="${color === '#f1f5f9' ? '투명(Crystal)' : color}"></div>
    `).join('');

    const firstColor = colorList.querySelector('.color-chip');
    if (firstColor) firstColor.classList.add('active');

    colorList.addEventListener('click', (e) => {
      const targetColor = e.target.closest('.color-chip');
      if (!targetColor) return;
      colorList.querySelectorAll('.color-chip').forEach(chip => chip.classList.remove('active'));
      targetColor.classList.add('active');
    });
  }

  const infoPanel = document.getElementById('infoPanel');
  if (infoPanel) {
    infoPanel.innerHTML = `
      <ul class="info-panel-list">
        <li><strong>브랜드:</strong> ${brandName}</li>
        <li><strong>모델명:</strong> ${productTitle}</li>
        <li><strong>소재:</strong> 최고급 아세테이트 및 하이엔드 티타늄 합금</li>
        <li><strong>특징:</strong> 인체공학적 설계가 반영되어 흘러내림을 방지하며, 아시안 핏 노즈 패드로 안착감이 뛰어납니다.</li>
      </ul>
    `;
  }
  const sizePanel = document.getElementById('sizePanel');
  if (sizePanel) {
    const lensWidth = productTitle.match(/\d+mm/)?.[0] || '49mm';
    sizePanel.innerHTML = `
      <table class="size-guide-table">
        <tr>
          <th>렌즈가로</th>
          <th>브릿지</th>
          <th>렌즈세로</th>
          <th>전체가로</th>
          <th>다리길이</th>
        </tr>
        <tr>
          <td>${lensWidth}</td>
          <td>21mm</td>
          <td>43mm</td>
          <td>143mm</td>
          <td>145mm</td>
        </tr>
      </table>
    `;
  }
  const tabReviewCount = document.getElementById('tabReviewCount');
  const reviewPanel = document.getElementById('reviewPanel');

  if (tabReviewCount) tabReviewCount.textContent = reviewCount;
  if (reviewPanel) {
    const reviewTemplates = [
      `디자인이 진짜 세련됐어요. ${brandName} 제품은 처음 사보는데 대만족입니다!`,
      `${productTitle} 살까 말까 고민했는데 실물이 미쳤어요. 투명감이나 색감이 고급스럽습니다.`,
      `얼굴형 추천 보고 구매했는데 맞춤 안경처럼 찰떡이네요. 인상이 또렷해 보인대요.`,
      `배송도 하루 만에 오고 패키징 상태가 너무 깔끔해서 선물용으로도 강추합니다.`,
      `가상 피팅 시스템 써보고 샀는데 화면으로 보던 피팅감이 그대로 나와서 놀랐어요.`,
      `무게감이 거의 안 느껴질 정도로 가볍습니다. 코눌림 심하신 분들 이거 사세요.`,
      `안경 유목민 생활 청산합니다. ${brandName} 브랜드 앞으로 자주 애용할 것 같아요.`,
      `사이즈가 너무 과하지 않고 데일리 룩 어디에나 매치하기 최적화되어 있습니다.`
    ];

    const users = ['ㅇ*ㅇ', 'ㅇ*ㅇ', 'ㅇ*ㅇ', 'ㅇ*ㅇ', 'ㅇ*ㅇ', 'ㅇ*ㅇ', 'ㅇ*ㅇ', 'ㅇ*ㅇ'];
    const starGradients = ['★★★★★', '★★★★★', '★★★★☆', '★★★★★', '★★★★☆'];

    const rIdx1 = pId % reviewTemplates.length;
    const rIdx2 = (pId * 3 + 2) % reviewTemplates.length;
    const rIdx3 = (pId * 7 + 4) % reviewTemplates.length;

    const selectedReviews = [
      { star: starGradients[pId % starGradients.length], user: users[pId % users.length], text: reviewTemplates[rIdx1] },
      { star: starGradients[(pId + 1) % starGradients.length], user: users[(pId + 2) % users.length], text: reviewTemplates[rIdx2] },
      { star: starGradients[(pId + 2) % starGradients.length], user: users[(pId + 5) % users.length], text: reviewTemplates[rIdx3] }
    ];

    reviewPanel.innerHTML = `
      <div class="detail-review-summary">
        <strong>⭐️ ${score.toFixed(1)} / 5.0</strong>
        <p>구매 고객들의 실제 솔직 후기 (${reviewCount}개)</p>
      </div>
      <div class="review-list">
        ${selectedReviews.map(r => `
          <div class="detail-review-item">
            <div class="detail-review-meta">
              <span class="detail-review-stars">${r.star}</span> <span>${r.user}</span>
            </div>
            <p class="detail-review-text">${r.text}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
  const deliveryPanel = document.getElementById('deliveryPanel');
  if (deliveryPanel) {
    deliveryPanel.innerHTML = `
      <div class="delivery-panel-box">
        <p><strong>🚚 배송 가이드</strong><br>영업일 오후 2시 이전 주문 시 당일 발송 처리가 진행됩니다. (ROUNZ 전 상품 무료 배송)</p>
        <p><strong>🔄 교환 및 반품 안내</strong><br>상품 수령일로부터 7일 이내 반품 접수가 가능합니다. 단, 프레임 스티커 제거, 바코드 훼손, 렌즈 커스텀 가공이 완료된 후에는 교환 및 반품이 불가능하므로 착용 전 제품 상태를 꼭 확인해 주세요.</p>
      </div>
    `;
  }

  const mainSlider = document.getElementById('mainSlider');
  const indicatorBar = document.getElementById('indicatorBar');
  const thumbList = document.getElementById('thumbList');
  const images = Array(5).fill(product.thumbnail);  
  
  if (images.length === 0) return;
  
  mainSlider.innerHTML = images.map(img => `<img src="${img}" class="main-img" alt="상세 이미지" draggable="false" />`).join('');
  indicatorBar.innerHTML = images.map((_, idx) => `<div class="indicator-bar ${idx === 0 ? 'active' : ''}" style="cursor:pointer;"></div>`).join('');
  thumbList.innerHTML = images.map(img => `<img src="${img}" class="thumb-img" alt="썸네일" />`).join('');
}

function initActions(product) {
  const likeBtn = document.querySelector('.btn-like-outline');
  const cartBtn = document.querySelector('.actions .cart');
  const buyBtn = document.querySelector('.actions .buy');
  
  const productTitle = product.title || product.name || '선택 상품';
  if (likeBtn) {
    const icon = likeBtn.querySelector('.material-icons');
    const isLiked = isProductLiked(product.id);
    if (isLiked) {
      likeBtn.classList.add('liked');
      if (icon) icon.textContent = 'favorite';
    }

    // [클릭 이벤트]
    likeBtn.addEventListener('click', () => {
      if (!icon) return;
      const currentLikedState = toggleWishlist(product); 
      
      if (currentLikedState) {
        likeBtn.classList.add('liked');
        icon.textContent = 'favorite';
        alert('❤️ 상품을 찜 리스트에 추가했습니다!');
      } else {
        likeBtn.classList.remove('liked');
        icon.textContent = 'favorite_border';
        alert('❤️ 찜한 상품에서 제외했습니다.');
      }
      
      updateWishlistCount();
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      addToCart(product, 1);
      updateCartCount();
      
      alert(`🛒 [${productTitle}] 상품이 장바구니에 담겼습니다.`);
    });
  }
 
  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      const confirmBuy = confirm(`🛍️ [${productTitle}]\n이 상품을 바로 구매하시겠습니까?`);
      if (confirmBuy) {
        window.location.href = '/cart.html';
      }
    });
  }
}
function renderRecommendations(products, currentProductId) {
  const recommendSlider = document.getElementById('recommendSlider');
  if (!recommendSlider) return;
  const filteredProducts = products.filter(item => item.id !== currentProductId).slice(0, 12);
  if (filteredProducts.length === 0) {
    recommendSlider.innerHTML = `<p style="padding: 20px; color: #888;">추천할 상품이 없습니다.</p>`;
    return;
  }
  let itemsHtml = filteredProducts.map(item => `
    <div class="recommend-item" data-id="${item.id}" style="cursor: pointer;">
      <img src="${item.thumbnail || ''}" alt="${item.title || item.name || '추천 상품'}" />
      <p>${item.title || item.name || '상품명 없음'}</p>
    </div>
  `).join('');
  itemsHtml += `
    <div class="recommend-item recommend-item--more">
      <div class="more-box"><span>더 보기</span><span class="material-icons">chevron_right</span></div>
    </div>
  `;
  recommendSlider.innerHTML = itemsHtml;
  recommendSlider.addEventListener('click', (e) => {
    const moreItem = e.target.closest('.recommend-item--more');
    if (moreItem) { window.location.href = './product-list.html'; return; }
    const item = e.target.closest('.recommend-item');
    if (item && item.dataset.id) { window.location.search = `?id=${item.dataset.id}`; }
  });
}

function initSlider() {
  const slider = document.getElementById('mainSlider');
  const indicatorContainer = document.getElementById('indicatorBar');
  const thumbContainer = document.getElementById('thumbList');
  if (!slider) return;
  const getIndicators = () => indicatorContainer.querySelectorAll('.indicator-bar');
  const getThumbs = () => thumbContainer.querySelectorAll('.thumb-img');
  const moveToSlide = (index) => { slider.scrollTo({ left: index * slider.clientWidth, behavior: 'smooth' }); };
  slider.addEventListener('scroll', () => {
    const pageIndex = Math.round(slider.scrollLeft / slider.clientWidth);
    getIndicators().forEach((bar, idx) => bar.classList.toggle('active', idx === pageIndex));
  });
  indicatorContainer.addEventListener('click', (e) => {
    const indicators = Array.from(getIndicators());
    const clickedIdx = indicators.indexOf(e.target);
    if (clickedIdx !== -1) moveToSlide(clickedIdx);
  });
  thumbContainer.addEventListener('click', (e) => {
    const thumbs = Array.from(getThumbs());
    const clickedIdx = thumbs.indexOf(e.target);
    if (clickedIdx !== -1) moveToSlide(clickedIdx);
  });
  let isDown = false, startX, scrollLeft;
  slider.addEventListener('mousedown', (e) => { isDown = true; slider.style.scrollSnapType = 'none'; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
  slider.addEventListener('mouseleave', () => { if (!isDown) return; isDown = false; slider.style.scrollSnapType = 'x mandatory'; });
  slider.addEventListener('mouseup', () => { if (!isDown) return; isDown = false; slider.style.scrollSnapType = 'x mandatory'; moveToSlide(Math.round(slider.scrollLeft / slider.clientWidth)); });
  slider.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); slider.scrollLeft = scrollLeft - (e.pageX - slider.offsetLeft - startX) * 1.5; });
}

function initAccordionTabs() {
  const accButtons = document.querySelectorAll('.acc-btn');
  const panels = document.querySelectorAll('.panel');
  if (accButtons.length > 0 && panels.length > 0) {
    accButtons[0].classList.add('active');
    panels[0].classList.add('active');
  }
  accButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const targetPanel = panels[index];
      const isActive = btn.classList.contains('active');
      accButtons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      if (window.innerWidth >= 1200 || !isActive) {
        btn.classList.add('active');
        targetPanel.classList.add('active');
      }
    });
  });
}

function initNavigation(product) {
  const fittingBtn = document.querySelector('.fitting-box .btn--cta-lg');
  if (fittingBtn) fittingBtn.addEventListener('click', () => { window.location.href = `./fitting-and-analysis.html?id=${product.id}`; });
}

function initRecommendBox() {
  const chipEl = document.getElementById('faceShapeChip');
  const panelTextEl = document.getElementById('recPanelText');
  const accBtn = document.getElementById('recAccBtn');
  const panel = document.getElementById('recPanel');
  if (!chipEl || !accBtn || !panel) return;
  const faceData = [
    { shape: "달걀형 추천", desc: "달걀형 얼굴의 완벽한 비율을 더욱 균형감 있게 잡아줍니다." },
    { shape: "둥근형 추천", desc: "안경테의 샤프한 라인이 동그란 얼굴형을 시각적으로 보완합니다." },
    { shape: "각진형 추천", desc: "안경테 고유의 부드러운 곡선 디자인이 각진 라인을 자연스럽게 커버합니다." },
    { shape: "하트형 추천", desc: "상단 프레임이 역삼각형 얼굴의 이마 라인을 안정감 있게 분산시켜 줍니다." }
  ];
  const selectedData = faceData[Math.floor(Math.random() * faceData.length)];
  chipEl.textContent = selectedData.shape;
  panelTextEl.textContent = selectedData.desc;
  accBtn.addEventListener('click', () => { accBtn.classList.toggle('active'); panel.classList.toggle('active'); });
}

init();