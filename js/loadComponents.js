async function loadComponent(host) {
  const url = host.dataset.include;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const nodes = [...doc.body.children];
    if (nodes.length) host.replaceWith(...nodes);
    else host.remove();
  } catch (err) {
    console.error("[loadComponents] 로드 실패:", url, err);
    host.remove();
  }
}

async function loadComponents() {
  const hosts = [...document.querySelectorAll("[data-include]")];
  if (!hosts.length) return;
  try {
    await Promise.all(hosts.map(loadComponent));
  } finally {
    document.dispatchEvent(new CustomEvent("components:loaded"));
  }
}

loadComponents();
