export function initHeaderMenu(headerRoot) {
  const menuToggleBtn = headerRoot.querySelector('.menu-toggle-btn');
  const mobileCloseBtn = headerRoot.querySelector('.mobile-close-btn');
  const mobileNavOverlay = headerRoot.querySelector('.mobile-nav-overlay');

  if (menuToggleBtn && mobileNavOverlay) {
    menuToggleBtn.onclick = function () {
      mobileNavOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; 
    };
  }

  if (mobileCloseBtn && mobileNavOverlay) {
    mobileCloseBtn.onclick = function () {
      mobileNavOverlay.classList.remove('open');
      document.body.style.overflow = ''; 
    };
  }
  const depthToggles = headerRoot.querySelectorAll('.mobile-menu-list .depth-toggle');
  
  depthToggles.forEach((toggleBtn) => {
    toggleBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const parentLi = toggleBtn.closest('.has-dropdown');
      if (!parentLi) return;

      headerRoot.querySelectorAll('.has-dropdown.is-open').forEach((openLi) => {
        if (openLi !== parentLi) {
          openLi.classList.remove('is-open');
          const otherBtn = openLi.querySelector('.depth-toggle');
          if (otherBtn) otherBtn.textContent = '+';
        }
      });

      const isOpen = parentLi.classList.toggle('is-open');
      toggleBtn.textContent = isOpen ? '−' : '+';
    };
  });

}