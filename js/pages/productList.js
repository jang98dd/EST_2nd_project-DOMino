import { fetchProducts } from "../modules/fetchRender";

const state = {
  products: [],
  
  sortType: "popular",

  filters: {
    shape: [],
    gender: 'all',
    size: [],
    color: [],
    price: 500000
  },

  page: 1,
  limit: 12
};

let isSheetOpen = false;

async function init() {
  const products = await fetchProducts();

  state.products = products;
  
}