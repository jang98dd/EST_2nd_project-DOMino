export function initHeaderMega(headerRoot) {
  const siteHeader = headerRoot.querySelector('.site-header');
  const desktopNav = headerRoot.querySelector('.desktop-nav');
  const navItems = headerRoot.querySelectorAll('.desktop-nav .nav-list li');
  const slideBar = headerRoot.querySelector('.hover-slide-bar');
  const megaCols = headerRoot.querySelectorAll('.mega-col.body-md');

  if (desktopNav && slideBar && navItems.length > 0) {
    navItems.forEach((item, index) => {
      item.onmouseenter = () => {
        const menuWidth = desktopNav.offsetWidth / navItems.length;
        slideBar.style.width = `${menuWidth * 0.8}px`;
        slideBar.style.transform = `translateX(${item.offsetLeft + menuWidth * 0.1}px)`;

        megaCols.forEach(c => c.classList.remove('active-blue-col'));
        if (megaCols[index]) {
          megaCols[index].classList.add('active-blue-col');
        }
      };
    });

    desktopNav.onmouseleave = function () {
      slideBar.style.width = '0';
    };
  }

  megaCols.forEach((col, index) => {
    col.onmouseenter = () => {
      megaCols.forEach(c => c.classList.remove('active-blue-col'));
      col.classList.add('active-blue-col');
      if (desktopNav && slideBar && navItems[index]) {
        const menuWidth = desktopNav.offsetWidth / navItems.length;
        slideBar.style.width = `${menuWidth * 0.8}px`;
        slideBar.style.transform = `translateX(${navItems[index].offsetLeft + menuWidth * 0.1}px)`;
      }
    };
  });
  if (siteHeader) {
    siteHeader.onmouseleave = () => {
      megaCols.forEach(c => c.classList.remove('active-blue-col'));
      if (slideBar) slideBar.style.width = '0';
    };
  }
}