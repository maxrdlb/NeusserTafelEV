document.getElementById("reset-map").addEventListener("click", () => {
    let msg = "Zurückgesetzt. Die Karte lädt erst wieder nach Ihrem Klick.";
    try { localStorage.removeItem("map-ok"); } catch { msg = "Es war nichts gespeichert."; }
    document.getElementById("reset-msg").textContent = msg;
  });
