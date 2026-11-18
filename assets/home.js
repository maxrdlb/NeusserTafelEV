// ---------- Öffnungszeiten: eine Datenquelle für Wochentabelle + "Heute"-Box ----------
  // Tage: 1 = Montag … 5 = Freitag
  const SCHEDULE = [
    { name: "Tafelladen",        where: "Hauptstelle Neuss",     slots: { 1: ["14:30","16:30"], 3: ["14:30","16:30"], 5: ["14:30","16:30"] } },
    { name: "Neuanmeldung",      where: "Hauptstelle Neuss",     slots: { 1: ["14:30","16:00"], 3: ["14:30","16:00"], 5: ["14:30","16:00"] } },
    { name: "Secondhandladen",   where: "Hauptstelle Neuss",     slots: { 1: ["13:00","16:00"], 3: ["13:00","16:00"], 5: ["13:00","16:00"] } },
    { name: "Tafeltaxi",         where: "Lieferung nach Hause",  slots: { 5: ["14:00","16:30"] } },
    { name: "Ausgabe Kleinenbroich", where: "Am Hallenbad 66",   slots: { 2: ["14:30","16:00"] } },
    { name: "Ausgabe Derikum",   where: "Am Goldberg 112",       slots: { 4: ["15:00","17:00"] } },
    { name: "Büro (telefonisch)", where: "02131 8705",           slots: { 1: ["09:00","13:00"], 2: ["09:00","13:00"], 3: ["09:00","13:00"], 4: ["09:00","13:00"], 5: ["09:00","13:00"] } },
  ];
  const DAYNAMES = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];

  // aktuelle Zeit in Deutschland, unabhängig von der Zeitzone des Geräts
  function berlinNow() {
    const p = Object.fromEntries(new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
      day: "numeric", month: "long"
    }).formatToParts(new Date()).map(x => [x.type, x.value]));
    const map = { "So.":0, "Mo.":1, "Di.":2, "Mi.":3, "Do.":4, "Fr.":5, "Sa.":6 };
    return { day: map[p.weekday], minutes: (+p.hour % 24) * 60 + +p.minute, label: `${p.day}. ${p.month}` };
  }
  const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmt = t => t.replace(/^0/, "");

  function render() {
    const now = berlinNow();

    // Wochentabelle
    const tbody = document.querySelector("#week tbody");
    tbody.innerHTML = SCHEDULE.map(s => `
      <tr>
        <th scope="row">${s.name}<small>${s.where}</small></th>
        ${[1,2,3,4,5].map(d => {
          const sl = s.slots[d];
          return `<td class="${sl ? "on" : ""} ${d === now.day ? "col-today" : ""}">${sl ? `<span>${fmt(sl[0])}–${sl[1]}</span>` : "–"}</td>`;
        }).join("")}
      </tr>`).join("");
    document.querySelectorAll("#week thead th[data-day]").forEach(th => th.classList.toggle("today", +th.dataset.day === now.day));

    // Mobil: Liste nach Wochentagen, heute zuerst
    const order = [1,2,3,4,5].sort((a, b) => (a === now.day ? -1 : b === now.day ? 1 : 0));
    document.getElementById("days").innerHTML = order.map(d => `
      <li class="day ${d === now.day ? "today" : ""}">
        <h3>${DAYNAMES[d]}${d === now.day ? " <em>heute</em>" : ""}</h3>
        <dl>${SCHEDULE.filter(s => s.slots[d]).map(s => `<div><dt>${s.name}<small>${s.where}</small></dt><dd>${fmt(s.slots[d][0])}–${s.slots[d][1]}</dd></div>`).join("")}</dl>
      </li>`).join("");

    // Heute-Box
    document.getElementById("status-date").textContent = `${DAYNAMES[now.day]}, ${now.label}`;
    const list = document.getElementById("status-list");
    const items = SCHEDULE.filter(s => s.name !== "Neuanmeldung").map(s => {
      const sl = s.slots[now.day];
      let state;
      if (!sl) {
        const next = [1,2,3,4,5,6,7].map(o => (now.day + o) % 7).find(d => s.slots[d]);
        state = `<span class="pill">Geschlossen<small>wieder ${DAYNAMES[next]}</small></span>`;
      } else if (now.minutes < toMin(sl[0])) {
        state = `<span class="pill is-later">ab ${fmt(sl[0])} Uhr</span>`;
      } else if (now.minutes < toMin(sl[1])) {
        state = `<span class="pill is-open">Geöffnet<small>bis ${sl[1]} Uhr</small></span>`;
      } else {
        state = `<span class="pill">Heute beendet</span>`;
      }
      return { s, open: !!sl, html: `<li><span class="name">${s.name}</span><span class="where">${s.where}</span><span class="state">${state}</span></li>` };
    });
    // was heute stattfindet, zuerst
    items.sort((a, b) => b.open - a.open);
    list.innerHTML = items.slice(0, 4).map(i => i.html).join("");
  }
  render();
  setInterval(render, 60_000);

  // IBAN kopieren
  document.getElementById("copy-iban").addEventListener("click", async e => {
    const label = e.currentTarget.querySelector("span");
    try {
      await navigator.clipboard.writeText(document.getElementById("iban").textContent.replace(/\s/g, ""));
      label.textContent = "Kopiert";
    } catch { label.textContent = "Bitte manuell kopieren"; }
    setTimeout(() => label.textContent = "IBAN kopieren", 2200);
  });


  // Kontaktformular: ohne Server, erzeugt eine E-Mail
  document.getElementById("contact-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = `[Website] ${f.get("topic")}`;
    const body = `${f.get("message")}\n\n—\n${f.get("name")}\n${f.get("email")}`;
    location.href = `mailto:neussertafel@yahoo.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  // Karte: OpenStreetMap erst nach Zustimmung laden
  const PLACES = [
    { name: "Hauptstelle", addr: "Düsseldorfer Str. 50, 41460 Neuss", ll: [51.21340, 6.69217], main: true },
    { name: "Außenstelle Kleinenbroich", addr: "Am Hallenbad 66, 41352 Korschenbroich", ll: [51.20399, 6.55463] },
    { name: "Ausgabestelle Derikum", addr: "Am Goldberg 112, 41469 Neuss", ll: [51.16061, 6.74251] },
  ];
  const mapEl = document.getElementById("map");
  let map, markers = [];
  function loadCss(href) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.append(l); }
  function loadMap() {
    if (map) return;
    loadCss("assets/vendor/leaflet/leaflet.css");
    const sc = document.createElement("script");
    sc.src = "assets/vendor/leaflet/leaflet.js";
    sc.onload = () => {
      mapEl.classList.add("loaded");
      map = L.map("map-canvas", { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      markers = PLACES.map((p, i) => L.marker(p.ll, {
        icon: L.divIcon({ className: "", html: `<div class="pin ${p.main ? "main" : ""}">${i + 1}</div>`, iconSize: p.main ? [42, 42] : [34, 34] })
      }).addTo(map).bindPopup(`<strong>${p.name}</strong><br>${p.addr}`));
      map.fitBounds(PLACES.map(p => p.ll), { padding: [40, 40] });
    };
    document.head.append(sc);
  }
  document.getElementById("map-load").addEventListener("click", () => {
    if (document.getElementById("map-remember").checked) { try { localStorage.setItem("map-ok", "1"); } catch {} }
    loadMap();
  });
  try { if (localStorage.getItem("map-ok") === "1") loadMap(); } catch {}
  document.querySelectorAll(".place[data-pin]").forEach(el => el.addEventListener("click", e => {
    if (!map || e.target.closest("a")) return;
    const i = +el.dataset.pin; map.setView(PLACES[i].ll, 16); markers[i].openPopup();
  }));
