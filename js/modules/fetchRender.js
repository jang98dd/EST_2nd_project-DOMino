const DATA_URL = '../data/products.json';

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