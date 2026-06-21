export function initHeaderScroll(headerRoot) {
  if (!headerRoot) return;

  const header = headerRoot.querySelector(".site-header");
  if (!header) return;

  let lastY = window.scrollY;

  // 아래로 스크롤하면 헤더를 위로 숨기고, 위로 스크롤하면 다시 표시한다.
  // .scrolled 는 스크롤 시 배경 블러/그림자 효과용.
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      header.classList.toggle("scrolled", y > 50);
      if (y > lastY && y > 120) {
        header.classList.add("hide");
      } else {
        header.classList.remove("hide");
      }
      lastY = y;
    },
    { passive: true }
  );
}