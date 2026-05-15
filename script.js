/* ============================================================
   EDITAR PRODUCTOS Y PRECIOS ACA
   - name: nombre del producto
   - category: "cascos", "escapes" o "accesorios"
   - price: precio final en numero (sin puntos ni comas)
   - installments: valor de cada cuota en numero
   - stock: true (hay stock) / false (sin stock)
   ============================================================ */
const products = [
  { name: "[EDITAR] Producto 1", category: "cascos", price: 0, installments: 0, stock: true },
  { name: "[EDITAR] Producto 2", category: "escapes", price: 0, installments: 0, stock: true },
  { name: "[EDITAR] Producto 3", category: "accesorios", price: 0, installments: 0, stock: false },
  { name: "[EDITAR] Producto 4", category: "accesorios", price: 0, installments: 0, stock: true }
];

const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");

const formatARS = (n) => new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
}).format(n);

function drawCards() {
  const search = searchInput.value.toLowerCase().trim();
  const category = categoryFilter.value;

  const filtered = products.filter((p) => {
    const byCategory = category === "all" || p.category === category;
    const bySearch = p.name.toLowerCase().includes(search);
    return byCategory && bySearch;
  });

  if (!filtered.length) {
    grid.innerHTML = "<p>No hay productos para ese filtro.</p>";
    return;
  }

  grid.innerHTML = filtered.map((p) => `
    <article class="card">
      <span class="tag">${p.category.toUpperCase()}</span>
      <h3>${p.name}</h3>
      <p class="price">${formatARS(p.price)}</p>
      <p>3 cuotas sin interes de ${formatARS(p.installments)}</p>
      <p class="stock ${p.stock ? "" : "out"}">${p.stock ? "En stock" : "Sin stock"}</p>
      <a class="primary" href="https://instagram.com/juan.bucchioni" target="_blank" rel="noreferrer">Consultar</a>
    </article>
  `).join("");
}

searchInput.addEventListener("input", drawCards);
categoryFilter.addEventListener("change", drawCards);
drawCards();
