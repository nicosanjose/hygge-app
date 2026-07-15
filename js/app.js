/* ============================================================
   APP · Portal Hygge (producto funcional sobre Supabase)
   ============================================================ */

const STATE = {
  role: null, route: "dashboard",
  prop: null, propTab: "resumen", propQ: "", propMes: null,
  incFilter: "abiertas", factFilter: "todas", planDia: null, fichDia: null, repMes: null,
  owner: null, ownerTab: "props", ownProp: null, liqMes: null, mejorasSel: new Set(),
  cli: null, cliQ: "",
};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rolDireccion = () => STATE.role === "direccion";

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
const NAV = {
  direccion: [
    ["Operativa", [["dashboard", "Inicio", "home"], ["plan", "Planificación", "cal"], ["equipo", "Equipo en vivo", "pin"], ["fichajes", "Fichajes", "clock"], ["incidencias", "Incidencias", "alert"], ["ropa", "Lavandería", "broom"]]],
    ["Negocio", [["propiedades", "Propiedades", "house"], ["trabajadores", "Trabajadores", "id"], ["propietarios", "Propietarios", "users"], ["clientes", "Clientes", "chat"]]],
    ["Administración", [["informes", "Informes", "doc"], ["facturacion", "Facturación", "invoice"], ["ajustes", "Ajustes", "settings"]]],
  ],
  equipo: [
    ["Mi trabajo", [["midia", "Mi día", "sun"], ["mihorario", "Mi horario", "cal"], ["mishoras", "Mis horas", "clock"], ["misincidencias", "Incidencias", "alert"], ["ropa", "Lavandería", "broom"]]],
  ],
  lavanderia: [
    ["Lavandería", [["ropa", "Estado de la ropa", "broom"]]],
  ],
  propietario: [
    ["Tu casa", [["ownerhome", "Mi propiedad", "house"], ["ownerresenas", "Reseñas", "star"], ["ownermejoras", "Mejoras", "chart"], ["ownerliq", "Liquidaciones", "euro"]]],
  ],
};
function renderNav() {
  const incAb = DB.incidencias.filter(i => i.estado === "abierta").length;
  $("#sb-nav").innerHTML = NAV[STATE.role].map(([label, items]) => `
    <div class="sb-label">${label}</div>
    ${items.map(([id, txt, ic]) => `
      <button class="sb-item ${STATE.route === id ? "active" : ""}" data-go="${id}">
        ${ICON[ic]} ${txt}
        ${id === "incidencias" && incAb && rolDireccion() ? `<span class="pill">${incAb}</span>` : ""}
      </button>`).join("")}`).join("");
  const nombre = DB.profile?.nombre || "Usuario";
  const rolTxt = rolDireccion() ? "Dirección" : STATE.role === "propietario" ? "Propietario" : STATE.role === "lavanderia" ? "Lavandería" : "Equipo";
  $("#sb-user").innerHTML = `
    <span class="ava" style="background:${rolDireccion() || STATE.role === "propietario" ? "var(--gold)" : (miEmp()?.color || "#4f8a5c")}">${ini(nombre)}</span>
    <div style="flex:1"><div class="n">${esc(nombre)}</div><div class="r">${rolTxt}</div></div>`;
  $("#user-btn").textContent = ini(nombre);
  $("#user-drop-nombre").textContent = nombre;
  $("#user-drop-rol").textContent = rolDireccion() ? "Dirección · acceso total" : STATE.role === "propietario" ? "Propietario · " + (misProps()[0]?.nombre || "") : STATE.role === "lavanderia" ? "Lavandería · estado de la ropa" : "Equipo · " + (miEmp()?.rol_laboral || "");
  $("#menu-ajustes").style.display = rolDireccion() ? "" : "none";
}
function go(route) {
  STATE.route = route;
  document.body.classList.remove("nav-open");
  closeDrawer();
  rerender();
  window.scrollTo({ top: 0 });
}
const rutaInicio = () => rolDireccion() ? "dashboard" : STATE.role === "propietario" ? "ownerhome" : STATE.role === "lavanderia" ? "ropa" : "midia";
function rerender(keepFocus) {
  if (!STATE.role) return;
  const v = VIEWS[STATE.route] || VIEWS[rutaInicio()];
  let selStart = 0, hadFocus = false;
  if (keepFocus && document.activeElement?.tagName === "INPUT" && document.activeElement.closest("#content")) {
    hadFocus = true; selStart = document.activeElement.selectionStart;
  }
  $("#tb-title").textContent = v.t;
  $("#tb-crumb").textContent = v.c;
  $("#content").innerHTML = `<div class="section">${v.r()}</div>`;
  v.m && v.m();
  renderNav();
  if (hadFocus) { const inp = $("#content input.input"); if (inp) { inp.focus(); try { inp.setSelectionRange(selStart, selStart); } catch {} } }
}
document.addEventListener("click", e => {
  const go1 = e.target.closest("[data-go]"); if (go1) { go(go1.dataset.go); return; }
  const pr = e.target.closest("[data-prop]"); if (pr) { STATE.prop = +pr.dataset.prop; STATE.propTab = "resumen"; STATE.propMes = null; go("propdetail"); return; }
  const prg = e.target.closest("[data-prop-go]"); if (prg) { STATE.prop = +prg.dataset.propGo; STATE.propTab = "resumen"; go("propdetail"); return; }
  const tr = e.target.closest("[data-trab]"); if (tr) { STATE.trab = +tr.dataset.trab; STATE.trabTab = "resumen"; STATE.trabMes = null; go("trabajadordetail"); return; }
  const ow = e.target.closest("[data-owner]"); if (ow) { STATE.owner = +ow.dataset.owner; STATE.ownerTab = "props"; go("propietariodetail"); return; }
  const cl = e.target.closest("[data-cli]"); if (cl) { STATE.cli = +cl.dataset.cli; go("clientedetail"); return; }
  const em = e.target.closest("[data-emp]"); if (em) { const emp = S(+em.dataset.emp); if (emp) openDrawer(drawerEmpleado(emp)); return; }
  const inc = e.target.closest("[data-inc]"); if (inc) { abrirIncidencia(+inc.dataset.inc); return; }
});

/* ============================================================
   ARRANQUE + AUTH
   ============================================================ */
function authTab(t) {
  $("#tab-login").classList.toggle("on", t === "login");
  $("#tab-signup").classList.toggle("on", t === "signup");
  $("#form-login").style.display = t === "login" ? "" : "none";
  $("#form-signup").style.display = t === "signup" ? "" : "none";
  authErr("");
}
function authErr(msg, info) {
  const el = $("#auth-err");
  el.style.display = msg ? "" : "none";
  el.textContent = msg || "";
  el.style.background = info ? "rgba(79,138,92,.16)" : "";
  el.style.borderColor = info ? "rgba(79,138,92,.45)" : "";
  el.style.color = info ? "#b8d8bf" : "";
}
async function doLogin(ev) {
  ev.preventDefault();
  const btn = $("#btn-login"); btn.disabled = true; btn.textContent = "Entrando…";
  const err = await dbLogin($("#lg-email").value.trim(), $("#lg-pass").value);
  btn.disabled = false; btn.textContent = "Entrar";
  if (err) return authErr(err);
  await bootSesion();
}
async function doSignup(ev) {
  ev.preventDefault();
  const btn = $("#btn-signup"); btn.disabled = true; btn.textContent = "Creando cuenta…";
  const r = await dbSignup($("#su-nombre").value.trim(), $("#su-email").value.trim(), $("#su-pass").value);
  btn.disabled = false; btn.textContent = "Crear cuenta";
  if (r.error) return authErr(r.error);
  if (r.needsConfirm) return authErr("Cuenta creada. Revisa tu correo para confirmarla y después entra con tu email y contraseña.", true);
  sessionStorage.setItem("hygge_codigo", $("#su-codigo").value.trim());
  await bootSesion();
}
async function bootSesion() {
  const perfil = await dbCargarPerfil();
  if (!perfil) return;
  if (!perfil.rol) {
    const codigo = sessionStorage.getItem("hygge_codigo") || $("#su-codigo")?.value.trim() || null;
    const r = await dbReclamar(codigo);
    sessionStorage.removeItem("hygge_codigo");
    if (r.error) {
      $("#login").classList.add("hidden");
      $("#pendiente").style.display = "flex";
      $("#pendiente-txt").textContent = r.error;
      return;
    }
    perfil.rol = r.rol;
    await dbCargarPerfil();
  }
  await entrar();
}
async function entrar() {
  STATE.role = DB.profile.rol;
  STATE.route = rutaInicio();
  if (loginAnim) cancelAnimationFrame(loginAnim);
  $("#login").classList.add("hidden");
  $("#pendiente").style.display = "none";
  document.body.insertAdjacentHTML("beforeend", `<div class="cargando-app" id="cargando"><div class="lds"></div>Cargando tus datos…</div>`);
  await dbCargarTodo();
  $("#cargando")?.remove();
  $("#app").classList.add("visible");
  dbRealtime();
  startClock();
  rerender();
  if (!rolDireccion()) dbPingPosicion();
}

/* ============================================================
   RELOJ REAL
   ============================================================ */
function startClock() {
  const tick = () => {
    const el = $("#tb-clock"); if (!el) return;
    const d = new Date();
    el.innerHTML = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" }) +
      " · <b>" + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + "</b>";
  };
  tick(); clearInterval(STATE._clockInt); STATE._clockInt = setInterval(tick, 20000);
}
function startEmpTimer() {
  const upd = () => {
    const el = $("#emp-timer"); if (!el) return;
    const me = miEmp(); const f = me && fichajeAbierto(me.id);
    if (!f) { el.textContent = "—"; return; }
    const ms = horasDeFichaje(f);
    el.textContent = Math.floor(ms / 36e5) + " h " + String(Math.floor(ms % 36e5 / 6e4)).padStart(2, "0") + " min";
  };
  upd(); clearInterval(STATE._empInt); STATE._empInt = setInterval(upd, 30000);
}

/* ============================================================
   LOGIN CANVAS · "la isla encendida"
   ============================================================ */
