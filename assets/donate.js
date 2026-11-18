const form = document.getElementById("mandate");
  const amount = document.getElementById("amount");

  // Betrags-Chips und Freitextfeld synchron halten
  form.querySelectorAll('input[name="preset"]').forEach(r => r.addEventListener("change", () => { amount.value = r.value; }));
  amount.addEventListener("input", () => {
    form.querySelectorAll('input[name="preset"]').forEach(r => { r.checked = r.value === amount.value.trim(); });
  });

  // IBAN: gruppiert anzeigen und Prüfsumme (ISO 13616, mod 97) checken
  const ibanIn = document.getElementById("iban-in"), ibanMsg = document.getElementById("iban-msg");
  function ibanValid(raw) {
    const s = raw.replace(/\s+/g, "").toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
    if (s.startsWith("DE") && s.length !== 22) return false;
    const re = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, c => c.charCodeAt(0) - 55);
    let rest = 0;
    for (const ch of re) rest = (rest * 10 + +ch) % 97;
    return rest === 1;
  }
  ibanIn.addEventListener("input", () => {
    const pos = ibanIn.selectionStart, before = ibanIn.value.length;
    ibanIn.value = ibanIn.value.replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim();
    ibanIn.setSelectionRange(pos + ibanIn.value.length - before, pos + ibanIn.value.length - before);
    ibanMsg.textContent = "";
  });
  ibanIn.addEventListener("blur", () => {
    if (!ibanIn.value) return;
    ibanMsg.textContent = ibanValid(ibanIn.value) ? "✓ IBAN sieht gültig aus" : "Diese IBAN scheint nicht zu stimmen. Bitte prüfen.";
    ibanMsg.style.color = ibanValid(ibanIn.value) ? "var(--open)" : "#B42318";
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const need = ["amount", "last", "street", "city", "holder", "iban"].filter(n => !form.elements[n].value.trim());
    if (!form.elements.agree.checked) need.push("agree");
    const msg = document.getElementById("form-msg");
    if (need.length) {
      msg.textContent = "Bitte alle Pflichtfelder ausfüllen und dem Mandat zustimmen.";
      msg.style.color = "#B42318";
      form.elements[need[0]].focus();
      return;
    }
    if (!ibanValid(ibanIn.value)) { ibanIn.focus(); ibanIn.dispatchEvent(new Event("blur")); return; }
    msg.textContent = "* Pflichtfelder für die Lastschrift"; msg.style.color = "";
    window.print();
  });

  document.getElementById("print-empty").addEventListener("click", () => {
    form.reset(); amount.value = ""; form.querySelectorAll('input[name="preset"]').forEach(r => r.checked = false);
    ibanMsg.textContent = ""; window.print();
  });
