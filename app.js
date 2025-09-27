// =====================
// CONFIG DEL EVENTO
// =====================
const EVENT_TITLE    = "Mis 15 – Martina Ailin Carbone";
const EVENT_DATE     = "2025-11-20";     // AAAA-MM-DD
const EVENT_TIME     = "20:00";          // HH:mm
const EVENT_LOCATION = "La Paloma Ranelagh";
const MAPS_QUERY     = "La Paloma Ranelagh";
const PHONE_NUMBER   = "5491138275112";  // REEMPLAZAR (sin + ni espacios)

// Galería: ubicá tus fotos reales en /img y listalas acá
const GALLERY = ["1.png","2.png","3.png","4.png","5.png","6.png"];

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
        el.setAttribute("data-value", str);                // RGB layers (CSS ::before/::after)
        el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip");

        const box = el.closest(".timebox");
        if (box){
          box.classList.remove("pulse"); void box.offsetWidth; box.classList.add("pulse");
          setTimeout(()=> box.classList.remove("pulse"), 400);
        }
        last[key] = str;
      } else if (!el.getAttribute("data-value")){
        el.setAttribute("data-value", str);               // asegurar primer render
      }
    }

    upd(dEl,d,"d"); upd(hEl,h,"h"); upd(mEl,m,"m"); upd(sEl,s,"s");

    // glitch aleatorio breve (solo desktop)
    if (matchMedia("(min-width: 981px)").matches && Math.random() < 0.06){
      [dEl,hEl,mEl,sEl].filter(Boolean).forEach(sp=>{
        sp.classList.add("glitch");
        setTimeout(()=> sp.classList.remove("glitch"), 140);
      });
    }
  }
  paintCountdown(); setInterval(paintCountdown, 1000);

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
    const text = `RSVP – ${EVENT_TITLE}\n${status}\nNombre: ${name}\nAcompañantes: ${guests}\nNotas: ${notes}`;

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
