import { fetchProducts } from "../modules/fetchRender.js";
import { initTabs } from "../components/tabs.js";

initTabs();

const FACE_PRESETS = {
  balance:  [90, 35, 45, 55, 70], 
  angular:  [40, 90, 50, 35, 40], 
  inverted: [45, 40, 90, 60, 35], 
  heart:    [50, 35, 55, 90, 45], 
  round:    [60, 30, 40, 35, 90]  
};
let currentBaseScores = FACE_PRESETS.balance;

const SCORE_CONFIG = {
  weights: { xEffect: 0.25, yEffect: 0.35, scaleEffect: 0.40, rotateEffect: 0.50 }
};

const tabButtons = document.querySelectorAll('.mobile-tabs .tab-btn');
const sectionPanels = document.querySelectorAll('.section-panel');
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetSectionId = button.getAttribute('data-tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    sectionPanels.forEach(panel => {
      if (panel.getAttribute('id') === targetSectionId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  });
});
const savedGlassesId = localStorage.getItem('selectedGlasses');

if (savedGlassesId) {
  const glassesOverlay = document.getElementById('glassesOverlay');
  
  if (glassesOverlay) {
    glassesOverlay.classList.add('active');
    const targetItem = document.querySelector(`.fitting-item[data-id="${savedGlassesId}"]`);
    if (targetItem) {
      document.querySelectorAll('.fitting-item').forEach(el => el.classList.remove('active'));
      targetItem.classList.add('active');
    }
  }
  localStorage.removeItem('selectedGlasses');
}
function applyGlassesToOverlay(product) {
  try {
    if (!product) throw new Error("적용할 상품 데이터가 존재하지 않습니다.");
    if (!product.thumbnail) throw new Error(`[ID: ${product.id}] 상품에 thumbnail 경로가 누락되었습니다.`);

    const glassesOverlay = document.getElementById('glassesOverlay');
    if (glassesOverlay) {
      glassesOverlay.style.backgroundImage = `url('${product.thumbnail}')`;
      console.log(`[피팅 에셋 매핑 성공] ${product.brand} - ${product.title}`);
    }
  } catch (error) {
    console.error("안경 이미지 렌더링 오류:", error);
    alert("안경 이미지를 화면에 표시할 수 없습니다.");
  }
}

function calculateDynamicScores() {
  const slideX = document.getElementById('slideX');
  const slideY = document.getElementById('slideY');
  const slideScale = document.getElementById('slideScale');
  const slideRotate = document.getElementById('slideRotate');

  const x = parseInt(slideX?.value || 0, 10);
  const y = parseInt(slideY?.value || 0, 10);
  const scale = parseInt(slideScale?.value || 100, 10);
  const rotate = parseInt(slideRotate?.value || 0, 10);

  const { weights } = SCORE_CONFIG;
  const [bScore, aScore, iScore, hScore, rScore] = currentBaseScores;

  const balance = Math.max(10, bScore - Math.abs(x) * weights.xEffect - Math.abs(y) * weights.yEffect);
  const angular = Math.min(95, Math.max(10, aScore + (rotate * weights.rotateEffect) + (x * weights.xEffect)));
  const inverted = Math.min(95, Math.max(10, iScore - (y * weights.yEffect)));
  const heart    = Math.min(95, Math.max(10, hScore + (scale - 100) * weights.scaleEffect));
  const round    = Math.min(95, Math.max(10, rScore - Math.abs(x) * weights.xEffect));

  return [balance, angular, inverted, heart, round];
}

