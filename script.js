var $ = function (s) { return document.querySelector(s); };
var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
var root = document.documentElement, globe = null, lenis = null, lang = "fr";
var vh = innerHeight, mx = -99, my = -99, rx = -99, ry = -99;
root.classList.add("js", "lock");
function t(fr, en) { return lang === "en" ? en : fr; }

/* Globe Vanta.js, fixe en fond de tout le film */
function initGlobe() {
  try {
    if (globe) globe.destroy();
    var l = document.body.classList.contains("light");
    globe = VANTA.GLOBE({
      el: "#vanta", THREE: window.THREE, mouseControls: true, touchControls: true,
      gyroControls: false, minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1, size: 1.1,
      color: l ? 0x0055ee : 0x00e5a0, color2: l ? 0x00a6e0 : 0x4dd9ff,
      backgroundColor: l ? 0xf0f4ff : 0x05090c
    });
  } catch (err) { console.warn("Vanta indisponible", err); }
}

/* Thème : soleil en sombre, lune en clair */
function theme() {
  var light = document.body.classList.toggle("light");
  $("#tt").textContent = light ? "🌙" : "☀️";
  try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
  initGlobe();
}
try { if (localStorage.getItem("theme") === "light") { document.body.classList.add("light"); $("#tt").textContent = "🌙"; } } catch (e) {}

/* Langue FR / EN + texte qui s'allume au scroll */
$$("[data-en]").forEach(function (e) { e.dataset.fr = e.innerHTML; });
function wrap(el) {
  (function walk(n) {
    [].slice.call(n.childNodes).forEach(function (c) {
      if (c.nodeType === 3) {
        var f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) f.appendChild(document.createTextNode(w));
          else { var s = document.createElement("span"); s.className = "w"; s.textContent = w; f.appendChild(s); }
        });
        c.parentNode.replaceChild(f, c);
      } else if (c.nodeType === 1) walk(c);
    });
  })(el);
}
var txts = $$(".txt p");
function words() { txts.forEach(wrap); }
function setLang(l) {
  lang = l; root.lang = l;
  $$("[data-en]").forEach(function (e) { e.innerHTML = l === "en" ? e.dataset.en : e.dataset.fr; });
  words(); $("#lb").textContent = l === "en" ? "FR" : "EN";
  try { localStorage.setItem("lang", l); } catch (e) {}
}
function toggleLang() { setLang(lang === "fr" ? "en" : "fr"); }
words();

/* Lenis + ancres + points de navigation */
if (window.Lenis) { lenis = new Lenis({ duration: 1.3 }); lenis.stop(); }
var ids = ["hero", "about", "articles", "skills", "exp", "docs", "contact"];
ids.forEach(function (id) { var d = document.createElement("i"); d.dataset.go = id; $("#dots").appendChild(d); });
document.addEventListener("click", function (e) {
  var a = e.target.closest("[data-go]");
  if (!a) return;
  e.preventDefault();
  var el = document.getElementById(a.dataset.go);
  if (lenis) lenis.scrollTo(el, { offset: -60, duration: 2 }); else el.scrollIntoView({ behavior: "smooth" });
});

/* Apparition au scroll (puis on retire la classe pour libérer les effets) */
var io = new IntersectionObserver(function (list) {
  list.forEach(function (x) {
    if (!x.isIntersecting) return;
    var el = x.target; el.classList.add("in"); io.unobserve(el);
    setTimeout(function () { el.classList.remove("rv", "in"); el.style.transitionDelay = ""; }, 1500);
  });
}, { threshold: 0.12 });
$$(".rv").forEach(function (e) { io.observe(e); });
$$(".grid").forEach(function (g) { [].forEach.call(g.children, function (c, i) { c.style.transitionDelay = (i * 0.08) + "s"; }); });

/* Boucle principale : caméra du globe, texte, frise, curseur */
var ring = $("#ring"), bigi = $("#bigi"), big = $("#big"), prog = $("#prog"), van = $("#vanta");
var secs = $$("section[data-n]"), dots = $$("#dots i"), expIn = $("#exp .inner");
function loop(time) {
  if (lenis) lenis.raf(time);
  var y = scrollY, h = root.scrollHeight - vh, p = clamp(y / (vh * 0.9), 0, 1), cur = 0;
  prog.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
  van.style.opacity = 1 - 0.62 * p;
  van.style.transform = "translate(" + (18 * Math.cos(y / vh * 1.1)) + "vw," + (-p * 6) + "vh) scale(" + (1.05 + 0.2 * Math.sin(y / vh * 0.8)) + ")";
  bigi.style.transform = "translateX(" + ((big.getBoundingClientRect().top - vh) * 0.7) + "px)";
  secs.forEach(function (s) { s.style.setProperty("--py", (s.getBoundingClientRect().top * -0.12) + "px"); });
  ids.forEach(function (id, i) { if (document.getElementById(id).getBoundingClientRect().top < vh * 0.5) cur = i; });
  dots.forEach(function (d, i) { d.classList.toggle("on", i === cur); });
  var e = expIn.getBoundingClientRect();
  expIn.style.setProperty("--p", clamp((vh * 0.65 - e.top - 200) / (e.height - 200), 0, 1));
  txts.forEach(function (q) {
    var pr = clamp((vh * 0.88 - q.getBoundingClientRect().top) / (vh * 0.45), 0, 1);
    var w = q.querySelectorAll(".w"), n = Math.round(pr * w.length);
    w.forEach(function (s, i) { s.classList.toggle("on", i < n); });
  });
  rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
  ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
addEventListener("resize", function () { vh = innerHeight; });

/* Curseur, boutons magnétiques, cartes lumineuses et inclinées */
document.addEventListener("mousemove", function (e) {
  mx = e.clientX; my = e.clientY; ring.style.opacity = 1;
  ring.classList.toggle("h", !!e.target.closest("a,button,summary,.card,#dots i"));
});
$$(".btn,.pill").forEach(function (b) {
  b.addEventListener("mousemove", function (e) {
    var r = b.getBoundingClientRect();
    b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.25) + "px," + ((e.clientY - r.top - r.height / 2) * 0.35) + "px)";
  });
  b.addEventListener("mouseleave", function () { b.style.transform = ""; });
});
$$(".card").forEach(function (c) {
  c.addEventListener("mousemove", function (e) {
    var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    c.style.setProperty("--mx", x + "px"); c.style.setProperty("--my", y + "px");
    if (c.closest("#skills")) c.style.transform = "perspective(700px) rotateY(" + ((x / r.width - 0.5) * 10) + "deg) rotateX(" + ((0.5 - y / r.height) * 10) + "deg) translateY(-4px)";
  });
  c.addEventListener("mouseleave", function () { c.style.transform = ""; });
});

