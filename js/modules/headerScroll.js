export function initHeaderScroll(headerRoot) {
  if (!headerRoot) return;

  const header = headerRoot.querySelector(".site-header");
  if (!header) return;

  let lastY = 0;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 50);
    if (y > lastY && y > 120) {
      header.classList.add("hide");
    } else {
      header.classList.remove("hide");
    }

    lastY = y;
  });
}