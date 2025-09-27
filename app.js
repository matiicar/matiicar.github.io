// =====================
// CONFIG DEL EVENTO
// =====================
const EVENT_TITLE    = "Mis 15 – Martina Ailin Carbone";
const EVENT_DATE     = "2025-11-20";     // AAAA-MM-DD
const EVENT_TIME     = "21:30";          // HH:mm
const EVENT_LOCATION = "La Paloma Ranelagh";
const MAPS_QUERY     = "La Paloma Ranelagh";
const PHONE_NUMBER   = "5491138275112";  // REEMPLAZAR (sin + ni espacios)

// Galería: ubicá tus fotos reales en /img y listalas acá
const GALLERY = ["1.png","2.png"];

// =====================
// HELPERS
// =====================
const $ = (s, d=document)=> d.querySelector(s);
const $$ = (s, d=document)=> [...d.querySelectorAll(s)];
function formatDateLongISO(iso){
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("es-AR",{weekday:"long", day:"2-digit", month:"long", year:"numeric"}).format(d);
}
function toICSDate(date){ return date.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z"; }
function openWhatsApp(text){ window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, "_blank"); }
function showToast(msg){ const t=$("#toast"); if(!t) return; t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"), 2500); }

// =====================
// PARALLAX SUAVE DEL FONDO
// =====================
document.addEventListener("mousemove", (e)=>{
  const x = (e.clientX / innerWidth  - 0.5) * 2;
  const y = (e.clientY / innerHeight - 0.5) * 2;
  document.documentElement.style.setProperty("--mx", (x*1.5).toFixed(3));
  document.documentElement.style.setProperty("--my", (y*1.5).toFixed(3));
}, {passive:true});
document.addEventListener("scroll", ()=>{
  const y = scrollY / (document.body.scrollHeight || 1);
  document.documentElement.style.setProperty("--my", (y*1.2).toFixed(3));
}, {passive:true});

// Confeti //

// ==== CONFETTI OVERLAY (sin librerías) ======================================
let _confettiCanvas, _confettiCtx, _confettiRunning = false;
const CONFETTI_COLORS = ["#5a78ff", "#3e53ad", "#0c3794", "#b49bff", "#a5b4ff", "#80c2ff", "#ffffff"];

function _ensureConfettiCanvas(){
  if (_confettiCanvas) return;
  _confettiCanvas = document.createElement("canvas");
  _confettiCanvas.id = "confetti-canvas";
  Object.assign(_confettiCanvas.style, {
    position: "fixed", inset: "0", zIndex: "99998", pointerEvents: "none"
  });
  document.body.appendChild(_confettiCanvas);
  _confettiCtx = _confettiCanvas.getContext("2d");
  _resizeConfetti();
  addEventListener("resize", _resizeConfetti, {passive:true});
}
function _resizeConfetti(){
  if(!_confettiCanvas) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  _confettiCanvas.width  = innerWidth  * dpr;
  _confettiCanvas.height = innerHeight * dpr;
  _confettiCtx.setTransform(dpr,0,0,dpr,0,0);
}

function fireConfetti({count=160, spread=70, decay=0.89, scalar=1, y=0.25} = {}){
  _ensureConfettiCanvas();
  const P = [];
  for (let i=0;i<count;i++){
    const angle = (Math.random()*spread - spread/2) * (Math.PI/180);
    const speed = 8 + Math.random()*6;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 6; // un poco hacia arriba
    P.push({
      x: innerWidth/2 + (Math.random()*120-60),
      y: innerHeight * y,
      vx, vy,
      g: 0.22 + Math.random()*0.18,
      rot: Math.random()*Math.PI*2,
      vr: (Math.random()-.5)*0.3,
      size: 6 * (0.9 + Math.random()*0.6) * scalar,
      color: CONFETTI_COLORS[(Math.random()*CONFETTI_COLORS.length)|0],
      alpha: 1,
      decay: decay*(0.98+Math.random()*0.04),
      shape: (Math.random()<0.33) ? "tri" : (Math.random()<0.66 ? "rect" : "circle")
    });
  }
  if (_confettiRunning) { _confettiQueue.push(...P); return; }
  _confettiQueue = P;
  _confettiRunning = true;
  _confettiLoop();
}
let _confettiQueue = [];
function _confettiLoop(){
  if(!_confettiRunning) return;
  _confettiCtx.clearRect(0,0,innerWidth,innerHeight);
  for (const p of _confettiQueue){
    p.vy += p.g;
    p.x  += p.vx;
    p.y  += p.vy;
    p.rot+= p.vr;
    p.alpha *= p.decay;

    _confettiCtx.globalAlpha = Math.max(p.alpha,0);
    _confettiCtx.fillStyle = p.color;
    _confettiCtx.save();
    _confettiCtx.translate(p.x, p.y);
    _confettiCtx.rotate(p.rot);

    const s = p.size;
    if (p.shape === "rect"){
      _confettiCtx.fillRect(-s/2, -s/2, s, s*0.6);
    } else if (p.shape === "tri"){
      _confettiCtx.beginPath();
      _confettiCtx.moveTo(0, -s/1.2);
      _confettiCtx.lineTo(s/1.2, s/1.2);
      _confettiCtx.lineTo(-s/1.2, s/1.2);
      _confettiCtx.closePath();
      _confettiCtx.fill();
    } else {
      _confettiCtx.beginPath();
      _confettiCtx.arc(0,0,s*0.45,0,Math.PI*2);
      _confettiCtx.fill();
    }
    _confettiCtx.restore();
  }
  _confettiQueue = _confettiQueue.filter(p => p.alpha > 0.02 && p.y < innerHeight + 60);
  if (_confettiQueue.length === 0){ _confettiRunning = false; _confettiCtx.clearRect(0,0,innerWidth,innerHeight); return; }
  requestAnimationFrame(_confettiLoop);
}


// ==== FONDO DE PARTÍCULAS (ligero, sin CSS extra) ============================
let _pCanvas, _pCtx, _particles = [];
function startParticlesBG(){
  if (_pCanvas) return;
  _pCanvas = document.createElement("canvas");
  _pCanvas.id = "bg-particles";
  Object.assign(_pCanvas.style, {
    position: "fixed", inset: "0", zIndex: "-1", pointerEvents: "none" // entre tu .bg-gradient (-2) y el contenido
  });
  document.body.appendChild(_pCanvas);
  _pCtx = _pCanvas.getContext("2d");
  _resizeParticles();
  addEventListener("resize", _resizeParticles, {passive:true});

  const N = Math.round(Math.min(innerWidth*innerHeight/24000, 80)); // densidad suave
  for (let i=0;i<N;i++){
    _particles.push({
      x: Math.random()*innerWidth,
      y: Math.random()*innerHeight,
      r: 1.2 + Math.random()*1.8,
      a: 0.35 + Math.random()*0.35,
      hue: 220 + Math.random()*40,                 // violeta/azul
      spx: (Math.random()-.5)*0.2,                 // deriva
      spy: (Math.random()-.5)*0.2,
      tw: Math.random()*Math.PI*2,                 // twinkle
      tws: 0.005 + Math.random()*0.01
    });
  }
  _particlesLoop();
}
function _resizeParticles(){
  if(!_pCanvas) return;
  const dpr = Math.min(devicePixelRatio||1, 2);
  _pCanvas.width  = innerWidth  * dpr;
  _pCanvas.height = innerHeight * dpr;
  _pCtx.setTransform(dpr,0,0,dpr,0,0);
}
function _particlesLoop(){
  _pCtx.clearRect(0,0,innerWidth,innerHeight);
  for (const p of _particles){
    p.x += p.spx; p.y += p.spy;
    if (p.x < -10) p.x = innerWidth+10; if (p.x > innerWidth+10) p.x = -10;
    if (p.y < -10) p.y = innerHeight+10; if (p.y > innerHeight+10) p.y = -10;

    p.tw += p.tws;
    const alpha = p.a * (0.6 + Math.sin(p.tw)*0.4);
    _pCtx.fillStyle = `hsla(${p.hue}, 85%, 70%, ${alpha})`;
    _pCtx.beginPath();
    _pCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    _pCtx.fill();
  }
  requestAnimationFrame(_particlesLoop);
}

// ==== BOOSTER: más partículas y movimiento circular (sin tocar lo existente) ==
function boostParticles(){
  if(!_pCanvas) return; // requiere que startParticlesBG() ya se haya llamado

  // +densidad: añadimos ~90% extra según el área de la ventana
  const base = Math.round(Math.min(innerWidth*innerHeight/24000, 80));
  const extras = Math.round(base * 0.9);

  for (let i=0; i<extras; i++){
    // centro de órbita aleatorio
    const cx = Math.random()*innerWidth;
    const cy = Math.random()*innerHeight;
    const ang = Math.random()*Math.PI*2;
    const rad = 30 + Math.random()*90;

    _particles.push({
      // posición inicial sobre la órbita
      x: cx + Math.cos(ang)*rad,
      y: cy + Math.sin(ang)*rad,
      r: 1.6 + Math.random()*2.4,                 // un poco más grandes
      a: 0.45 + Math.random()*0.35,               // brillo base
      hue: 215 + Math.random()*50,                // azul/violeta
      spx: 0, spy: 0,                             // se setean por el “orbit updater”
      tw: Math.random()*Math.PI*2,
      tws: 0.008 + Math.random()*0.012,
      // datos de órbita
      _cx: cx, _cy: cy, _ang: ang,
      _rad: rad, _rs: (Math.random()>.5?1:-1) * (0.002 + Math.random()*0.004),
      _orbit: true
    });
  }

  // Actualiza velocidad para las partículas con órbita (no toca el loop existente)
  if (!boostParticles._orbitTimer){
    boostParticles._orbitTimer = setInterval(() => {
      for (const p of _particles){
        if (!p._orbit) continue;
        p._ang += p._rs;                  // avanza el ángulo
        // velocidad tangencial suave (se usa en tu _particlesLoop existente)
        p.spx = Math.cos(p._ang + Math.PI/2) * 0.35;
        p.spy = Math.sin(p._ang + Math.PI/2) * 0.35;
        // atrae levemente al centro para mantener la órbita
        const k = 0.02;
        p.spx += (p._cx - p.x) * k * 0.001;
        p.spy += (p._cy - p.y) * k * 0.001;
      }
    }, 16);
  }

  // Al redimensionar, completamos hasta la densidad objetivo sin quitar nada
  if (!boostParticles._resizeBound){
    boostParticles._resizeBound = true;
    addEventListener("resize", () => {
      const targetCount = Math.round(Math.min(innerWidth*innerHeight/12000, 160)); // ~x2 del base original
      while (_particles.length < targetCount){
        const x = Math.random()*innerWidth, y = Math.random()*innerHeight;
        _particles.push({
          x, y, r: 1.4 + Math.random()*2.0, a: 0.4 + Math.random()*0.3,
          hue: 215 + Math.random()*50, spx:(Math.random()-.5)*0.25, spy:(Math.random()-.5)*0.25,
          tw: Math.random()*Math.PI*2, tws: 0.006 + Math.random()*0.012
        });
      }
    }, {passive:true});
  }
}




// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {
  // Datos en UI
  $("#year") && ($("#year").textContent = new Date().getFullYear());
  $("#eventDateLong").textContent = formatDateLongISO(EVENT_DATE);
  $("#eventTime").textContent = EVENT_TIME;
  $("#eventTime2").textContent = EVENT_TIME;
  $("#eventLocation").textContent = EVENT_LOCATION;

  // --------- Countdown futurista
  const dEl = $("#d"), hEl = $("#h"), mEl = $("#m"), sEl = $("#s");
  const target = new Date(`${EVENT_DATE}T${EVENT_TIME}:00`);
  let last = {d:null,h:null,m:null,s:null};

  // --------- Countdown con triggers de confeti
function paintCountdown(){
  const now = new Date();
  let diff = target - now; if(diff < 0) diff = 0;
  const sec = Math.floor(diff/1000);
  const d = Math.floor(sec/86400);
  const h = Math.floor((sec%86400)/3600);
  const m = Math.floor((sec%3600)/60);
  const s = sec % 60;

  function upd(el, val, key){
    if(!el) return;
    const str = key==="d" ? String(val) : String(val).padStart(2,"0");
    if (last[key] !== str){
      el.textContent = str;
      el.setAttribute("data-value", str);
      el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip");
      const box = el.closest(".timebox");
      if (box){ box.classList.remove("pulse"); void box.offsetWidth; box.classList.add("pulse"); setTimeout(()=> box.classList.remove("pulse"), 400); }

      // mini confetti cuando cambia el MINUTO (no saturar)
      if (key === "m" && diff > 0){
        fireConfetti({count: 50, spread: 40, decay: 0.9, scalar: 0.8, y: .18});
      }
      last[key] = str;
    } else if (!el.getAttribute("data-value")){
      el.setAttribute("data-value", str);
    }
  }

  upd(dEl,d,"d"); upd(hEl,h,"h"); upd(mEl,m,"m"); upd(sEl,s,"s");

  // FIESTA al llegar a 0
  if (diff === 0 && !paintCountdown._done){
    paintCountdown._done = true;
    fireConfetti({count: 220, spread: 80, decay: 0.91, scalar: 1.1, y: .15});
    setTimeout(()=> fireConfetti({count: 160, spread: 100, decay: 0.92, scalar: 1.2, y: .15}), 250);
    const msg = document.querySelector(".countdown p");
    if (msg) msg.textContent = "¡Hoy es el gran día de Martina Ailin! 🎉";
  }
}

  paintCountdown(); setInterval(paintCountdown, 1000);
    // Fondo con partículas animadas
  startParticlesBG();
  boostParticles();



  // --------- Modal RSVP
  const modal = $("#modalRSVP");
  const openRSVP = () => {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("modal-open");
    $("#toast")?.classList.remove("show"); // oculta cualquier toast previo
    $("#fName")?.focus();
  };
  const closeRSVP = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("modal-open");
  };
  $("#btnRSVP")?.addEventListener("click", openRSVP);
  $("#btnRSVP2")?.addEventListener("click", openRSVP);
  $("#closeModal")?.addEventListener("click", closeRSVP);
  $("#cancelRSVP")?.addEventListener("click", closeRSVP);
  modal.addEventListener("click", (e)=>{ if(e.target === modal) closeRSVP(); });
  document.addEventListener("keydown", (e)=>{ if(e.key === "Escape" && modal.classList.contains("show")) closeRSVP(); });

  // Enviar RSVP por WhatsApp
  $("#sendRSVP").addEventListener("click", () => {
    const name = $("#fName").value.trim();
    const attendance = $("#fAttendance").value;
    const guests = $("#fGuests").value;
    const notes = $("#fNotes").value.trim();
    const status = attendance === "asistire" ? "✅ Asistiré" : "❌ No podré asistir";
    const text = `Invitacion Martu – ${EVENT_TITLE}\n${status}\nNombre: ${name}\nAcompañantes: ${guests}\nNotas: ${notes}`;

    openWhatsApp(text);
    closeRSVP();
    showToast("¡Gracias! Recibimos tu confirmación.");
  });

  // --------- Soporte WhatsApp
  const supportMsg = (extra="") => `Hola! Tengo una consulta sobre el evento del ${formatDateLongISO(EVENT_DATE)}. ${extra}`.trim();
  $("#fabWhats")?.addEventListener("click", () => openWhatsApp(supportMsg()));
  $("#btnSupport2")?.addEventListener("click", () => openWhatsApp(supportMsg("Lamentablemente no puedo asistir y quería avisar.")));

  // --------- Mapa
  $("#btnMaps")?.addEventListener("click", () => {
    const q = encodeURIComponent(MAPS_QUERY);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  });

  // --------- .ICS
  $("#btnICS")?.addEventListener("click", () => {
    const start = new Date(`${EVENT_DATE}T${EVENT_TIME}:00`);
    const end   = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const ics = [
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Invitacion 15//ES","CALSCALE:GREGORIAN","METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@quince.local`,
      `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${EVENT_TITLE}`,
      `LOCATION:${EVENT_LOCATION}`,
      "DESCRIPTION:Fiesta de 15. Más info en la web.",
      "END:VEVENT","END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], { type:"text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Martina-15.ics"; a.click();
    URL.revokeObjectURL(url);
    showToast("Evento agregado al calendario (.ics)");
  });

  // --------- GALERÍA
  const grid = $("#galleryGrid");
  if (grid){
    GALLERY.forEach((src, i) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "gitem";
      item.setAttribute("aria-label", `Abrir foto ${i+1}`);
      const img = new Image();
      img.src = src; img.loading = "lazy"; img.alt = `Foto ${i+1}`;
      item.appendChild(img);
      item.addEventListener("click", () => openLightbox(i));
      grid.appendChild(item);
    });
  }

  // Lightbox
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbPrev = $("#lbPrev"), lbNext = $("#lbNext"), lbClose = $("#lbClose"), lbCounter = $("#lbCounter");
  let current = 0;
  function updateLB(){ if(!lbImg) return; lbImg.src = GALLERY[current]; lbCounter.textContent = `${current+1} / ${GALLERY.length}`; }
  function openLightbox(i){ current = i; updateLB(); lb.classList.add("show"); lb.setAttribute("aria-hidden","false"); }
  function closeLightbox(){ lb.classList.remove("show"); lb.setAttribute("aria-hidden","true"); }
  lbNext?.addEventListener("click", ()=>{ current=(current+1)%GALLERY.length; updateLB(); });
  lbPrev?.addEventListener("click", ()=>{ current=(current-1+GALLERY.length)%GALLERY.length; updateLB(); });
  lbClose?.addEventListener("click", closeLightbox);
  lb?.addEventListener("click", (e)=>{ if(e.target===lb) closeLightbox(); });
  document.addEventListener("keydown", (e)=>{ if(!lb.classList.contains("show")) return; if(e.key==="Escape") closeLightbox(); if(e.key==="ArrowRight") {current=(current+1)%GALLERY.length; updateLB();} if(e.key==="ArrowLeft"){current=(current-1+GALLERY.length)%GALLERY.length; updateLB();} });
  // Swipe móvil
  let startX=0; lb?.addEventListener("touchstart",(e)=>{startX=e.changedTouches[0].clientX},{passive:true});
  lb?.addEventListener("touchend",(e)=>{const dx=e.changedTouches[0].clientX-startX; if(dx>40) {current=(current-1+GALLERY.length)%GALLERY.length; updateLB();} if(dx<-40){current=(current+1)%GALLERY.length; updateLB();}},{passive:true});
});