/* Intro : saut en hyperespace + nom déchiffré (clin d'oeil cybersécurité) */
function count(el, to, suf) {
  var t0 = performance.now();
  (function f(now) {
    var k = clamp((now - t0) / 1800, 0, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf;
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}
var cv = $("#wp"), cx = cv.getContext("2d"), W = 0, H = 0, stars = [], done = false;
function fit() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
fit(); addEventListener("resize", fit);
for (var i = 0; i < 420; i++) stars.push({ a: Math.random() * 6.283, d: Math.random() * 300 + 2, c: Math.random() < 0.5 ? "#00e5a0" : "#4dd9ff" });
var NAME = "JULIEN FONTAINE-DESJARDINS", GL = "01<>/{}[]#$%&@*+=?", nm = $("#nm"), bl = $("#bl"), fl = $("#fl");
var LN = ["> signal detected", "> decrypting identity ...", "> ACCESS GRANTED"];
function dec(k) {
  var s = "";
  for (var i = 0; i < NAME.length; i++) {
    var ch = NAME.charAt(i);
    s += (ch === " " || ch === "-" || i < k * NAME.length) ? ch : GL.charAt(Math.floor(Math.random() * GL.length));
  }
  nm.textContent = s;
}
function finish() {
  if (done) return; done = true;
  var it = $("#intro"); it.classList.add("open");
  setTimeout(function () { document.body.classList.add("go"); count($(".stats b"), 180, "+"); }, 250);
  setTimeout(function () { it.remove(); root.classList.remove("lock"); if (lenis) lenis.start(); }, 1100);
}
var T0 = performance.now();
function warp(now) {
  var s = (now - T0) / 1000, sp;
  sp = s < 2.4 ? 0.015 + 0.085 * Math.pow(1 - s / 2.4, 2) : (s < 2.8 ? 0.015 : 0.015 + (s - 2.8) * 0.6);
  cx.fillStyle = "rgba(3,6,8,.28)"; cx.fillRect(0, 0, W, H);
  var mxd = Math.hypot(W, H) / 2;
  stars.forEach(function (st) {
    var d0 = st.d; st.d += st.d * sp + 0.3;
    if (st.d > mxd) { st.d = Math.random() * 30 + 2; st.a = Math.random() * 6.283; d0 = st.d; }
    var c = Math.cos(st.a), sn = Math.sin(st.a);
    cx.strokeStyle = st.c; cx.lineWidth = 0.6 + st.d / mxd * 2.2;
    cx.beginPath(); cx.moveTo(W / 2 + c * d0, H / 2 + sn * d0); cx.lineTo(W / 2 + c * st.d, H / 2 + sn * st.d); cx.stroke();
  });
  dec(clamp((s - 0.5) / 1.9, 0, 1));
  bl.textContent = LN.slice(0, s > 2.4 ? 3 : s > 1 ? 2 : s > 0.2 ? 1 : 0).join("\n");
  fl.style.opacity = clamp((s - 2.8) / 0.45, 0, 1);
  if (s > 3.3) finish();
  if (!done) requestAnimationFrame(warp);
}
requestAnimationFrame(warp);
$("#intro").addEventListener("click", finish);
setTimeout(finish, 8000);

/* Formulaire (EmailJS) */
function loadEmailJS() {
  return new Promise(function (ok, ko) {
    if (window.emailjs) return ok();
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = ok; s.onerror = ko; document.head.appendChild(s);
  });
}
async function sendMail() {
  var v = function (id) { return $("#" + id).value.trim(); };
  var st = $("#st"), btn = $("#send");
  if (!v("n") || !v("e") || !v("m")) { st.textContent = t("Merci de remplir le nom, l'email et le message.", "Please fill in your name, email and message."); return; }
  btn.disabled = true; st.textContent = t("Envoi en cours...", "Sending...");
  try {
    await loadEmailJS();
    await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
      from_name: v("n"), from_email: v("e"),
      phone: v("t") ? v("i") + " " + v("t") : "Non renseigné",
      subject: v("s") || "Contact depuis le portfolio", message: v("m")
    }, { publicKey: "YOUR_PUBLIC_KEY" });
    st.textContent = t("Message envoyé, je vous répondrai vite !", "Message sent, I will reply soon!");
    ["n", "e", "t", "s", "m"].forEach(function (id) { $("#" + id).value = ""; });
  } catch (err) {
    st.textContent = t("Erreur d'envoi. Écrivez-moi : julien.fontainee@hotmail.com", "Sending failed. Write to me: julien.fontainee@hotmail.com");
  }
  btn.disabled = false;
}

try { if (localStorage.getItem("lang") === "en") setLang("en"); } catch (e) {}
initGlobe();