const MALLORCA = [
  [7,60],[10,52],[15,45],[22,38],[30,30],[37,24],[44,17],[50,11],[55,7],[58.5,10],[53,17],[50,21],
  [53,23],[57,22],[60,26],[57,32],[53,37],[56,41],[62,42],[69,41],[76,38],[83,36],[90,38],[93,42],
  [91,48],[86,55],[80,62],[72,70],[63,78],[55,85],[47,84],[41,78],[35,72],[29,66],[24,68],[18,66],[12,65],[7,60],
];
const PROPS_LIGHT = [[86,40],[82,37],[88,45],[84,49],[80,44],[78,40],[76,47],[83,42],[71,44],[74,52],[68,48],[87,52]];
function inPoly(x, y, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
let loginAnim = null;
function startLogin() {
  const cv = $("#login-canvas"), ctx = cv.getContext("2d");
  let W, H, dots = [], bokeh = [], luces = [], mouse = { x: -999, y: -999 };
  const build = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = Math.min(W * (W > 760 ? .52 : .94) / 100, H * .84 / 100);
    const ox = W > 760 ? W * .44 : W * .03 + (W - s * 100) / 2, oy = (H - s * 78) / 2 - s * 6;
    dots = [];
    const step = Math.max(7, s * 1.55);
    for (let gx = 0; gx <= 100; gx += step / s) for (let gy = 0; gy <= 90; gy += step / s) {
      if (inPoly(gx, gy, MALLORCA)) dots.push({ x: ox + gx * s, y: oy + gy * s, r: Math.max(1.1, s * .42), tw: Math.random() * 6.28 });
    }
    luces = PROPS_LIGHT.map(([x, y]) => ({ x: ox + x * s, y: oy + y * s, ph: Math.random() * 6.28 }));
    bokeh = Array.from({ length: 22 }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: 2 + Math.random() * 5,
      vx: (Math.random() - .5) * .12, vy: -.06 - Math.random() * .12, a: .04 + Math.random() * .1,
    }));
  };
  build();
  window.addEventListener("resize", build);
  cv.parentElement.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.parentElement.addEventListener("pointerleave", () => { mouse.x = -999; mouse.y = -999; });
  let t = 0;
  const frame = () => {
    t += .016;
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(W * .7, H * .45, 60, W * .5, H * .5, Math.max(W, H) * .75);
    bg.addColorStop(0, "#262b22"); bg.addColorStop(1, "#1c201a");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    bokeh.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      if (b.y < -10) { b.y = H + 10; b.x = Math.random() * W; }
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 3);
      g.addColorStop(0, `rgba(219,177,101,${b.a})`); g.addColorStop(1, "rgba(219,177,101,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 3, 0, 6.28); ctx.fill();
    });
    dots.forEach(d => {
      const dist = Math.hypot(d.x - mouse.x, d.y - mouse.y);
      const warm = Math.max(0, 1 - dist / 190);
      const tw = .5 + .5 * Math.sin(t * 1.2 + d.tw);
      const a = .16 + tw * .1 + warm * .55;
      ctx.fillStyle = warm > .04
        ? `rgba(${140 + warm * 100},${125 + warm * 45},${88 + warm * 8},${a})`
        : `rgba(126,136,118,${a})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r + warm * 1.2, 0, 6.28); ctx.fill();
    });
    luces.forEach(l => {
      const p = .62 + .38 * Math.sin(t * 1.6 + l.ph);
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 14 + p * 8);
      g.addColorStop(0, `rgba(233,190,102,${.85 * p})`); g.addColorStop(.35, `rgba(214,155,61,${.35 * p})`); g.addColorStop(1, "rgba(214,155,61,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(l.x, l.y, 14 + p * 8, 0, 6.28); ctx.fill();
      ctx.fillStyle = `rgba(255,232,178,${.75 + .25 * p})`; ctx.beginPath(); ctx.arc(l.x, l.y, 2.1, 0, 6.28); ctx.fill();
    });
    loginAnim = requestAnimationFrame(frame);
  };
  frame();
}

/* ============================================================
   UI GENÉRICA: drops, drawer, modal, toasts, glow
   ============================================================ */
function toggleDrop(id) {
  const el = $(id); const was = el.classList.contains("open");
  $$(".tb-drop").forEach(d => d.classList.remove("open"));
  if (!was) el.classList.add("open");
}
document.addEventListener("click", e => { if (!e.target.closest(".tb-menu")) $$(".tb-drop").forEach(d => d.classList.remove("open")); });
function openDrawer(html) { $("#drawer").innerHTML = html; $("#drawer").classList.add("open"); $("#drawer-veil").classList.add("open"); }
function closeDrawer() { $("#drawer").classList.remove("open"); $("#drawer-veil").classList.remove("open"); }
function openModal(html, wide) {
  $("#modal-root").innerHTML = `<div class="veil" onclick="closeModal()"></div><div class="modal ${wide ? "wide" : ""}">${html}</div>`;
  $("#modal-root").classList.add("open");
}
function closeModal() { $("#modal-root").classList.remove("open"); $("#modal-root").innerHTML = ""; document.body.classList.remove("printing"); }
function toast(b, t, icon = ICON.check, cls = "") {
  const el = document.createElement("div");
  el.className = "toast " + cls;
  el.innerHTML = `${icon}<div><b>${b}</b>${t ? `<span>${t}</span>` : ""}</div>`;
  $("#toasts").appendChild(el);
  setTimeout(() => { el.classList.add("bye"); setTimeout(() => el.remove(), 350); }, 4600);
}
function copiar(txt) { navigator.clipboard?.writeText(txt); toast("Copiado", txt, ICON.copy, "ok"); }
(function () {
  const glow = document.getElementById("cursor-glow");
  let gx = -600, gy = -600, tx = gx, ty = gy;
  document.addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; document.body.classList.add("glow-on"); });
  (function loop() { gx += (tx - gx) * .09; gy += (ty - gy) * .09; glow.style.left = gx + "px"; glow.style.top = gy + "px"; requestAnimationFrame(loop); })();
})();

/* búsqueda */
function searchInput(v) {
  const box = $("#tb-results"); const q = v.trim().toLowerCase();
  if (!q) { box.classList.remove("open"); return; }
  const props = DB.props.filter(p => (p.nombre + " " + (p.zona || "")).toLowerCase().includes(q)).slice(0, 4)
    .map(p => `<button class="tb-hit" data-prop="${p.id}">${ICON.house} ${esc(p.nombre)} <span class="k">${esc(p.zona || "")}</span></button>`);
  const emps = rolDireccion() ? DB.emp.filter(s => (s.nombre + " " + s.rol_laboral).toLowerCase().includes(q)).slice(0, 4)
    .map(s => `<button class="tb-hit" data-emp="${s.id}">${ICON.users} ${esc(s.nombre)} <span class="k">${esc(s.rol_laboral)}</span></button>`) : [];
  const clis = rolDireccion() ? DB.clientes.filter(c => (c.nombre + " " + (c.email || "") + " " + (c.telefono || "")).toLowerCase().includes(q)).slice(0, 3)
    .map(c => `<button class="tb-hit" data-cli="${c.id}">${ICON.chat} ${esc(c.nombre)} <span class="k">cliente</span></button>`) : [];
  box.innerHTML = [...props, ...emps, ...clis].join("") || `<div class="tb-hit">Sin resultados</div>`;
  box.classList.add("open");
}
document.addEventListener("click", e => { if (!e.target.closest(".tb-search")) $("#tb-results")?.classList.remove("open"); });

/* fotos con URL firmada */
async function resolverFotos() {
  for (const img of $$("img[data-foto]")) {
    const url = await fotoUrl(img.dataset.foto);
    if (url) { img.src = url; img.removeAttribute("data-foto"); }
  }
}

/* ============================================================
   PAPELES + PRINT + CSV
   ============================================================ */
function paperModal(paperHTML, titulo) {
  openModal(`
    <div class="modal-head"><h3>${titulo}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body" style="background:#eceada;border-radius:0 0 20px 20px">
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:14px">
        <button class="btn sm outline" style="background:#fff" onclick="printPaper()">${ICON.print} Descargar PDF</button>
      </div>
      ${paperHTML}
    </div>`, true);
}
function printPaper() { document.body.classList.add("printing"); setTimeout(() => { window.print(); document.body.classList.remove("printing"); }, 60); }
const openPaperHoras = mes => paperModal(paperHoras(mes), "Horas por empleado · " + fmtMes(mes));
const openPaperOcupacion = mes => paperModal(paperOcupacion(mes), "Ocupación · " + fmtMes(mes));
const openPaperLiquidaciones = mes => paperModal(paperLiquidaciones(mes), "Liquidaciones · " + fmtMes(mes));
const openPaperFichajes = fecha => paperModal(paperFichajesDia(fecha), "Registro de jornada · " + fmtCorto(fecha));
const openFacturaPaper = id => { const f = DB.facturas.find(x => x.id === id); if (f) paperModal(paperFactura(f), f.numero ? "Factura " + f.numero : "Borrador"); };
const openPaperLiqOwner = (oid, mes) => { const o = O(oid); if (o) paperModal(paperLiqOwner(o, mes), "Liquidación · " + esc(o.nombre)); };
const openPaperHorario = id => { const e = S(id); if (e) paperModal(paperHorario(id), "Horario · " + esc(e.nombre.split(" ")[0])); };
const openPaperCuadrante = fecha => paperModal(paperCuadrante(fecha), "Cuadrante del equipo · 3 semanas");
/* horario → Excel (CSV que abre directo en Excel): individual (empId) o global (null) */
function exportHorarioCSV(empId, desde) {
  const ini = desde || hoyISO();
  const dias = Array.from({ length: 21 }, (_, i) => addDias(ini, i));
  const rows = [["Fecha", "Día", "Trabajador", "Propiedad", "Zona", "Servicio", "Inicio", "Fin", "Horas previstas", "Nota"]];
  dias.forEach(d => {
    const diaTxt = new Date(d + "T12:00").toLocaleDateString("es-ES", { weekday: "long" });
    DB.tareas.filter(t => t.fecha === d && (!empId || (t.equipo_ids || []).includes(empId)))
      .sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""))
      .forEach(t => {
        const p = P(t.propiedad_id) || {};
        const quien = empId ? [empId] : ((t.equipo_ids || []).length ? t.equipo_ids : [null]);
        quien.forEach(eid => rows.push([d, diaTxt, eid ? (S(eid)?.nombre || "") : "SIN ASIGNAR",
          p.nombre || "", p.zona || "", t.tipo, (t.hora_inicio || "").slice(0, 5), (t.hora_fin || "").slice(0, 5),
          String(Math.round(horasTarea(t) * 10) / 10).replace(".", ","), t.descripcion || ""]));
      });
  });
  if (rows.length === 1) return toast("Nada que exportar", "No hay servicios planificados en esas 3 semanas.", ICON.alert, "terra");
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = `horario-${empId ? (S(empId)?.nombre.split(" ")[0] || "trabajador").toLowerCase() : "equipo"}-${ini}.csv`;
  a.click();
  toast("Horario exportado", a.download + " · ábrelo con Excel", ICON.down, "ok");
}
function exportFichajesCSV(fecha) {
  const rows = [["Empleado", "Puesto", "Fecha", "Entrada", "Salida", "Pausas", "Horas", "Lat", "Lng"]];
  DB.fichajes.filter(f => f.fecha === fecha).forEach(f => {
    const e = S(f.empleado_id) || {};
    const ps = DB.pausas.filter(p => p.fichaje_id === f.id).map(p => fmtHora(p.inicio) + "-" + (p.fin ? fmtHora(p.fin) : "")).join(" ");
    rows.push([e.nombre || "?", e.rol_laboral || "", f.fecha, fmtHora(f.entrada), f.salida ? fmtHora(f.salida) : "", ps, msAHoras(horasDeFichaje(f)), f.lat || "", f.lng || ""]);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(";")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = `fichajes-${fecha}.csv`; a.click();
  toast("CSV exportado", `fichajes-${fecha}.csv`, ICON.down, "ok");
}

/* ============================================================
   FORMULARIOS · PROPIEDADES / RESERVAS / PROPIETARIOS / EQUIPO
   ============================================================ */
function fval(id) { return $("#" + id)?.value.trim() ?? ""; }
function fnum(id) { const v = fval(id); return v === "" ? null : +v; }

function openPropForm(id) {
  const p = id ? P(id) : {};
  const zonas = ["Artà", "Capdepera", "Cala Ratjada", "Canyamel", "Cala Mesquida", "Colònia de Sant Pere", "Betlem", "Son Servera", "Cala Millor", "Font de sa Cala"];
  openModal(`
    <div class="modal-head"><h3>${id ? "Editar propiedad" : "Nueva propiedad"}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field full"><label>Nombre *</label><input id="pf-nombre" value="${esc(p.nombre || "")}" placeholder="Villa Es Molí"></div>
      <div class="f-field"><label>Zona</label><input id="pf-zona" list="zonas-dl" value="${esc(p.zona || "")}"><datalist id="zonas-dl">${zonas.map(z => `<option>${z}</option>`).join("")}</datalist></div>
      <div class="f-field"><label>Tipo</label><input id="pf-tipo" value="${esc(p.tipo || "")}" placeholder="Villa con piscina"></div>
      <div class="f-field full"><label>Dirección</label><input id="pf-direccion" value="${esc(p.direccion || "")}"></div>
      <div class="f-field"><label>Propietario</label>
        <select id="pf-owner"><option value="">— Sin asignar —</option>
        ${DB.owners.map(o => `<option value="${o.id}" ${p.propietario_id === o.id ? "selected" : ""}>${esc(o.nombre)}</option>`).join("")}</select></div>
      <div class="f-field"><label>Licencia turística</label><input id="pf-licencia" value="${esc(p.licencia || "")}" placeholder="ETV/1234"></div>
      <div class="f-field"><label>Habitaciones</label><input id="pf-habs" type="number" min="0" value="${p.habs ?? ""}"></div>
      <div class="f-field"><label>Baños</label><input id="pf-banos" type="number" min="0" value="${p.banos ?? ""}"></div>
      <div class="f-field"><label>Plazas</label><input id="pf-plazas" type="number" min="0" value="${p.plazas ?? ""}"></div>
      <div class="f-field"><label>Llaves (consigna)</label><input id="pf-llave" value="${esc(p.llave || "")}" placeholder="L-01"></div>
      <div class="f-field"><label>Tarifa gestión €/mes</label><input id="pf-tgestion" type="number" step="0.01" min="0" value="${p.tarifa_gestion ?? ""}"></div>
      <div class="f-field"><label>Tarifa por limpieza €</label><input id="pf-tlimpieza" type="number" step="0.01" min="0" value="${p.tarifa_limpieza ?? ""}"></div>
      <div class="f-field full"><label>Servicios contratados</label>
        <div class="tag-multi" id="pf-servicios">${[...new Set([...(DB.ajustes.servicios_catalogo || ["Alquiler vacacional", "Consigna de llaves", "Limpieza", "Mantenimiento de piscina", "Mantenimiento de jardín"]), ...(p.servicios || [])])].map(s => `<span class="tg ${(p.servicios || []).includes(s) ? "on" : ""}" onclick="this.classList.toggle('on')">${esc(s)}</span>`).join("")}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <input class="input" id="pf-servicio-otro" placeholder="Otro servicio…" style="flex:1" onkeydown="if(event.key==='Enter'){event.preventDefault();addServicioTag()}">
          <button class="btn sm outline" type="button" onclick="addServicioTag()">${ICON.plus}</button>
        </div></div>
      <div class="f-field full"><label>Canales</label>
        <div class="tag-multi" id="pf-canales">${["Airbnb", "Booking", "Vrbo", "Directa"].map(c => `<span class="tg ${(p.canales || []).includes(c) ? "on" : ""}" onclick="this.classList.toggle('on')">${c}</span>`).join("")}</div></div>
      <div class="f-field"><label>Piscina</label><select id="pf-piscina"><option value="no" ${!p.piscina ? "selected" : ""}>No</option><option value="si" ${p.piscina ? "selected" : ""}>Sí</option></select></div>
      <div class="f-field"><label>Activa</label><select id="pf-activa"><option value="si" ${p.activa !== false ? "selected" : ""}>Sí</option><option value="no" ${p.activa === false ? "selected" : ""}>No</option></select></div>
      <div class="f-field full"><label>Coordenadas GPS (opcional)</label>
        <input id="pf-coords" value="${p.lat ? p.lat + ", " + p.lng : ""}" placeholder="39.6936, 3.3494 — en Google Maps: clic derecho sobre la casa → copiar coordenadas">
      </div>
      <div class="f-field full"><label>Foto de portada</label>
        <div class="field-file"><label class="file-btn">${ICON.camera} Elegir imagen<input type="file" id="pf-foto" accept="image/*"></label>
        <span class="hint">${p.foto_path ? "Ya tiene foto: se sustituirá si eliges otra." : "Opcional."}</span></div></div>
      <div class="f-field full"><label>Notas</label><textarea id="pf-notas">${esc(p.notas || "")}</textarea></div>
    </div></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" id="pf-save" onclick="guardarProp(${id || "null"})">${ICON.check} Guardar</button>
    </div>`, true);
}
function addServicioTag() {
  const v = fval("pf-servicio-otro"); if (!v) return;
  $("#pf-servicios").insertAdjacentHTML("beforeend", `<span class="tg on" onclick="this.classList.toggle('on')">${esc(v)}</span>`);
  $("#pf-servicio-otro").value = "";
}
async function guardarProp(id) {
  const nombre = fval("pf-nombre");
  if (!nombre) return toast("Falta el nombre", "Ponle nombre a la propiedad.", ICON.alert, "terra");
  const btn = $("#pf-save"); btn.disabled = true; btn.textContent = "Guardando…";
  const payload = {
    nombre, zona: fval("pf-zona") || null, tipo: fval("pf-tipo") || null, direccion: fval("pf-direccion") || null,
    propietario_id: fval("pf-owner") ? +fval("pf-owner") : null, licencia: fval("pf-licencia") || null,
    habs: fnum("pf-habs") || 0, banos: fnum("pf-banos") || 0, plazas: fnum("pf-plazas") || 0,
    llave: fval("pf-llave") || null, tarifa_gestion: fnum("pf-tgestion") || 0, tarifa_limpieza: fnum("pf-tlimpieza") || 0,
    canales: $$("#pf-canales .tg.on").map(t => t.textContent), piscina: fval("pf-piscina") === "si",
    activa: fval("pf-activa") === "si", notas: fval("pf-notas") || null,
  };
  const coords = fval("pf-coords").match(/(-?\d+[.,]?\d*)\s*[,;]\s*(-?\d+[.,]?\d*)/);
  payload.lat = coords ? +coords[1].replace(",", ".") : null;
  payload.lng = coords ? +coords[2].replace(",", ".") : null;
  payload.servicios = $$("#pf-servicios .tg.on").map(t => t.textContent.trim());
  const err = await dbGuardarProp(payload, id, $("#pf-foto")?.files[0]);
  if (err) { btn.disabled = false; btn.textContent = "Guardar"; return toast("No se pudo guardar", err, ICON.alert, "terra"); }
  closeModal(); toast(id ? "Propiedad actualizada" : "Propiedad creada", nombre, ICON.check, "ok"); rerender();
}
function openReservaForm(propId, fecha) {
  const p = P(propId); if (!p) return;
  openModal(`
    <div class="modal-head"><h3>Nueva reserva · ${esc(p.nombre)}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field"><label>Entrada *</label><input id="rf-entrada" type="date" value="${fecha || hoyISO()}"></div>
      <div class="f-field"><label>Salida *</label><input id="rf-salida" type="date" value="${addDias(fecha || hoyISO(), 7)}"></div>
      <div class="f-field"><label>Hora entrada</label><input id="rf-hin" type="time" value="16:00"></div>
      <div class="f-field"><label>Hora salida</label><input id="rf-hout" type="time" value="10:00"></div>
      <div class="f-field"><label>Canal</label><select id="rf-canal">${["Airbnb", "Booking", "Vrbo", "Directa"].map(c => `<option>${c}</option>`).join("")}</select></div>
      <div class="f-field"><label>Plazas</label><input id="rf-plazas" type="number" min="1" value="${p.plazas || ""}"></div>
      <div class="f-field"><label>Huésped</label><input id="rf-huesped" placeholder="Opcional"></div>
      <div class="f-field"><label>Importe € (para liquidaciones)</label><input id="rf-importe" type="number" step="0.01" min="0" placeholder="Opcional"></div>
      <div class="f-field"><label>Tipo</label><select id="rf-estado"><option value="confirmada">Reserva confirmada</option><option value="bloqueo">Bloqueo (propietario / obras)</option></select></div>
      <div class="f-field"><label>Cliente (agenda)</label><select id="rf-cliente"><option value="">— sin vincular —</option>${DB.clientes.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join("")}</select></div>
    </div></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarReserva(${propId})">${ICON.check} Guardar reserva</button>
    </div>`);
}
async function guardarReserva(propId) {
  const entrada = fval("rf-entrada"), salida = fval("rf-salida");
  if (!entrada || !salida || salida <= entrada) return toast("Fechas no válidas", "La salida debe ser posterior a la entrada.", ICON.alert, "terra");
  const err = await dbCrearReserva({
    propiedad_id: propId, entrada, salida, hora_entrada: fval("rf-hin") || null, hora_salida: fval("rf-hout") || null,
    canal: fval("rf-canal"), plazas: fnum("rf-plazas"), huesped: fval("rf-huesped") || null,
    importe: fnum("rf-importe"), estado: fval("rf-estado"), cliente_id: fnum("rf-cliente"),
  });
  if (err) return toast("No se pudo crear", err, ICON.alert, "terra");
  closeModal(); toast("Reserva guardada", fmtCorto(entrada) + " → " + fmtCorto(salida), ICON.check, "ok");
  STATE.propTab = "calendario"; rerender();
}
async function delReserva(id) {
  if (!confirm("¿Eliminar esta reserva?")) return;
  const err = await dbBorrarReserva(id);
  if (err) return toast("No se pudo eliminar", err, ICON.alert, "terra");
  toast("Reserva eliminada", "", ICON.trash); rerender();
}
function openOwnerForm(id) {
  const o = id ? O(id) : {};
  openModal(`
    <div class="modal-head"><h3>${id ? "Editar propietario" : "Nuevo propietario"}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field full"><label>Nombre *</label><input id="of-nombre" value="${esc(o.nombre || "")}"></div>
      <div class="f-field"><label>País</label><input id="of-pais" value="${esc(o.pais || "")}"></div>
      <div class="f-field"><label>Idioma</label><select id="of-idioma">${["es", "en", "de", "da", "sv"].map(l => `<option ${o.idioma === l ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      <div class="f-field"><label>Email</label><input id="of-email" type="email" value="${esc(o.email || "")}"></div>
      <div class="f-field"><label>Teléfono</label><input id="of-tel" value="${esc(o.telefono || "")}"></div>
    </div></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarOwner(${id || "null"})">${ICON.check} Guardar</button>
    </div>`);
}
async function guardarOwner(id) {
  const nombre = fval("of-nombre");
  if (!nombre) return toast("Falta el nombre", "", ICON.alert, "terra");
  const err = await dbGuardarOwner({ nombre, pais: fval("of-pais") || null, idioma: fval("of-idioma"), email: fval("of-email") || null, telefono: fval("of-tel") || null }, id);
  if (err) return toast("No se pudo guardar", err, ICON.alert, "terra");
  closeModal(); toast(id ? "Propietario actualizado" : "Propietario creado", nombre, ICON.check, "ok"); rerender();
}
/* ---------- CRM de clientes ---------- */
function openClienteForm(id) {
  const c = id ? CL(id) : {};
  openModal(`
    <div class="modal-head"><h3>${id ? "Editar cliente" : "Nuevo cliente"}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field full"><label>Nombre *</label><input id="cf-nombre" value="${esc(c.nombre || "")}" placeholder="Fam. Sørensen"></div>
      <div class="f-field"><label>Teléfono (con prefijo, para WhatsApp)</label><input id="cf-tel" value="${esc(c.telefono || "")}" placeholder="+45 20 12 34 56"></div>
      <div class="f-field"><label>Email</label><input id="cf-email" type="email" value="${esc(c.email || "")}"></div>
      <div class="f-field"><label>Cómo llegó</label><select id="cf-origen">${["Airbnb", "Booking", "Vrbo", "Directa", "Recomendación"].map(o => `<option ${(c.origen || "Directa") === o ? "selected" : ""}>${o}</option>`).join("")}</select></div>
      <div class="f-field"><label>Idioma</label><select id="cf-idioma">${["es", "en", "de", "da", "sv", "fr"].map(l => `<option ${(c.idioma || "es") === l ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      <div class="f-field full"><label>Notas</label><textarea id="cf-notas" placeholder="Preferencias, mascotas, fechas habituales, qué villa le encaja…">${esc(c.notas || "")}</textarea></div>
    </div></div>
    <div class="modal-foot">
      ${id ? `<button class="btn outline" style="color:var(--terra);margin-right:auto" onclick="borrarClienteUI(${id})">${ICON.trash} Eliminar</button>` : ""}
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarCliente(${id || "null"})">${ICON.check} Guardar</button>
    </div>`);
}
async function guardarCliente(id) {
  const nombre = fval("cf-nombre");
  if (!nombre) return toast("Falta el nombre", "", ICON.alert, "terra");
  const err = await dbGuardarCliente({ nombre, telefono: fval("cf-tel") || null, email: fval("cf-email") || null, origen: fval("cf-origen"), idioma: fval("cf-idioma"), notas: fval("cf-notas") || null }, id);
  if (err) return toast("No se pudo guardar", err, ICON.alert, "terra");
  closeModal(); toast(id ? "Cliente actualizado" : "Cliente añadido", nombre, ICON.check, "ok"); rerender();
}
async function borrarClienteUI(id) {
  const c = CL(id); if (!c) return;
  if (!confirm(`¿Eliminar a ${c.nombre} de la agenda? Se borra también su historial de contactos (sus reservas se conservan).`)) return;
  const err = await dbBorrarCliente(id);
  if (err) return toast("No se pudo eliminar", err, ICON.alert, "terra");
  closeModal(); toast("Cliente eliminado", c.nombre, ICON.trash);
  if (STATE.route === "clientedetail") STATE.route = "clientes";
  rerender();
}
function openContactoForm(clienteId) {
  openModal(`
    <div class="modal-head"><h3>Registrar contacto</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field"><label>Cómo</label><select id="ct-via">${[["whatsapp", "WhatsApp"], ["email", "Email"], ["llamada", "Llamada"], ["encuentro", "En persona"], ["otro", "Otro"]].map(v => `<option value="${v[0]}">${v[1]}</option>`).join("")}</select></div>
      <div class="f-field full"><label>Nota</label><textarea id="ct-nota" placeholder="Ej. Le pasamos fechas libres de agosto; queda en confirmar."></textarea></div>
    </div></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarContacto(${clienteId})">${ICON.check} Guardar</button>
    </div>`);
}
async function guardarContacto(clienteId) {
  const err = await dbRegistrarContacto(clienteId, fval("ct-via"), fval("ct-nota"));
  if (err) return toast("No se pudo registrar", err, ICON.alert, "terra");
  closeModal(); toast("Contacto registrado", "", ICON.check, "ok"); rerender();
}
async function borrarContactoUI(id) {
  const err = await dbBorrarContacto(id);
  if (err) return toast("No se pudo borrar", err, ICON.alert, "terra");
  rerender();
}
/* abre WhatsApp/email y deja registrado el contacto en su historial */
async function contactarCliente(id, via) {
  const c = CL(id); if (!c) return;
  const saludo = `Hola${c.nombre ? " " + c.nombre.replace(/^(Fam\.|Familia|Sr\.|Sra\.|Mr\.|Mrs\.)\s*/i, "").split(" ")[0] : ""}, somos Hygge Services Mallorca 🌿`;
  if (via === "whatsapp") {
    const n = telWa(c.telefono);
    if (!n) return toast("Sin teléfono", "Añade su número en la ficha para escribirle por WhatsApp.", ICON.alert, "terra");
    window.open(`https://wa.me/${n}?text=${encodeURIComponent(saludo)}`, "_blank", "noopener");
  } else {
    if (!c.email) return toast("Sin email", "Añade su correo en la ficha.", ICON.alert, "terra");
    window.open(`mailto:${c.email}?subject=${encodeURIComponent("Hygge Services Mallorca")}&body=${encodeURIComponent(saludo)}`, "_blank", "noopener");
  }
  const err = await dbRegistrarContacto(id, via, "Mensaje enviado desde el portal");
  if (!err) { toast("Contacto registrado", `${via === "whatsapp" ? "WhatsApp" : "Email"} a ${c.nombre}`, ICON.chat, "ok"); rerender(); }
}
async function vincularReservaCli(clienteId) {
  const rid = +fval("cli-res-vinc"); if (!rid) return;
  const err = await dbVincularReservaCliente(rid, clienteId);
  if (err) return toast("No se pudo vincular", err, ICON.alert, "terra");
  toast("Reserva vinculada", "Ya cuenta en su historial de estancias.", ICON.check, "ok"); rerender();
}
async function desvincularReservaCli(reservaId) {
  const err = await dbVincularReservaCliente(reservaId, null);
  if (err) return toast("No se pudo quitar", err, ICON.alert, "terra");
  rerender();
}

function openEmpForm(id) {
  const e = id ? S(id) : {};
  const d = id ? ED(id) : {};
  const colores = ["#4f8a5c", "#4a7fa5", "#b5533c", "#c79c3d", "#84759f", "#555f50"];
  openModal(`
    <div class="modal-head"><h3>${id ? "Editar ficha" : "Nuevo trabajador"}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field full"><label>Nombre y apellidos *</label><input id="ef-nombre" value="${esc(e.nombre || "")}"></div>
      <div class="f-field"><label>Puesto</label>
        <select id="ef-rol">${["Limpieza", "Mantenimiento", "Piscinas y jardines", "Lavandería", "Coordinación"].map(r => `<option ${e.rol_laboral === r ? "selected" : ""}>${r}</option>`).join("")}</select></div>
      <div class="f-field"><label>Teléfono</label><input id="ef-tel" value="${esc(e.telefono || "")}"></div>
      <div class="f-field"><label>Relación</label>
        <select id="ef-relacion"><option value="contrato" ${d.tipo_relacion !== "autonomo" ? "selected" : ""}>Contrato laboral</option><option value="autonomo" ${d.tipo_relacion === "autonomo" ? "selected" : ""}>Autónomo/a</option></select></div>
      <div class="f-field"><label>Jornada h/semana</label><input id="ef-contrato" type="number" min="1" value="${e.contrato_horas || 40}"></div>
      <div class="f-field"><label>Fecha de alta</label><input id="ef-alta" type="date" value="${d.fecha_alta || ""}"></div>
      <div class="f-field"><label>Tarifa €/hora</label><input id="ef-tarifa" type="number" step="0.01" min="0" value="${d.tarifa_hora ?? ""}" placeholder="para su factura/recibo"></div>
      <div class="f-field"><label>DNI / NIE</label><input id="ef-dni" value="${esc(d.dni || "")}"></div>
      <div class="f-field"><label>Nº Seguridad Social</label><input id="ef-nass" value="${esc(d.nass || "")}"></div>
      <div class="f-field full"><label>Email</label><input id="ef-email" type="email" value="${esc(d.email || "")}"></div>
      <div class="f-field full"><label>Dirección</label><input id="ef-direccion" value="${esc(d.direccion || "")}"></div>
      <div class="f-field full"><label>IBAN</label><input id="ef-iban" value="${esc(d.iban || "")}" placeholder="para pagos/factura"></div>
      <div class="f-field"><label>Activo</label><select id="ef-activo"><option value="si" ${e.activo !== false ? "selected" : ""}>Sí</option><option value="no" ${e.activo === false ? "selected" : ""}>No</option></select></div>
      <div class="f-field"><label>Color en el mapa</label>
        <div class="tag-multi" id="ef-color">${colores.map(c => `<span class="tg ${(e.color || colores[0]) === c ? "on" : ""}" data-c="${c}" onclick="$$('#ef-color .tg').forEach(x=>x.classList.remove('on'));this.classList.add('on')" style="background:${c};border-color:${c};color:#fff">&nbsp;&nbsp;&nbsp;</span>`).join("")}</div></div>
      <div class="f-field full"><label>Notas</label><textarea id="ef-notas">${esc(d.notas || "")}</textarea></div>
    </div>
    ${!id ? `<p class="form-note">Al guardar se genera un <b>código de acceso de un solo uso</b>: dáselo para que cree su cuenta desde la pantalla de acceso (pestaña «Crear cuenta»). Los datos personales (DNI, IBAN…) solo los ve dirección.</p>` : ""}
    </div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarEmpleado(${id || "null"})">${ICON.check} Guardar</button>
    </div>`, true);
}
async function guardarEmpleado(id) {
  const nombre = fval("ef-nombre");
  if (!nombre) return toast("Falta el nombre", "", ICON.alert, "terra");
  const r = await dbGuardarEmpleado({
    nombre, rol_laboral: fval("ef-rol"), telefono: fval("ef-tel") || null,
    contrato_horas: fnum("ef-contrato") || 40, activo: fval("ef-activo") === "si",
    color: $("#ef-color .tg.on")?.dataset.c || "#4f8a5c",
  }, id, {
    tipo_relacion: fval("ef-relacion"), fecha_alta: fval("ef-alta") || null,
    tarifa_hora: fnum("ef-tarifa") || 0, dni: fval("ef-dni") || null, nass: fval("ef-nass") || null,
    email: fval("ef-email") || null, direccion: fval("ef-direccion") || null,
    iban: fval("ef-iban") || null, notas: fval("ef-notas") || null,
  });
  if (r.error) return toast("No se pudo guardar", r.error, ICON.alert, "terra");
  closeModal();
  if (!id && r.emp?.codigo_acceso) {
    openModal(`
      <div class="modal-head"><h3>${esc(nombre)} ya está en el equipo</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
      <div class="modal-body" style="text-align:center;padding-bottom:26px">
        <p style="font-size:13.5px;margin-bottom:14px">Su código para crear la cuenta (un solo uso):</p>
        <button class="code-chip" style="font-size:19px;padding:10px 18px" onclick="copiar('${esc(r.emp.codigo_acceso)}')">${esc(r.emp.codigo_acceso)} ${ICON.copy}</button>
        <p class="form-note">También lo verás en su ficha (Equipo → su nombre).</p>
      </div>`);
  } else toast("Ficha guardada", nombre, ICON.check, "ok");
  rerender();
}

/* ============================================================
   TAREAS (planificación + flujo empleado)
   ============================================================ */
function openTareaForm(fecha, propId, tareaId, empId) {
  const t = tareaId ? DB.tareas.find(x => x.id === tareaId) : { equipo_ids: empId ? [empId] : undefined };
  openModal(`
    <div class="modal-head"><h3>${tareaId ? "Editar servicio" : "Nuevo servicio"}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field full"><label>Propiedad *</label>
        <select id="tf-prop">${DB.props.filter(p => p.activa).map(p => `<option value="${p.id}" ${(t.propiedad_id || propId) === p.id ? "selected" : ""}>${esc(p.nombre)}</option>`).join("")}</select></div>
      <div class="f-field"><label>Fecha</label><input id="tf-fecha" type="date" value="${t.fecha || fecha || hoyISO()}"></div>
      <div class="f-field"><label>Tipo</label>
        <select id="tf-tipo">${[["limpieza", "Limpieza"], ["mantenimiento", "Mantenimiento"], ["piscina", "Piscina / jardín"], ["otro", "Otro"]].map(x => `<option value="${x[0]}" ${t.tipo === x[0] ? "selected" : ""}>${x[1]}</option>`).join("")}</select></div>
      <div class="f-field"><label>Hora inicio</label><input id="tf-hin" type="time" value="${(t.hora_inicio || "10:00").slice(0, 5)}"></div>
      <div class="f-field"><label>Hora fin (prevista)</label><input id="tf-hfin" type="time" value="${(t.hora_fin || "12:00").slice(0, 5)}"></div>
      <div class="f-field full"><label>Equipo asignado</label>
        <div class="tag-multi" id="tf-equipo">${DB.emp.filter(e => e.activo).map(e => `<span class="tg ${(t.equipo_ids || []).includes(e.id) ? "on" : ""}" data-id="${e.id}" onclick="this.classList.toggle('on')">${esc(e.nombre.split(" ")[0])}</span>`).join("") || '<span class="hint">Da de alta al equipo primero.</span>'}</div></div>
      <div class="f-field full"><label>Nota</label><input id="tf-desc" value="${esc(t.descripcion || "")}" placeholder="Ej. check-out → check-in 16:00"></div>
      ${!tareaId ? `
      <div class="f-field"><label>Repetir</label>
        <select id="tf-repetir"><option value="0">No repetir</option><option value="1">Cada día (X días seguidos)</option><option value="7">Cada semana</option><option value="14">Cada 2 semanas</option><option value="30">Cada mes</option></select></div>
      <div class="f-field"><label>¿Cuántos días / veces?</label><input id="tf-veces" type="number" min="2" max="26" value="7"></div>` : ""}
    </div></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarTarea(${tareaId || "null"})">${ICON.check} Guardar</button>
    </div>`);
}
async function guardarTarea(id) {
  const payload = {
    propiedad_id: +fval("tf-prop"), fecha: fval("tf-fecha"), tipo: fval("tf-tipo"),
    hora_inicio: fval("tf-hin") || null, hora_fin: fval("tf-hfin") || null,
    equipo_ids: $$("#tf-equipo .tg.on").map(t => +t.dataset.id), descripcion: fval("tf-desc") || null,
  };
  if (id) {
    const err = await dbTareaEstado(id, payload);
    if (err) return toast("No se pudo guardar", err, ICON.alert, "terra");
    closeModal(); toast("Servicio actualizado", P(payload.propiedad_id)?.nombre || "", ICON.check, "ok"); return rerender();
  }
  const cada = +(fval("tf-repetir") || 0), veces = Math.min(26, Math.max(1, cada ? (fnum("tf-veces") || 1) : 1));
  for (let k = 0; k < veces; k++) {
    const err = await dbCrearTarea({ ...payload, fecha: addDias(payload.fecha, k * cada) });
    if (err) return toast("No se pudo guardar", err, ICON.alert, "terra");
  }
  closeModal();
  toast(veces > 1 ? `${veces} servicios planificados` : "Servicio planificado",
    (P(payload.propiedad_id)?.nombre || "") + (veces > 1 ? (cada === 1 ? ` · ${veces} días seguidos` : ` · cada ${cada === 7 ? "semana" : cada === 14 ? "2 semanas" : "mes"}`) : ""), ICON.check, "ok");
  rerender();
}
/* copiar la planificación de una semana a otra (el cuadrante base se repite y solo se retoca) */
function openCopiarSemana(fecha) {
  const lunes = addDias(fecha, -((new Date(fecha + "T12:00").getDay() + 6) % 7));
  openModal(`
    <div class="modal-head"><h3>Copiar semana de planificación</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field"><label>Copiar la semana del…</label><input id="cs-origen" type="date" value="${addDias(lunes, -7)}"></div>
      <div class="f-field"><label>…a la semana del</label><input id="cs-destino" type="date" value="${lunes}"></div>
    </div>
    <p class="form-note">Copia todos los servicios de la semana de origen (propiedad, horario y equipo) al mismo día de la semana de destino, como pendientes. Si en el destino ya existe un servicio idéntico, se salta — puedes copiarla varias veces sin duplicar.</p></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" id="cs-go" onclick="doCopiarSemana()">${ICON.copy} Copiar semana</button>
    </div>`);
}
async function doCopiarSemana() {
  const norm = f => addDias(f, -((new Date(f + "T12:00").getDay() + 6) % 7));
  const o = fval("cs-origen"), de = fval("cs-destino");
  if (!o || !de) return;
  const lo = norm(o), ld = norm(de);
  if (lo === ld) return toast("Elige dos semanas distintas", "", ICON.alert, "terra");
  const origen = DB.tareas.filter(t => t.fecha >= lo && t.fecha <= addDias(lo, 6));
  if (!origen.length) return toast("La semana de origen está vacía", "No hay servicios que copiar.", ICON.alert, "terra");
  const btn = $("#cs-go"); btn.disabled = true; btn.textContent = "Copiando…";
  let n = 0, saltados = 0;
  for (const t of origen) {
    const offset = Math.round((new Date(t.fecha + "T12:00") - new Date(lo + "T12:00")) / 864e5);
    const fecha = addDias(ld, offset);
    if (DB.tareas.some(x => x.fecha === fecha && x.propiedad_id === t.propiedad_id && x.tipo === t.tipo && x.hora_inicio === t.hora_inicio)) { saltados++; continue; }
    const err = await dbCrearTarea({ propiedad_id: t.propiedad_id, fecha, tipo: t.tipo, hora_inicio: t.hora_inicio, hora_fin: t.hora_fin, equipo_ids: t.equipo_ids || [], descripcion: t.descripcion || null });
    if (err) { btn.disabled = false; btn.textContent = "Copiar semana"; return toast("Error al copiar", err, ICON.alert, "terra"); }
    n++;
  }
  closeModal();
  toast(n ? `${n} servicio${n === 1 ? "" : "s"} copiado${n === 1 ? "" : "s"}` : "Nada que copiar",
    `a la semana del ${fmtCorto(ld)}${saltados ? ` · ${saltados} ya existía${saltados === 1 ? "" : "n"}` : ""}`, ICON.check, n ? "ok" : "");
  STATE.planDia = ld; rerender();
}
async function delTarea(id) {
  if (!confirm("¿Eliminar este servicio?")) return;
  const err = await dbBorrarTarea(id);
  if (err) return toast("No se pudo eliminar", err, ICON.alert, "terra");
  toast("Servicio eliminado", "", ICON.trash); rerender();
}
async function marcarTareaHecha(id) {
  const err = await dbTareaEstado(id, { estado: "hecha", fin_real: new Date().toISOString() });
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  toast("Servicio completado ✓", "", ICON.check, "ok"); rerender();
}
async function tareaLlegada(id) {
  const err = await dbTareaEstado(id, { estado: "encurso", inicio_real: new Date().toISOString() });
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  dbPingPosicion();
  toast("¡Buen trabajo!", "Marca el checklist según avances.", ICON.broom, "ok"); rerender();
}
function openChecklist(id) {
  const t = DB.tareas.find(x => x.id === id); if (!t) return;
  const chk = t.checklist || [];
  openModal(`
    <div class="modal-head"><h3>Checklist · ${esc(P(t.propiedad_id)?.nombre || "")}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body">
      <div class="prog-ring" style="margin-bottom:14px"><span class="bar" style="flex:1"><i id="chk-bar" style="width:${chk.length ? chk.filter(c => c.ok).length / chk.length * 100 : 0}%"></i></span><b id="chk-num">${chk.filter(c => c.ok).length}/${chk.length}</b></div>
      <div class="check-list">
        ${chk.map((c, i) => `
          <button class="check-item ${c.ok ? "on" : ""}" onclick="tickChk(${id},${i},this)">
            <span class="bx">${ICON.check}</span><span>${esc(c.t)}</span>
          </button>`).join("") || '<p class="hint">Esta tarea no tiene checklist (configura la plantilla en Ajustes).</p>'}
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal();rerender()">Seguir luego</button>
      <button class="btn primary" id="chk-fin" ${chk.length && chk.every(c => c.ok) ? "" : "disabled"} onclick="closeModal();openFinalizarModal(${id})">${ICON.check} Finalizar servicio</button>
    </div>`);
}
async function tickChk(id, i, el) {
  const t = DB.tareas.find(x => x.id === id); if (!t) return;
  el.classList.toggle("on");
  // la verdad es el DOM del modal: así ningún refresco en segundo plano pisa ticks en vuelo
  const ons = $$("#modal-root .check-item").map(x => x.classList.contains("on"));
  t.checklist = t.checklist.map((c, j) => ({ ...c, ok: ons[j] ?? c.ok }));
  const n = t.checklist.filter(c => c.ok).length;
  $("#chk-num").textContent = n + "/" + t.checklist.length;
  $("#chk-bar").style.width = (n / t.checklist.length * 100) + "%";
  const fin = $("#chk-fin"); if (fin) fin.disabled = !t.checklist.every(c => c.ok);
  await DB.sb.from("tareas").update({ checklist: t.checklist }).eq("id", id);
}
/* finalizar con observaciones y fotos del estado (requisito del cliente) */
function openFinalizarModal(id) {
  const t = DB.tareas.find(x => x.id === id); if (!t) return;
  openModal(`
    <div class="modal-head"><h3>Terminar · ${esc(P(t.propiedad_id)?.nombre || "")}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body">
      <div class="f-field" style="margin-bottom:12px"><label>¿Cómo ha quedado? Fotos del estado (opcional)</label>
        <label class="file-btn">${ICON.camera} Hacer fotos<input type="file" id="fin-fotos" accept="image/*" capture="environment" multiple onchange="previewFotosFin(this)"></label>
        <div class="thumbs" id="fin-thumbs"></div></div>
      <div class="f-field"><label>Observaciones (opcional)</label>
        <textarea id="fin-notas" placeholder="Ej. Todo en orden. La puerta de la terraza cuesta de cerrar."></textarea></div>
    </div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Volver</button>
      <button class="btn primary" id="fin-go" onclick="doFinalizar(${id})">${ICON.check} Finalizar servicio</button>
    </div>`);
}
function previewFotosFin(input) {
  const box = $("#fin-thumbs"); box.innerHTML = "";
  [...input.files].slice(0, 8).forEach(f => { const img = document.createElement("img"); img.src = URL.createObjectURL(f); box.appendChild(img); });
}
async function doFinalizar(id) {
  const btn = $("#fin-go"); btn.disabled = true; btn.textContent = "Guardando…";
  const files = $("#fin-fotos")?.files;
  if (files?.length) {
    const errF = await dbFotosTarea(id, files);
    if (errF) { btn.disabled = false; btn.textContent = "Finalizar servicio"; return toast("No se pudieron subir las fotos", errF, ICON.alert, "terra"); }
  }
  const t = DB.tareas.find(x => x.id === id);
  const err = await dbTareaEstado(id, {
    estado: "hecha", fin_real: new Date().toISOString(),
    notas_equipo: fval("fin-notas") || null, ...(t ? { checklist: t.checklist } : {}),
  });
  if (err) { btn.disabled = false; btn.textContent = "Finalizar servicio"; return toast("No se pudo finalizar", err, ICON.alert, "terra"); }
  dbPingPosicion();
  closeModal();
  toast("¡Servicio terminado! ✨", "La oficina ya lo ve como hecho" + (files?.length ? ` con ${files.length} foto${files.length > 1 ? "s" : ""}` : "") + ".", ICON.check, "ok");
  rerender();
}

/* trabajo espontáneo en una propiedad (fichaje asociado sin tarea previa) */
function openTareaAdhoc() {
  if (!DB.props.length) return toast("No hay propiedades", "", ICON.alert, "terra");
  openModal(`
    <div class="modal-head"><h3>Empezar trabajo en una propiedad</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field full"><label>Propiedad</label>
        <select id="ah-prop">${DB.props.filter(p => p.activa).map(p => `<option value="${p.id}">${esc(p.nombre)}</option>`).join("")}</select></div>
      <div class="f-field full"><label>Tipo de trabajo</label>
        <select id="ah-tipo">${[["limpieza", "Limpieza"], ["mantenimiento", "Mantenimiento"], ["piscina", "Piscina / jardín"], ["otro", "Otro"]].map(x => `<option value="${x[0]}">${x[1]}</option>`).join("")}</select></div>
    </div>
    <p class="form-note">Queda registrada tu hora de llegada ahora mismo y tu posición; al terminar, la salida. La oficina lo ve al momento.</p></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" id="ah-go" onclick="crearTareaAdhoc()">${ICON.pin} He llegado, empezar</button>
    </div>`);
}
async function crearTareaAdhoc() {
  const me = miEmp(); if (!me) return;
  const btn = $("#ah-go"); btn.disabled = true; btn.textContent = "Abriendo…";
  const ahora = new Date();
  const err = await dbCrearTarea({
    propiedad_id: +fval("ah-prop"), fecha: hoyISO(), tipo: fval("ah-tipo"),
    hora_inicio: ahora.toTimeString().slice(0, 5), equipo_ids: [me.id],
    estado: "encurso", inicio_real: ahora.toISOString(), descripcion: "Trabajo abierto desde la app",
  });
  if (err) { btn.disabled = false; btn.textContent = "He llegado, empezar"; return toast("No se pudo abrir", err, ICON.alert, "terra"); }
  dbPingPosicion();
  closeModal();
  toast("Trabajo abierto", "Marca el checklist y finaliza cuando acabes.", ICON.broom, "ok");
  rerender();
}

/* compras / materiales */
function openCompraRapida(propId) {
  openModal(`
    <div class="modal-head"><h3>Falta algo · ${esc(P(propId)?.nombre || "")}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body">
      <div class="f-field"><label>¿Qué falta o hay que reponer?</label>
        <input id="cr-texto" placeholder="Ej. 2 rollos de papel, gel de baño, bombilla salón" onkeydown="if(event.key==='Enter')doCompraRapida(${propId})"></div>
    </div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="doCompraRapida(${propId})">${ICON.plus} Añadir a la lista</button>
    </div>`);
  setTimeout(() => $("#cr-texto")?.focus(), 150);
}
async function doCompraRapida(propId) {
  const v = fval("cr-texto"); if (!v) return;
  const err = await dbCrearCompra(propId, v);
  if (err) return toast("No se pudo añadir", err, ICON.alert, "terra");
  closeModal(); toast("Añadido a la lista de compras", v, ICON.check, "ok"); rerender();
}
async function crearCompraUI(propId) {
  const v = fval("compra-nueva"); if (!v) return;
  const err = await dbCrearCompra(propId, v);
  if (err) return toast("No se pudo añadir", err, ICON.alert, "terra");
  rerender();
}
async function marcarCompraUI(id, comprado) {
  const err = await dbMarcarCompra(id, comprado);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  rerender();
}
async function borrarCompraUI(id) {
  const err = await dbBorrarCompra(id);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  rerender();
}
const openPaperCostes = mes => paperModal(paperCostes(mes), "Horas y coste por propiedad · " + fmtMes(mes));
const openPaperAbsentismo = mes => paperModal(paperAbsentismo(mes), "Absentismo y asistencia · " + fmtMes(mes));

/* ============================================================
   AUSENCIAS (absentismo)
   ============================================================ */
function openAusenciaForm(empId, fecha, origen) {
  const e = S(empId); if (!e) return;
  openModal(`
    <div class="modal-head"><h3>Registrar ausencia · ${esc(e.nombre)}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field"><label>Fecha *</label><input id="au-fecha" type="date" value="${fecha || hoyISO()}" max="${hoyISO()}"></div>
      <div class="f-field"><label>Tipo</label>
        <select id="au-tipo"><option value="injustificada">Sin justificar</option><option value="justificada">Justificada</option></select></div>
      <div class="f-field full"><label>Motivo / observaciones</label><input id="au-motivo" placeholder="Ej. no acudió al turno y no avisó · baja médica · permiso"></div>
      <div class="f-field full"><label>Justificante (opcional)</label>
        <div class="field-file"><label class="file-btn">${ICON.plus} Adjuntar documento<input type="file" id="au-just"></label>
        <span class="hint" id="au-just-nombre"></span></div></div>
    </div>
    ${origen === "auto" ? `<p class="form-note">Detectada automáticamente: tenía trabajo asignado ese día y no hay ningún fichaje.</p>` : ""}
    </div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn danger" id="au-go" onclick="guardarAusencia(${empId},'${origen || "manual"}')">${ICON.check} Registrar</button>
    </div>`);
  $("#au-just")?.addEventListener("change", ev => { $("#au-just-nombre").textContent = ev.target.files[0]?.name || ""; });
}
async function guardarAusencia(empId, origen) {
  const fecha = fval("au-fecha"); if (!fecha) return;
  const btn = $("#au-go"); btn.disabled = true; btn.textContent = "Guardando…";
  const err = await dbCrearAusencia(empId, fecha, fval("au-tipo"), fval("au-motivo"), origen, $("#au-just")?.files[0]);
  if (err) { btn.disabled = false; btn.textContent = "Registrar"; return toast("No se pudo registrar", err, ICON.alert, "terra"); }
  closeModal();
  toast("Ausencia registrada", fmtCorto(fecha) + " · " + (fval("au-tipo") === "justificada" ? "justificada" : "sin justificar"), ICON.check, "ok");
  rerender();
}
function openJustificarForm(id) {
  const a = DB.ausencias.find(x => x.id === id); if (!a) return;
  openModal(`
    <div class="modal-head"><h3>Justificar ausencia · ${fmtCorto(a.fecha)}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body">
      <div class="f-field" style="margin-bottom:12px"><label>Motivo *</label>
        <input id="ju-motivo" value="${esc(a.motivo || "")}" placeholder="Ej. baja médica con parte, permiso retribuido…"></div>
      <div class="f-field"><label>Justificante (opcional)</label>
        <div class="field-file"><label class="file-btn">${ICON.plus} Adjuntar documento<input type="file" id="ju-just"></label>
        <span class="hint" id="ju-just-nombre"></span></div></div>
    </div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="justificarAusenciaUI(${id})">${ICON.check} Marcar justificada</button>
    </div>`);
  $("#ju-just")?.addEventListener("change", ev => { $("#ju-just-nombre").textContent = ev.target.files[0]?.name || ""; });
}
async function justificarAusenciaUI(id) {
  const motivo = fval("ju-motivo");
  if (!motivo) return toast("Falta el motivo", "", ICON.alert, "terra");
  const err = await dbJustificarAusencia(id, motivo, $("#ju-just")?.files[0]);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  closeModal(); toast("Ausencia justificada", motivo, ICON.check, "ok"); rerender();
}
async function borrarAusenciaUI(id) {
  if (!confirm("¿Eliminar este registro de ausencia?")) return;
  const err = await dbBorrarAusencia(id);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  toast("Registro eliminado", "", ICON.trash); rerender();
}

/* ============================================================
   FICHAJE (empleado)
   ============================================================ */
function modalFotoFichaje(tipo) {
  // tipo: 'entrada' | 'salida' — con foto obligatoria si así está configurado
  const esEntrada = tipo === "entrada";
  openModal(`
    <div class="modal-head"><h3>Fichar ${tipo}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body">
      <p style="font-size:14px;margin-bottom:14px">Son las <b>${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</b>.
      ${fotoFichajeObligatoria() ? `Haz una foto ${esEntrada ? "del lugar donde empiezas" : "de cómo queda todo al salir"} — junto con tu ubicación, confirma el fichaje.` : ""}</p>
      ${fotoFichajeObligatoria() ? `
      <div class="f-field"><label>Foto de ${tipo} *</label>
        <label class="file-btn">${ICON.camera} Hacer foto<input type="file" id="ff-foto" accept="image/*" capture="environment" onchange="previewFotoFichaje(this)"></label>
        <div class="thumbs" id="ff-thumb"></div></div>` : ""}
    </div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">${esEntrada ? "Cancelar" : "Seguir trabajando"}</button>
      <button class="btn primary" id="ff-go" ${fotoFichajeObligatoria() ? "disabled" : ""} onclick="doFichar('${tipo}')">${ICON.clock} Fichar ${tipo}</button>
    </div>`);
}
function previewFotoFichaje(input) {
  const box = $("#ff-thumb"); box.innerHTML = "";
  if (input.files[0]) {
    const img = document.createElement("img"); img.src = URL.createObjectURL(input.files[0]); box.appendChild(img);
    $("#ff-go").disabled = false;
  } else $("#ff-go").disabled = true;
}
async function doFichar(tipo) {
  const foto = $("#ff-foto")?.files[0] || null;
  if (fotoFichajeObligatoria() && !foto) return toast("Falta la foto", "Haz la foto para confirmar el fichaje.", ICON.camera, "terra");
  const btn = $("#ff-go"); btn.disabled = true; btn.textContent = "Fichando…";
  const err = tipo === "entrada" ? await dbFicharEntrada(foto) : await dbFicharSalida(foto);
  if (err) { btn.disabled = false; btn.textContent = "Fichar " + tipo; return toast("No se pudo fichar", err, ICON.alert, "terra"); }
  closeModal();
  toast(tipo === "entrada" ? "Entrada fichada" : "Salida fichada",
    new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + " · con foto y ubicación" + (tipo === "salida" ? ". ¡Hasta mañana!" : ""), ICON.check, "ok");
  rerender();
}
function ficharEntradaUI() { modalFotoFichaje("entrada"); }
function ficharSalidaUI() { modalFotoFichaje("salida"); }
async function pausaUI() {
  const err = await dbPausa();
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  rerender();
}
async function actualizarPosicionUI() {
  await dbPingPosicion();
  toast("Posición actualizada", "La oficina te ve en el mapa.", ICON.gps, "ok");
}

/* ============================================================
   INCIDENCIAS
   ============================================================ */
function openNuevaIncidencia(propId) {
  if (!DB.props.length) return toast("Primero añade propiedades", "", ICON.alert, "terra");
  openModal(`
    <div class="modal-head"><h3>Nueva incidencia</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="f-field"><label>Propiedad</label>
          <select id="ni-prop">${DB.props.map(p => `<option value="${p.id}" ${propId === p.id ? "selected" : ""}>${esc(p.nombre)}</option>`).join("")}</select></div>
        <div class="f-field"><label>Prioridad</label>
          <select id="ni-prio"><option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></div>
        <div class="f-field full"><label>¿Qué ha pasado? *</label><input id="ni-tit" placeholder="Ej. Persiana atascada en el salón"></div>
        <div class="f-field full"><label>Detalle</label><textarea id="ni-desc" placeholder="Cuéntalo en una frase; con la foto suele bastar."></textarea></div>
        <div class="full"><label class="file-btn">${ICON.camera} Hacer foto o adjuntar<input type="file" id="ni-fotos" accept="image/*" capture="environment" multiple onchange="previewFotos(this)"></label>
          <div class="thumbs" id="ni-thumbs"></div></div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn danger" id="ni-send" onclick="crearIncidencia()">${ICON.send} Enviar incidencia</button>
    </div>`);
}
function previewFotos(input) {
  const box = $("#ni-thumbs"); box.innerHTML = "";
  [...input.files].slice(0, 6).forEach(f => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(f); box.appendChild(img);
  });
}
async function crearIncidencia() {
  const titulo = fval("ni-tit");
  if (!titulo) return toast("Falta el título", "Di en una frase qué ha pasado.", ICON.alert, "terra");
  const btn = $("#ni-send"); btn.disabled = true; btn.textContent = "Enviando…";
  const err = await dbCrearIncidencia({
    propiedad_id: +fval("ni-prop"), titulo, descripcion: fval("ni-desc") || null, prioridad: fval("ni-prio"),
  }, $("#ni-fotos")?.files);
  if (err) { btn.disabled = false; btn.textContent = "Enviar incidencia"; return toast("No se pudo enviar", err, ICON.alert, "terra"); }
  closeModal(); toast("Incidencia enviada", "La oficina ya la tiene.", ICON.alert, "terra"); rerender();
}
async function abrirIncidencia(id) {
  const i = DB.incidencias.find(x => x.id === id); if (!i) return;
  openDrawer(drawerIncidencia(i));
  const box = $("#inc-fotos"); if (!box) return;
  box.innerHTML = "";
  for (const path of i.fotos || []) {
    const url = await fotoUrl(path);
    if (url) box.insertAdjacentHTML("beforeend", `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="foto incidencia"></a>`);
  }
  if (!(i.fotos || []).length) box.innerHTML = "";
  if (rolDireccion()) cargarDocs(`incidencias-docs/${i.id}`, "#inc-docs");
}
/* lavandería */
async function setRopaUI(propId, estado) {
  const err = await dbSetRopa(propId, estado);
  if (err) return toast("No se pudo actualizar", err, ICON.alert, "terra");
  toast("Ropa de " + (P(propId)?.nombre || "la propiedad"), ROPA_ESTADOS[estado], ICON.check, "ok");
  rerender();
}
async function regenLavUI() {
  if (!confirm("¿Generar un código nuevo para la lavandería? El anterior dejará de funcionar.")) return;
  const err = await dbRegenCodigoLav();
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  toast("Código regenerado", "Pásaselo a la lavandería.", ICON.check, "ok"); rerender();
}
async function comentarInc(id) {
  const txt = fval("inc-coment"); if (!txt) return;
  const err = await dbComentarIncidencia(id, txt);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  abrirIncidencia(id);
}
async function resolverInc(id) {
  const err = await dbResolverIncidencia(id, fval("inc-coste"));
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  toast("Incidencia resuelta ✓", "", ICON.check, "ok"); closeDrawer(); rerender();
}

/* ============================================================
   FACTURACIÓN
   ============================================================ */
function openGenerarFacturas() {
  const mes = addMeses(mesISO(), -1);
  openModal(`
    <div class="modal-head"><h3>Generar facturas del mes</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body">
      <div class="f-field"><label>Mes a facturar</label><input id="gf-mes" type="month" value="${mes}"></div>
      <p class="form-note">Crea un <b>borrador por propietario</b> con: tarifa de gestión mensual de cada propiedad + limpiezas hechas × tarifa por limpieza.
      Revisas los borradores y los emites cuando quieras (ahí reciben número correlativo).</p>
    </div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" id="gf-go" onclick="doGenerarFacturas()">${ICON.invoice} Generar borradores</button>
    </div>`);
}
async function doGenerarFacturas() {
  const mes = fval("gf-mes"); if (!mes) return;
  const btn = $("#gf-go"); btn.disabled = true; btn.textContent = "Generando…";
  const n = await dbGenerarFacturasMes(mes);
  closeModal();
  toast(n ? `${n} borrador${n > 1 ? "es" : ""} creado${n > 1 ? "s" : ""}` : "Nada que facturar",
    n ? "Revísalos y pulsa Emitir." : "Ese mes no hay tarifas ni limpiezas facturables (revisa las tarifas de cada propiedad).",
    ICON.invoice, n ? "ok" : "");
  STATE.factFilter = n ? "borrador" : STATE.factFilter; rerender();
}
function openFacturaManual() {
  openModal(`
    <div class="modal-head"><h3>Factura manual</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field full"><label>Cliente *</label><input id="fm-cliente" placeholder="Hotel / propietario / empresa"></div>
      <div class="f-field full"><label>Concepto *</label><input id="fm-concepto" placeholder="Ej. Servicio de lavandería junio · 420 kg"></div>
      <div class="f-field"><label>Base imponible € *</label><input id="fm-base" type="number" step="0.01" min="0"></div>
      <div class="f-field"><label>Fecha</label><input id="fm-fecha" type="date" value="${hoyISO()}"></div>
    </div></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="crearFacturaManual()">${ICON.check} Crear borrador</button>
    </div>`);
}
async function crearFacturaManual() {
  const cliente = fval("fm-cliente"), concepto = fval("fm-concepto"), base = fnum("fm-base");
  if (!cliente || !concepto || !base) return toast("Faltan datos", "Cliente, concepto y base son obligatorios.", ICON.alert, "terra");
  const { error } = await DB.sb.from("facturas").insert({ cliente, concepto, base, fecha: fval("fm-fecha") || hoyISO(), lineas: [{ c: concepto, importe: base }], tipo: "Manual" });
  if (error) return toast("No se pudo crear", limpiaErr(error.message), ICON.alert, "terra");
  await dbCargarTodo(); closeModal();
  toast("Borrador creado", cliente + " · " + eur(base), ICON.invoice, "ok"); rerender();
}
async function emitirFacturaUI(id) {
  const r = await dbEmitirFactura(id);
  if (r.error) return toast("No se pudo emitir", r.error, ICON.alert, "terra");
  toast("Factura emitida", r.numero, ICON.send, "ok"); rerender();
}
async function cobrarFacturaUI(id) {
  const err = await dbCobrarFactura(id);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  toast("Factura cobrada ✓", "", ICON.check, "ok"); rerender();
}

/* ============================================================
   AJUSTES
   ============================================================ */
async function guardarEmpresa() {
  const valor = {};
  ["nombre", "cif", "direccion", "telefono", "email", "iban"].forEach(k => valor[k] = fval("emp-" + k));
  const err = await dbSetAjuste("empresa", valor);
  if (err) return toast("No se pudo guardar", err, ICON.alert, "terra");
  toast("Datos de empresa guardados", "", ICON.check, "ok"); rerender();
}
async function addChecklistStep() {
  const v = fval("chk-new"); if (!v) return;
  const chk = [...(DB.ajustes.checklist_base || []), v];
  const err = await dbSetAjuste("checklist_base", chk);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  toast("Paso añadido", "Se aplicará a los próximos servicios.", ICON.check, "ok"); rerender();
}
async function quitarChecklist(i) {
  const chk = [...(DB.ajustes.checklist_base || [])]; chk.splice(i, 1);
  const err = await dbSetAjuste("checklist_base", chk);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  rerender();
}
async function toggleFotoFichaje(btn) {
  const nuevo = !fotoFichajeObligatoria();
  const err = await dbSetAjuste("fichaje", { ...(DB.ajustes.fichaje || {}), foto_obligatoria: nuevo });
  if (err) return toast("No se pudo guardar", err, ICON.alert, "terra");
  btn.classList.toggle("on", nuevo);
  toast(nuevo ? "Foto obligatoria activada" : "Foto obligatoria desactivada", "Aplica al próximo fichaje del equipo.", ICON.camera, "ok");
}
async function activarDireccionUI(uid) {
  const err = await dbActivarDireccion(uid);
  if (err) return toast("No se pudo activar", err, ICON.alert, "terra");
  toast("Cuenta activada como dirección", "", ICON.check, "ok"); rerender();
}

/* ============================================================
   RESEÑAS Y MEJORAS (portal del propietario)
   ============================================================ */
function propsDeOwner(ownerId) { return DB.props.filter(p => p.propietario_id === ownerId); }
function openResenaForm(ownerId) {
  const propsO = propsDeOwner(ownerId);
  if (!propsO.length) return toast("Vincula primero una propiedad", "", ICON.alert, "terra");
  openModal(`
    <div class="modal-head"><h3>Añadir reseña</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field"><label>Propiedad</label><select id="rs-prop">${propsO.map(p => `<option value="${p.id}">${esc(p.nombre)}</option>`).join("")}</select></div>
      <div class="f-field"><label>Puntuación</label><select id="rs-punt">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${"★".repeat(n)} (${n})</option>`).join("")}</select></div>
      <div class="f-field"><label>Huésped</label><input id="rs-autor" placeholder="Ej. Familia Weber"></div>
      <div class="f-field"><label>Canal</label><select id="rs-canal">${["Airbnb", "Booking", "Vrbo", "Directa"].map(c => `<option>${c}</option>`).join("")}</select></div>
      <div class="f-field"><label>Fecha</label><input id="rs-fecha" type="date" value="${hoyISO()}"></div>
      <div class="f-field full"><label>Texto de la reseña</label><textarea id="rs-texto" placeholder="Copia aquí la reseña tal cual la escribió el huésped"></textarea></div>
    </div></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarResena()">${ICON.check} Guardar reseña</button>
    </div>`);
}
async function guardarResena() {
  const err = await dbCrearResena({
    propiedad_id: +fval("rs-prop"), puntuacion: +fval("rs-punt"), autor: fval("rs-autor") || null,
    canal: fval("rs-canal"), fecha: fval("rs-fecha") || hoyISO(), texto: fval("rs-texto") || null,
  });
  if (err) return toast("No se pudo guardar", err, ICON.alert, "terra");
  closeModal(); toast("Reseña añadida", "El propietario ya la ve en su portal.", ICON.star, "ok"); rerender();
}
async function borrarResenaUI(id) {
  if (!confirm("¿Eliminar esta reseña?")) return;
  const err = await dbBorrarResena(id);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  toast("Reseña eliminada", "", ICON.trash); rerender();
}
function openMejoraForm(ownerId, mejoraId) {
  const propsO = propsDeOwner(ownerId);
  if (!propsO.length) return toast("Vincula primero una propiedad", "", ICON.alert, "terra");
  const m = mejoraId ? DB.mejoras.find(x => x.id === mejoraId) : {};
  openModal(`
    <div class="modal-head"><h3>${mejoraId ? "Editar propuesta" : "Nueva propuesta de mejora"}</h3><button class="x" onclick="closeModal()">${ICON.x}</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="f-field full"><label>Mejora *</label><input id="mj-titulo" value="${esc(m.titulo || "")}" placeholder="Ej. Zona lounge en la piscina · Gimnasio equipado · Jacuzzi exterior"></div>
      <div class="f-field"><label>Propiedad</label><select id="mj-prop">${propsO.map(p => `<option value="${p.id}" ${m.propiedad_id === p.id ? "selected" : ""}>${esc(p.nombre)}</option>`).join("")}</select></div>
      <div class="f-field"><label>¿Quién la propone?</label>
        <select id="mj-origen"><option value="inquilino" ${m.origen === "inquilino" ? "selected" : ""}>Inquilino / huésped</option><option value="agencia" ${m.origen !== "inquilino" ? "selected" : ""}>La agencia (Hygge)</option></select></div>
      <div class="f-field"><label>Mejora de precio €/noche *</label><input id="mj-inc" type="number" step="5" min="0" value="${m.incremento_precio ?? ""}" placeholder="150"></div>
      <div class="f-field"><label>Coste estimado €</label><input id="mj-coste" type="number" step="1" min="0" value="${m.coste_estimado ?? ""}" placeholder="opcional"></div>
      <div class="f-field full"><label>Quién lo sugirió / detalle</label><input id="mj-autor" value="${esc(m.autor || "")}" placeholder="Ej. lo pidieron 3 huéspedes este verano"></div>
      <div class="f-field full"><label>Descripción</label><textarea id="mj-desc">${esc(m.descripcion || "")}</textarea></div>
    </div></div>
    <div class="modal-foot">
      <button class="btn outline" onclick="closeModal()">Cancelar</button>
      <button class="btn primary" onclick="guardarMejora(${mejoraId || "null"})">${ICON.check} Guardar</button>
    </div>`);
}
async function guardarMejora(id) {
  const titulo = fval("mj-titulo");
  if (!titulo) return toast("Falta el título de la mejora", "", ICON.alert, "terra");
  const err = await dbGuardarMejora({
    titulo, propiedad_id: +fval("mj-prop"), origen: fval("mj-origen"),
    incremento_precio: fnum("mj-inc") || 0, coste_estimado: fnum("mj-coste"),
    autor: fval("mj-autor") || null, descripcion: fval("mj-desc") || null,
  }, id);
  if (err) return toast("No se pudo guardar", err, ICON.alert, "terra");
  closeModal(); toast(id ? "Propuesta actualizada" : "Propuesta creada", titulo, ICON.check, "ok"); rerender();
}
async function estadoMejoraUI(id, estado) {
  const err = await dbEstadoMejora(id, estado);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  toast(estado === "implementada" ? "Mejora implementada ✨" : "Propuesta descartada",
    estado === "implementada" ? "Desde hoy suma a los ingresos del propietario." : "", ICON.check, estado === "implementada" ? "ok" : "");
  rerender();
}
async function borrarMejoraUI(id) {
  if (!confirm("¿Eliminar esta propuesta?")) return;
  const err = await dbBorrarMejora(id);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  rerender();
}
async function vincularPropUI(ownerId) {
  const propId = +fval("vinc-prop"); if (!propId) return;
  const err = await dbVincularProp(propId, ownerId);
  if (err) return toast("No se pudo vincular", err, ICON.alert, "terra");
  toast("Propiedad vinculada", P(propId)?.nombre + " → " + O(ownerId)?.nombre, ICON.check, "ok"); rerender();
}
async function desvincularPropUI(propId) {
  if (!confirm("¿Desvincular esta propiedad del propietario?")) return;
  const err = await dbVincularProp(propId, null);
  if (err) return toast("No se pudo", err, ICON.alert, "terra");
  rerender();
}
/* simulador del propietario */
function toggleMejoraSel(id) {
  if (STATE.mejorasSel.has(id)) STATE.mejorasSel.delete(id); else STATE.mejorasSel.add(id);
  rerender();
}
async function aceptarMejorasSel() {
  const ids = [...STATE.mejorasSel];
  for (const id of ids) {
    const err = await dbEstadoMejora(id, "aceptada");
    if (err) return toast("No se pudo", err, ICON.alert, "terra");
  }
  STATE.mejorasSel = new Set();
  toast("¡Genial! Propuestas aceptadas", "Hygge Services se pone en marcha y te confirmará coste y fechas.", ICON.check, "ok");
  rerender();
}

/* ============================================================
   DOCUMENTOS (propiedades y trabajadores)
   ============================================================ */
async function cargarDocs(prefix, sel = "#docs-list") {
  const box = $(sel); if (!box) return;
  const docs = await dbListarDocumentos(prefix);
  if (!docs.length) { box.innerHTML = `<p class="hint">Sin documentos todavía. Sube aquí el contrato y demás papeles: quedan guardados en la nube.</p>`; return; }
  box.innerHTML = docs.map(d => `
    <div class="doc-row">${ICON.doc}<b>${esc(d.name.replace(/^\d+_/, ""))}</b>
      <span class="sz">${d.metadata?.size ? Math.round(d.metadata.size / 1024) + " KB" : ""}</span>
      <button class="btn xs outline" onclick="abrirDoc('${esc(`${prefix}/${d.name}`)}')">${ICON.eye} Ver</button>
    </div>`).join("");
}
async function abrirDoc(path) {
  const url = await fotoUrl(path);
  if (url) window.open(url, "_blank", "noopener");
}
async function subirDoc(prefix, input, sel = "#docs-list") {
  const f = input.files[0]; if (!f) return;
  const err = await dbSubirDocumento(prefix, f);
  if (err) return toast("No se pudo subir", err, ICON.alert, "terra");
  toast("Documento subido", f.name, ICON.check, "ok");
  cargarDocs(prefix, sel);
}

/* ============================================================
   TRABAJADORES: baja, eliminación y factura mensual
   ============================================================ */
async function bajaTrabajador(id) {
  const e = S(id); if (!e) return;
  const r = await dbGuardarEmpleado({ activo: !e.activo }, id);
  if (r.error) return toast("No se pudo", r.error, ICON.alert, "terra");
  toast(e.activo ? "Dado de baja" : "Reactivado", e.nombre + (e.activo ? " · conserva todo su historial" : ""), ICON.check, "ok");
  rerender();
}
async function eliminarTrabajador(id) {
  const e = S(id); if (!e) return;
  const nFich = DB.fichajes.filter(f => f.empleado_id === id).length;
  if (!confirm(`¿Eliminar DEFINITIVAMENTE a ${e.nombre}?\n\nSe borrará también todo su historial (${nFich} fichajes, posiciones y datos de contrato). Esta acción no se puede deshacer.\n\nSi solo deja de trabajar aquí, usa «Dar de baja»: conserva el historial.`)) return;
  const err = await dbEliminarEmpleado(id);
  if (err) return toast("No se pudo eliminar", err, ICON.alert, "terra");
  toast("Trabajador eliminado", e.nombre, ICON.trash);
  if (STATE.route === "trabajadordetail") STATE.route = "trabajadores";
  rerender();
}
function openPaperTrabajador(id, mes) {
  const e = S(id); if (!e) return;
  const d = ED(id);
  paperModal(paperFacturaTrabajador(e, mes),
    (d.tipo_relacion === "autonomo" ? "Factura · " : "Recibo de horas · ") + e.nombre + " · " + fmtMes(mes));
}

/* ============================================================
   MAPA REAL DE MALLORCA (Leaflet + OpenStreetMap/CARTO)
   ============================================================ */
let LMAP = null;
const MALLORCA_BOUNDS = [[39.25, 2.28], [39.98, 3.52]];
function initLiveMap() {
  const el = $("#mapa-real");
  if (!el) return;
  if (!window.L) { el.innerHTML = '<p class="hint" style="padding:20px">No se pudo cargar el mapa (sin conexión al CDN de Leaflet).</p>'; return; }
  if (LMAP) { try { LMAP.remove(); } catch {} LMAP = null; }
  LMAP = L.map(el, { zoomControl: true, minZoom: 5, maxZoom: 18, zoomSnap: .5 });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · © CARTO',
    subdomains: "abcd", maxZoom: 19,
  }).addTo(LMAP);

  // propiedades (casita dorada)
  DB.props.filter(p => p.activa).forEach(p => {
    const pos = posProp(p);
    L.marker([pos.lat, pos.lng], {
      icon: L.divIcon({ className: "lf-pin", html: `<span class="ho">${ICON.house}</span>`, iconSize: [26, 26], iconAnchor: [13, 24] }),
    }).addTo(LMAP)
      .bindTooltip(`<b>${esc(p.nombre)}</b>${p.zona ? "<br>" + esc(p.zona) : ""}`, { direction: "top", offset: [0, -22], className: "lf-tip" })
      .on("click", () => { STATE.prop = p.id; STATE.propTab = "resumen"; go("propdetail"); });
  });

  // equipo fichado (avatar con anillo de estado, GPS real)
  const pts = [];
  DB.emp.filter(e => e.activo && fichajeAbierto(e.id)).forEach(e => {
    const st = estadoEmpleado(e), pos = posEmpleado(e);
    pts.push([pos.lat, pos.lng]);
    L.marker([pos.lat, pos.lng], {
      zIndexOffset: 500,
      icon: L.divIcon({
        className: "lf-emp" + (["limpiando", "mantenimiento"].includes(st.key) ? " working" : ""),
        html: `<span class="av" style="background:${e.color};--st:${EST[st.key].col}">${ini(e.nombre)}</span>`,
        iconSize: [34, 34], iconAnchor: [17, 17],
      }),
    }).addTo(LMAP)
      .bindTooltip(`<b>${esc(e.nombre)}</b><br>${EST[st.key].txt}${st.prop ? " · " + esc(st.prop.nombre) : ""}${st.desde ? " · desde " + st.desde : ""}`, { direction: "top", offset: [0, -18], className: "lf-tip" })
      .on("click", () => openDrawer(drawerEmpleado(e)));
  });
  STATE._mapPts = pts;

  if (STATE.mapView) LMAP.setView(STATE.mapView.c, STATE.mapView.z);   // conserva zoom/encuadre entre refrescos
  else mapaVista(pts.length ? "equipo" : "isla");
  LMAP.on("moveend", () => { STATE.mapView = { c: LMAP.getCenter(), z: LMAP.getZoom() }; });
  setTimeout(() => { try { LMAP.invalidateSize(); } catch {} }, 120);
}
function mapaVista(k) {
  if (!LMAP) return;
  STATE.mapView = null;
  if (k === "equipo" && (STATE._mapPts || []).length) {
    const pts = STATE._mapPts;
    if (pts.length === 1) LMAP.setView(pts[0], 14);
    else LMAP.fitBounds(L.latLngBounds(pts).pad(.35));
  } else {
    LMAP.fitBounds(MALLORCA_BOUNDS, { padding: [12, 12] });
  }
}

/* ============================================================
   ARRANQUE
   ============================================================ */
window.addEventListener("DOMContentLoaded", async () => {
  startLogin();
  $("#hamb").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  $("#overlay").addEventListener("click", () => document.body.classList.remove("nav-open"));
  $("#drawer-veil").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); closeDrawer(); } });

  dbInit();
  if (!DB.ready) {
    $("#setup-aviso").style.display = "";
    $$("#auth-forms input, #auth-forms button").forEach(el => el.disabled = true);
    return;
  }
  await bootSesion();   // si hay sesión guardada entra directo
});
