export async function fetchProducts() {
  const response = await fetch('/data/products.json');
  const data = await response.json();
  return data.products.slice(1);
}

function createProductCard() {

}

function renderProducts() {

}