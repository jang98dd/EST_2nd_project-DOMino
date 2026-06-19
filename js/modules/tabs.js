export function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".section-panel");

  let current = 0;

  const activate = (i) => {
    tabs.forEach((t, idx) => {
      t.classList.toggle("active", idx === i);
      panels[idx].classList.toggle("active", idx === i);
    });

    tabs[i].focus();
    current = i;
  };

  activate(0);

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(i));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") activate((current + 1) % tabs.length);
    if (e.key === "ArrowLeft") activate((current - 1 + tabs.length) % tabs.length);
    if (e.key === "Home") activate(0);
    if (e.key === "End") activate(tabs.length - 1);
  });
}