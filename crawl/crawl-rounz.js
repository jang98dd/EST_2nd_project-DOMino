const fs = require("fs");
const { chromium } = require("playwright");


const BASE_URLS = [
  "https://rounz.com/home.php",
  "https://rounz.com/best_keyword.php?keywordIndex=3", //주소 더 추가하면 더 많은 상품 저장 가능
];


async function crawl() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();


  let allProducts = [];


  for (const url of BASE_URLS) {
    await page.goto(url, { waitUntil: "networkidle" });


    const products = await page.$$eval("a", links => {
      return links
        .map((a, index) => {
          const text = a.innerText.trim();
          if (!text || !text.includes("원")) return null;


          const lines = text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);


          const priceLine = lines.find(line => line.includes("원"));
          const price = Number(priceLine?.replace(/[^0-9]/g, ""));


          return {
            id: index + 1,
            brand: lines[0] || "",
            title: lines[1] || "",
            price,
            category: "eyewear",
            thumbnail: a.querySelector("img")?.src || "",
            sourceUrl: a.href,
          };
        })
        .filter(p => p && p.title && p.price);
    });


    allProducts.push(...products);
  }


  const uniqueProducts = [];
  const seen = new Set();


  allProducts.forEach(product => {
    const key = `${product.brand}-${product.title}`;


    if (!seen.has(key)) {
      seen.add(key);
      uniqueProducts.push({
        ...product,
        id: uniqueProducts.length + 1,
      });
    }
  });


  const data = {
    products: uniqueProducts.slice(0, 100),
  };


  fs.writeFileSync("../data/products.json", JSON.stringify(data, null, 2), "utf-8");


  await browser.close();


  console.log(`${data.products.length}개 상품 저장 완료`);
}


crawl();