function renderLiveFitting() {
  const glassesOverlay = document.getElementById('glassesOverlay');
  const slideX = document.getElementById('slideX');
  const slideY = document.getElementById('slideY');
  const slideScale = document.getElementById('slideScale');
  const slideRotate = document.getElementById('slideRotate');

  if (!glassesOverlay) return;

  const x = slideX?.value || 0;
  const y = slideY?.value || 0;
  const scale = (slideScale?.value || 100) / 100;
  const rotate = slideRotate?.value || 0;

  if (slideX) slideX.nextElementSibling.textContent = `${x}px`;
  if (slideY) slideY.nextElementSibling.textContent = `${y}px`;
  if (slideScale) slideScale.nextElementSibling.textContent = `${slideScale.value}%`;
  if (slideRotate) slideRotate.nextElementSibling.textContent = `${slideRotate.value}°`;

  glassesOverlay.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`;
}
function renderRadarChart() {
  const radarPolygon = document.getElementById('radar-data');
  if (!radarPolygon) return;

  const cx = 50, cy = 50;
  const maxRadius = 45;
  const angles = [
    -Math.PI / 2,
    -Math.PI / 2 + (Math.PI * 2 / 5),
    -Math.PI / 2 + (Math.PI * 2 / 5) * 2,
    -Math.PI / 2 + (Math.PI * 2 / 5) * 3,
    -Math.PI / 2 + (Math.PI * 2 / 5) * 4
  ];

  const scores = calculateDynamicScores();
  const pointArr = scores.map((score, i) => {
    const radius = (score / 100) * maxRadius;
    const x = cx + radius * Math.cos(angles[i]);
    const y = cy + radius * Math.sin(angles[i]);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  radarPolygon.setAttribute('points', pointArr.join(' '));
}
function handleImageUpload(e) {
  const file = e.target.files[0];
  const uploadedImage = document.getElementById('uploadedImage');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const glassesOverlay = document.getElementById('glassesOverlay');

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (uploadedImage) {
        uploadedImage.src = event.target.result;
        uploadedImage.style.display = 'block';
      }
      if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
      if (glassesOverlay) glassesOverlay.classList.add('active'); 
      
      renderLiveFitting();
    };
    reader.readAsDataURL(file);
  }
}

async function initializeApp() {
  console.log("ROUNZ 시스템 모듈 초기화 구동...");
  
  let productsArray = []; 
  try {
    const rawData = await fetchProducts();
    if (!rawData) throw new Error("서버 혹은 파일로부터 받아온 데이터가 무효합니다.");

    let targetGlasses = null;
    if (Array.isArray(rawData)) {
      productsArray = rawData; 
      targetGlasses = rawData.find(item => item.id === 29) || rawData[0];
    } else if (rawData.products && Array.isArray(rawData.products)) {
      productsArray = rawData.products; 
      targetGlasses = rawData.products.find(item => item.id === 29) || rawData.products[0];
    } else if (rawData.data && Array.isArray(rawData.data)) {
      productsArray = rawData.data; 
      targetGlasses = rawData.data.find(item => item.id === 29) || rawData.data[0];
    } else if (typeof rawData === 'object' && rawData.id) {
      productsArray = [rawData]; 
      targetGlasses = rawData;
    }
    
    if (!targetGlasses) throw new Error("매칭 가능한 상품 데이터를 트리에서 찾을 수 없습니다.");
    applyGlassesToOverlay(targetGlasses);

  } catch (globalError) {
    console.error("초기 데이터 로딩 및 파싱 단계 중 예외 발생:", globalError);
  }

  const fittingGlassesList = document.getElementById('fittingGlassesList');
  if (fittingGlassesList && productsArray.length > 0) {
    fittingGlassesList.innerHTML = ''; 
    productsArray.slice(0, 6).forEach((product) => {
      const img = document.createElement('img');
      img.src = product.thumbnail;
      img.alt = product.title;
      img.classList.add('fitting-item'); 
      if (product.id === 29) img.classList.add('active');
      img.addEventListener('click', () => {
        document.querySelectorAll('.fitting-item').forEach(el => el.classList.remove('active'));
        img.classList.add('active');
        applyGlassesToOverlay(product);
      });

      fittingGlassesList.appendChild(img);
    });
  }
  const fileInput = document.getElementById('fileInput');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const btnUploadTrigger = document.getElementById('btnUploadTrigger');
  const startAnalysisBtn = document.getElementById('startAnalysisBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const analysisResult = document.getElementById('analysisResult');
  const progressText = document.getElementById('progressText');
  const progressCircle = document.getElementById('progressCircle');

  if (fileInput) fileInput.addEventListener('change', handleImageUpload);
  if (uploadPlaceholder) uploadPlaceholder.addEventListener('click', () => fileInput?.click());
  if (btnUploadTrigger) btnUploadTrigger.addEventListener('click', () => fileInput?.click());

  const sliders = ['slideX', 'slideY', 'slideScale', 'slideRotate'];
  sliders.forEach(id => {
    document.getElementById(id)?.addEventListener('input', renderLiveFitting);
  });
  if (startAnalysisBtn) {
    startAnalysisBtn.addEventListener('click', () => {
      if (loadingOverlay) loadingOverlay.style.display = 'flex';
      if (analysisResult) analysisResult.classList.remove('visible');

      let current = 0;
      const timer = setInterval(() => {
        current += 5;
        if (current > 100) {
          current = 100;
          clearInterval(timer);
          
          if (loadingOverlay) loadingOverlay.style.display = 'none';
          if (analysisResult) analysisResult.classList.add('visible');
          
          const presetKeys = Object.keys(FACE_PRESETS);
          const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)];
          currentBaseScores = FACE_PRESETS[randomKey]; 

          renderRadarChart();
        }
        if (progressText) progressText.textContent = `${current}%`;
        if (progressCircle) progressCircle.style.strokeDashoffset = 314 - (current / 100) * 314;
      }, 20);
    });
  }
  renderLiveFitting();
}

window.addEventListener('load', initializeApp);