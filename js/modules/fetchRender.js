const DATA_URL = new URL('../../data/products.json', import.meta.url).href;

export async function fetchProducts() {
  try {
    const res = await fetch(DATA_URL);
    if(!res.ok) throw new Error('fetch fail');
    
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}
function createProductCard() {

}

function renderProducts() {

}