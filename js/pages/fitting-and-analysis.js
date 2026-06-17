document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const uploadedImage = document.getElementById('uploadedImage');
  const slideX = document.getElementById('slideX');
  const slideY = document.getElementById('slideY');
  const slideScale = document.getElementById('slideScale');
  const slideRotate = document.getElementById('slideRotate');
  fileInput.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedImage.src = event.target.result;
      uploadedImage.style.display = 'block';
      document.getElementById('uploadPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(e.target.files[0]);
  });
  const updateTransform = () => {
    uploadedImage.style.transform = `translate(calc(-50% + ${slideX.value}px), calc(-50% + ${slideY.value}px)) scale(${slideScale.value/100}) rotate(${slideRotate.value}deg)`;
  };
  document.querySelectorAll('.custom-range').forEach(input => input.addEventListener('input', updateTransform));
  document.getElementById('startAnalysisBtn').addEventListener('click', () => {
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('analysis').classList.add('active');
    
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    let p = 0;
    const interval = setInterval(() => {
      p++;
      document.getElementById('progressFill').style.width = `${p}%`;
      document.getElementById('progressText').textContent = `${p}%`;
      if (p >= 100) {
        clearInterval(interval);
        document.getElementById('loadingOverlay').style.display = 'none';
        document.getElementById('analysisResult').style.opacity = '1';
        drawCustomRadarChart([90, 85, 70, 95, 80]); 
      }
    }, 20);
  });
  function drawCustomRadarChart(vals) {
    const bgGroup = document.getElementById('radar-bg');
    const poly = document.getElementById('radar-data');
    const labelsContainer = document.getElementById('radar-labels');
    const labels = ['턱선', '이마', '광대', '길이', '비율'];
    if(bgGroup.innerHTML === "") {
      for(let level=5; level>=1; level--) {
        const r = 35 * (level / 5);
        let pts = [];
        for(let i=0; i<5; i++) {
          const angle = (Math.PI * 2 * i / 5) - (Math.PI / 2);
          pts.push(`${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`);
        }
        const p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        p.setAttribute("points", pts.join(" "));
        p.setAttribute("fill", level % 2 === 0 ? "#f9f9f9" : "#fff");
        p.setAttribute("stroke", "#eee");
        bgGroup.appendChild(p);
      }
    }
    let points = [];
    for(let i=0; i<5; i++) {
      const angle = (Math.PI * 2 * i / 5) - (Math.PI / 2);
      const r = 35 * (vals[i] / 100);
      points.push(`${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`);
    }
    poly.setAttribute('points', points.join(' '));
    poly.classList.add('active');
  }
});
document.getElementById('startAnalysisBtn').addEventListener('click', () => {
  document.querySelector('[data-target="analysis"]').click();
  document.getElementById('loadingOverlay').style.display = 'flex';
  
  const circle = document.getElementById('progressCircle');
  const text = document.getElementById('progressText');
  const circumference = 314;
  
  let p = 0;
  const interval = setInterval(() => {
    p++;
    const offset = circumference - (circumference * p / 100);
    circle.style.strokeDashoffset = offset;
    text.textContent = `${p}%`;
    
    if (p >= 100) {
      clearInterval(interval);
      document.getElementById('loadingOverlay').style.display = 'none';
      document.getElementById('analysisResult').style.opacity = '1';
      drawCustomRadarChart([90, 85, 70, 95, 80]);
    }
  }, 20);
});