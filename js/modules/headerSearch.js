import { fetchProducts } from "../modules/fetchRender.js";

export function initHeaderSearch(headerRoot) {
  async function handleSearch(keyword) {
    const trimmedKeyword = keyword.trim().toLowerCase().replace(/\s+/g, '');

    if (!trimmedKeyword) {
      alert('검색어를 입력해주세요.');
      return;
    }

    try {
      const data = await fetchProducts();
      const products = data?.products || [];

      const matched = products.find(product => {
        const titleText = (product.title || product.name || '')
          .toLowerCase()
          .replace(/\s+/g, '');

        return titleText.includes(trimmedKeyword);
      });

      if (matched) {
        window.location.href = `../product-detail.html?id=${matched.id}`;
      } else {
        alert('일치하는 상품이 없습니다.');
      }
    } catch (error) {
      console.error('헤더 검색 중 에러 발생:', error);
    }
  }

  const desktopSearchBtn = headerRoot.querySelector('.search-btn');
  const mobileSearchInput = headerRoot.querySelector('.search-input');
  const mobileSearchSubmit = headerRoot.querySelector('.search-submit');

  desktopSearchBtn?.addEventListener('click', () => {
    const keyword = prompt('검색어를 입력해주세요.');
    if (keyword !== null) handleSearch(keyword);
  });

  mobileSearchSubmit?.addEventListener('click', () => {
    handleSearch(mobileSearchInput.value);
  });

  mobileSearchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch(mobileSearchInput.value);
    }
  });
}