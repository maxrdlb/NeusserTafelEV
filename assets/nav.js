// Mobile-Menü (alle Seiten)
(() => {
  const header = document.getElementById("top"), mb = header.querySelector(".menu-btn");
  mb.addEventListener("click", () => { const o = header.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
  header.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => { header.classList.remove("open"); mb.setAttribute("aria-expanded", false); }));
  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
