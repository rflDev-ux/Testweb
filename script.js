"use strict";
/* ---- Edit these before launch ---- */
const CONFIG = {
  whatsapp: "15550123456", // country code + number, digits only
  address: "14 Rue des Lilas, New York, NY 10012",
  name: "Maison Aurelle"
};

const MENU = {
  Starters: [
    ["Oscietra Caviar","Blini, crème fraîche, chive",120],
    ["Burgundy Escargots","Garlic-parsley butter, toasted brioche",24],
    ["Hand-Dived Scallops","Cauliflower, brown butter, hazelnut",32],
    ["Duck Foie Gras Terrine","Fig compote, toasted brioche",36],
    ["Heirloom Tomato Tart","Whipped goat cheese, basil oil",22]
  ],
  Mains: [
    ["Beef Fillet Rossini","Seared foie gras, black truffle, Madeira jus",84],
    ["Line-Caught Sea Bass","Fennel purée, beurre blanc, caviar",68],
    ["Roasted Rack of Lamb","Provençal herbs, ratatouille, thyme jus",72],
    ["Duck Breast à l’Orange","Confit leg, roasted turnip, orange glaze",58],
    ["Wild Mushroom Risotto","Carnaroli rice, aged parmesan, truffle",46]
  ],
  Desserts: [
    ["Valrhona Soufflé","Tonka bean crème anglaise, gold leaf",26],
    ["Tarte Tatin","Caramelised apple, vanilla crème fraîche",18],
    ["Crème Brûlée","Madagascan vanilla, shortbread",16],
    ["Cheese Trolley","Five French cheeses, quince, walnut bread",28]
  ],
  Wine: [
    ["Champagne Brut Réserve","Blanc de Blancs, glass",26],
    ["Chablis Premier Cru","Burgundy, glass",19],
    ["Châteauneuf-du-Pape","Rhône, glass",24],
    ["Sauternes","Dessert wine, 75 ml",18]
  ]
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Year */
$("#yr").textContent = new Date().getFullYear();

/* Nav: solid on scroll, mobile menu, active link */
const nav = $("#nav"), burger = $("#burger"), links = $("#links");
const onScroll = () => nav.classList.toggle("solid", scrollY > 40);
addEventListener("scroll", onScroll, { passive: true }); onScroll();
const setMenu = open => {
  links.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
burger.addEventListener("click", () => setMenu(!links.classList.contains("open")));
$$("a", links).forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape") { setMenu(false); closeLb(); } });

const navAnchors = $$(".links a:not(.btn)");
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navAnchors.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

/* Lazy images (hero background + <img data-src>) */
const hero = $(".hero-bg");
const heroImg = new Image();
heroImg.onload = () => { hero.style.setProperty("--bg", `url("${heroImg.src}")`); hero.classList.add("loaded"); };
heroImg.src = hero.dataset.img;

const lazy = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const img = e.target; img.src = img.dataset.src; lazy.unobserve(img);
}), { rootMargin: "300px" });
$$("img[data-src]").forEach(i => { i.addEventListener("error", () => i.style.visibility = "hidden"); lazy.observe(i); });

/* Menu tabs */
const tabs = $("#tabs"), list = $("#menuList");
const money = n => "$" + n;
function showMenu(cat) {
  $$(".tab", tabs).forEach(t => t.setAttribute("aria-selected", t.dataset.cat === cat));
  list.innerHTML = "";
  MENU[cat].forEach(([name, desc, price], i) => {
    const d = document.createElement("div");
    d.className = "item"; d.style.animationDelay = i * 60 + "ms";
    d.innerHTML = `<h3></h3><span class="dots"></span><span class="price"></span><p></p>`;
    d.children[0].textContent = name; d.children[2].textContent = money(price); d.children[3].textContent = desc;
    list.append(d);
  });
}
Object.keys(MENU).forEach(cat => {
  const b = document.createElement("button");
  b.className = "tab"; b.role = "tab"; b.dataset.cat = cat; b.textContent = cat;
  b.addEventListener("click", () => showMenu(cat));
  tabs.append(b);
});
showMenu("Starters");

/* Gallery lightbox */
const lb = $("#lb"), lbi = $("#lbi");
let lastFocus;
$$("#gal .g").forEach(b => b.addEventListener("click", () => {
  const img = $("img", b);
  lbi.src = img.currentSrc || img.src; lbi.alt = img.alt;
  lastFocus = b; lb.hidden = false; $("#lbx").focus();
}));
function closeLb() { if (!lb.hidden) { lb.hidden = true; lastFocus && lastFocus.focus(); } }
lb.addEventListener("click", e => { if (e.target !== lbi) closeLb(); });

/* Reservation form */
const form = $("#form"), status = $("#status");
const timeSel = form.time, guestSel = form.guests;
["18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30"].forEach(t => timeSel.add(new Option(t, t)));
for (let i = 1; i <= 7; i++) guestSel.add(new Option(i + (i === 1 ? " guest" : " guests"), i));
const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
form.date.min = today.toISOString().slice(0, 10);

function check(f) {
  const v = f.value.trim(); let m = "";
  if (f.name === "name" && v.length < 2) m = "Enter your full name.";
  if (f.name === "phone" && !/^\+?[\d\s().-]{7,18}$/.test(v)) m = "Enter a valid phone number.";
  if (f.name === "date") {
    if (!v) m = "Choose a date.";
    else if (v < form.date.min) m = "Choose today or a later date.";
    else if (new Date(v + "T12:00").getDay() === 1) m = "We are closed on Mondays.";
  }
  if ((f.name === "time" || f.name === "guests") && !v) m = "Please select an option.";
  f.classList.toggle("invalid", !!m);
  const err = f.parentElement.querySelector(".err"); if (err) err.textContent = m;
  return !m;
}
const fields = ["name","phone","date","time","guests"].map(n => form[n]);
fields.forEach(f => { f.addEventListener("blur", () => check(f)); f.addEventListener("input", () => f.classList.contains("invalid") && check(f)); });

const waLink = text => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

form.addEventListener("submit", e => {
  e.preventDefault();
  const ok = fields.map(check).every(Boolean);
  if (!ok) { status.textContent = "Please correct the highlighted fields."; fields.find(f => f.classList.contains("invalid")).focus(); return; }
  const d = new Date(form.date.value + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const msg = `Hello ${CONFIG.name}, I would like to reserve a table.\n\nName: ${form.name.value.trim()}\nPhone: ${form.phone.value.trim()}\nDate: ${d}\nTime: ${form.time.value}\nGuests: ${form.guests.value}` + (form.notes.value.trim() ? `\nRequests: ${form.notes.value.trim()}` : "");
  status.textContent = "Opening WhatsApp. Press send there to complete your request.";
  window.open(waLink(msg), "_blank", "noopener");
});

/* Contact links + map */
$("#waBtn").href = waLink(`Hello ${CONFIG.name}, I have a question.`);
const q = encodeURIComponent(CONFIG.address);
$("#dirBtn").href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
$("#map").src = `https://www.google.com/maps?q=${q}&output=embed`;
