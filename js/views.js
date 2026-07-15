/* ============================================================
   VISTAS · Portal Hygge (producto funcional sobre Supabase)
   ============================================================ */

/* ---------- helpers ---------- */
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
const eur = n => (+n || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const eur0 = n => Math.round(+n || 0).toLocaleString("es-ES") + " €";
const ini = nombre => (nombre || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const ava = (e, cls = "mini-ava") => `<span class="${cls}" style="background:${e.color || "#555f50"}">${ini(e.nombre)}</span>`;

/* ---------- iconos ---------- */
const I = (d, extra="") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ICON = {
  home:    I('<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 9.8V20h13V9.8"/><path d="M10 20v-5h4v5"/>'),
  house:   I('<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 9.8V20h13V9.8"/>'),
  users:   I('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.7-3 2.9-4.5 5.5-4.5S13.8 16 14.5 19"/><circle cx="16.8" cy="9" r="2.6"/><path d="M15.5 14.7c2.4.1 4.2 1.5 4.9 4.3"/>'),
  pin:     I('<path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.6 12 21 12 21Z"/><circle cx="12" cy="10.8" r="2.3"/>'),
  clock:   I('<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3 2"/>'),
  cal:     I('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3.5V7M16 3.5V7M3.5 10h17"/>'),
  broom:   I('<path d="m14 4 3.5 3.5"/><path d="M10.5 7.5 16 13c-1.8 3.4-5 5.6-9.4 6.4-1 .2-1.8-.7-1.6-1.6.8-4.4 3-7.6 5.5-10.3Z"/><path d="m8.5 14.5 2.5 2.5"/>'),
  key:     I('<circle cx="8.5" cy="8.5" r="4.5"/><path d="m11.8 11.8 8 8"/><path d="M16.5 16.5 18.6 14.4M18.8 18.8l2-2"/>'),
  alert:   I('<path d="M12 4.5 21 19.5H3L12 4.5Z"/><path d="M12 10.5v3.6"/><circle cx="12" cy="16.9" r=".5" fill="currentColor"/>'),
  doc:     I('<path d="M7 3h7L19 8v12a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V4.5A1.5 1.5 0 0 1 6.5 3Z"/><path d="M14 3v5h5"/><path d="M8.5 12.5h7M8.5 16h7"/>'),
  invoice: I('<path d="M6 3.5h12V20.5l-2.4-1.6-2.4 1.6-1.2-.9-1.2.9-2.4-1.6L6 20.5Z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>'),
  chart:   I('<path d="M4 20h16"/><rect x="6" y="11" width="3" height="6.5" rx="1"/><rect x="11" y="7" width="3" height="10.5" rx="1"/><rect x="16" y="9.5" width="3" height="8" rx="1"/>'),
  settings:I('<circle cx="12" cy="12" r="3"/><path d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20M6.3 6.3l1.6 1.6M16.1 16.1l1.6 1.6M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6"/>'),
  search:  I('<circle cx="10.5" cy="10.5" r="6"/><path d="m15.5 15.5 4.5 4.5"/>'),
  check:   I('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  x:       I('<path d="m6 6 12 12M18 6 6 18"/>'),
  sun:     I('<circle cx="12" cy="12" r="4"/><path d="M12 3.5V5.5M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18"/>'),
  coffee:  I('<path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/><path d="M16 10.5h1.5a2.3 2.3 0 0 1 0 4.6H16"/><path d="M8 4.5c0 1 .8 1 .8 2M11.5 4.5c0 1 .8 1 .8 2"/>'),
  wrench:  I('<path d="M14.5 6.5a4 4 0 0 0-5.6 4.6L4 16a2 2 0 1 0 2.8 2.8l4.9-4.9a4 4 0 0 0 4.6-5.6L13.5 11l-2.4-2.4Z"/>'),
  send:    I('<path d="m4 11 16-7-5 16-3.4-6.4Z"/><path d="m11.6 13.6 4-4"/>'),
  down:    I('<path d="M12 4.5v11M7.5 11.5 12 16l4.5-4.5"/><path d="M5 19.5h14"/>'),
  print:   I('<path d="M7 8V4h10v4"/><rect x="4.5" y="8" width="15" height="8" rx="2"/><path d="M7 13.5h10V20H7Z"/>'),
  plus:    I('<path d="M12 5v14M5 12h14"/>'),
  eye:     I('<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.6"/>'),
  euro:    I('<path d="M17 6.5A6.8 6.8 0 0 0 6.8 12 6.8 6.8 0 0 0 17 17.5"/><path d="M4.5 10.4h8M4.5 13.6h7"/>'),
  camera:  I('<path d="M4 8.5h3l1.5-2.5h7L17 8.5h3V19H4Z"/><circle cx="12" cy="13.5" r="3.2"/>'),
  shield:  I('<path d="M12 3.5 19 6v6c0 4.6-3 7.6-7 8.5-4-.9-7-3.9-7-8.5V6Z"/><path d="m9 11.8 2.2 2.2 3.8-4"/>'),
  arrow:   I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  back:    I('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  left:    I('<path d="M14 6l-6 6 6 6"/>'),
  right:   I('<path d="m10 6 6 6-6 6"/>'),
  in:      I('<path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9"/><path d="M13 8l4 4-4 4M17 12H8"/>'),
  out:     I('<path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M8 8 4 12l4 4M4 12h9"/>'),
  copy:    I('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>'),
  trash:   I('<path d="M5 7h14M9 7V4.5h6V7M8 7l.8 13h6.4L16 7"/>'),
  edit:    I('<path d="M4 20h4l11-11-4-4L4 16Z"/><path d="m13 7 4 4"/>'),
  gps:     I('<circle cx="12" cy="12" r="3"/><path d="M12 2.5V6M12 18v3.5M2.5 12H6M18 12h3.5"/>'),
  id:      I('<rect x="3" y="5" width="18" height="14.5" rx="2.5"/><circle cx="8.8" cy="11" r="2.1"/><path d="M5.8 16.3c.5-1.7 1.7-2.6 3-2.6s2.5.9 3 2.6"/><path d="M14.5 9.5h4M14.5 12.5h4M14.5 15.5h2.6"/>'),
  star:    I('<path d="m12 4 2.4 5 5.6.7-4.1 3.8 1.1 5.5L12 16.2 7 19l1.1-5.5L4 9.7 9.6 9Z"/>'),
  chat:    I('<path d="M21 11.7a8.3 8.3 0 0 1-8.3 8.3c-1.5 0-2.9-.4-4.1-1L3.5 20l1.1-4.4a8.3 8.3 0 1 1 16.4-3.9z"/>'),
  mail:    I('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/>'),
};

const EST = {
  limpiando:     { txt:"Limpiando",     chip:"ok",    col:"#4f8a5c", icon:ICON.broom },
  mantenimiento: { txt:"En servicio",   chip:"terra", col:"#b5533c", icon:ICON.wrench },
  turno:         { txt:"De turno",      chip:"blue",  col:"#4a7fa5", icon:ICON.clock },
  descanso:      { txt:"Descanso",      chip:"gold",  col:"#c79c3d", icon:ICON.coffee },
  libre:         { txt:"Fuera de turno",chip:"gray",  col:"#8b8f84", icon:ICON.clock },
};
const chipEstado = e => {
  const st = estadoEmpleado(e), c = EST[st.key];
  return `<span class="chip ${c.chip}"><i class="d"></i>${c.txt}${st.prop ? " · " + esc(st.prop.nombre) : ""}</span>`;
};

/* ---------- charts ---------- */
function fitCanvas(c) {
  const dpr = window.devicePixelRatio || 1, r = c.getBoundingClientRect();
  c.width = r.width * dpr; c.height = r.height * dpr;
  const ctx = c.getContext("2d"); ctx.scale(dpr, dpr);
  return [ctx, r.width, r.height];
}
function drawBars(id, data, { color = "#c79c3d", hi = -1 } = {}) {
  const c = document.getElementById(id); if (!c) return;
  const [ctx, W, H] = fitCanvas(c);
  const max = Math.max(1, ...data.map(d => d[1])) * 1.15;
  const n = data.length, gap = 8, bw = Math.min(34, (W - gap * (n + 1)) / n);
  const x0 = (W - (bw * n + gap * (n - 1))) / 2;
  ctx.font = "10.5px 'Product Sans',sans-serif"; ctx.textAlign = "center";
  data.forEach((d, i) => {
    const h = (d[1] / max) * (H - 30), x = x0 + i * (bw + gap), y = H - 22 - h;
    ctx.fillStyle = (i === hi || (hi === -1 && i === n - 1)) ? color : color + "55";
    ctx.beginPath(); ctx.roundRect(x, y, bw, Math.max(2, h), 5); ctx.fill();
    ctx.fillStyle = "#767b6e"; ctx.fillText(d[0], x + bw / 2, H - 7);
    ctx.fillStyle = "#3d4237"; ctx.font = "700 10.5px 'Product Sans',sans-serif";
    ctx.fillText(d[1], x + bw / 2, y - 5);
    ctx.font = "10.5px 'Product Sans',sans-serif";
  });
}

/* ---------- cálculo de negocio ---------- */
function nochesEnMes(r, mes) {
  const ini = new Date(mes + "-01T12:00"), fin = new Date(ini); fin.setMonth(fin.getMonth() + 1);
  const a = new Date(r.entrada + "T12:00") > ini ? new Date(r.entrada + "T12:00") : ini;
  const b = new Date(r.salida + "T12:00") < fin ? new Date(r.salida + "T12:00") : fin;
  return Math.max(0, Math.round((b - a) / 864e5));
}
function statsMesProp(propId, mes) {
  const rs = DB.reservas.filter(r => r.propiedad_id === propId && r.estado === "confirmada");
  const noches = rs.reduce((a, r) => a + nochesEnMes(r, mes), 0);
  const dias = new Date(+mes.slice(0, 4), +mes.slice(5, 7), 0).getDate();
  const tars = DB.tareas.filter(t => t.propiedad_id === propId && t.fecha.startsWith(mes));
  const limpiezas = tars.filter(t => t.tipo === "limpieza" && t.estado === "hecha").length;
  const ingresos = rs.filter(r => r.entrada.startsWith(mes)).reduce((a, r) => a + (+r.importe || 0), 0);
  return { noches, ocup: Math.round(noches / dias * 100), limpiezas, ingresos, dias };
}
function ocupacionMes(mes) {
  const activas = DB.props.filter(p => p.activa);
  if (!activas.length) return 0;
  const dias = new Date(+mes.slice(0, 4), +mes.slice(5, 7), 0).getDate();
  const noches = DB.reservas.filter(r => r.estado === "confirmada").reduce((a, r) => a + nochesEnMes(r, mes), 0);
  return Math.round(noches / (activas.length * dias) * 100);
}
function facturaVencida(f) { return f.estado === "emitida" && f.vencimiento && f.vencimiento < hoyISO(); }
const estadoFactura = f => facturaVencida(f) ? "vencida" : f.estado;

/* ---------- empty state ---------- */
const vacio = (icon, titulo, texto, boton) => `
  <div class="empty-big">${icon}<h3>${titulo}</h3><p>${texto}</p>${boton || ""}</div>`;

/* ============================================================
   DASHBOARD
   ============================================================ */
function viewDashboard() {
  const mes = mesISO();
  const nombre = (DB.profile.nombre || "").split(" ")[0];
  if (!DB.props.length) {
    return `
    <div class="dash-hero"><div><h2>Hola, ${esc(nombre)} 👋</h2><div class="date">${fmtDia(hoyISO())}</div></div></div>
    ${vacio(ICON.house, "Empecemos por las propiedades",
      "Añade la primera propiedad que gestionáis: con eso se activan el calendario, la planificación de limpiezas y la facturación.",
      `<button class="btn primary" onclick="openPropForm()">${ICON.plus} Añadir propiedad</button>`)}
    <div class="grid" style="grid-template-columns:1fr 1fr 1fr;margin-top:16px">
      <div class="card"><div class="card-head"><h3>2 · Da de alta a tu equipo</h3></div>
        <p class="hint">Crea la ficha de cada persona y dales su código para que entren en la app y fichen.</p>
        <button class="btn sm outline" style="margin-top:12px" data-go="equipo">${ICON.users} Ir a Equipo</button></div>
      <div class="card"><div class="card-head"><h3>3 · Propietarios</h3></div>
        <p class="hint">Registra a los dueños para generarles liquidaciones y facturas automáticas.</p>
        <button class="btn sm outline" style="margin-top:12px" data-go="propietarios">${ICON.users} Ir a Propietarios</button></div>
      <div class="card"><div class="card-head"><h3>4 · Ajustes</h3></div>
        <p class="hint">Revisa los datos de empresa, el checklist de limpieza y la serie de facturación.</p>
        <button class="btn sm outline" style="margin-top:12px" data-go="ajustes">${ICON.settings} Ir a Ajustes</button></div>
    </div>`;
  }
  const tHoy = DB.tareas.filter(t => t.fecha === hoyISO());
  const salidas = DB.reservas.filter(r => r.salida === hoyISO() && r.estado === "confirmada");
  const entradas = DB.reservas.filter(r => r.entrada === hoyISO() && r.estado === "confirmada");
  const incAb = DB.incidencias.filter(i => i.estado === "abierta");
  const factMes = DB.facturas.filter(f => f.fecha.startsWith(mes) && f.estado !== "borrador");
  const fichados = DB.emp.filter(e => e.activo && fichajeAbierto(e.id));
  const agenda = [
    ...salidas.map(r => ({ h: (r.hora_salida || "10:00").slice(0, 5), ic: ["out", "gold"], txt: `Check-out · ${esc(P(r.propiedad_id)?.nombre || "")}`, sub: `${r.huesped ? esc(r.huesped) + " · " : ""}${r.canal}` })),
    ...tHoy.map(t => ({ h: (t.hora_inicio || "").slice(0, 5) || "—", ic: ["clean", "sage"], txt: `${t.tipo === "limpieza" ? "Limpieza" : t.tipo === "piscina" ? "Piscina" : "Servicio"} · ${esc(P(t.propiedad_id)?.nombre || "")}`, sub: (t.equipo_ids || []).map(id => S(id)?.nombre.split(" ")[0]).filter(Boolean).join(" + ") || "sin equipo asignado", st: t.estado })),
    ...entradas.map(r => ({ h: (r.hora_entrada || "16:00").slice(0, 5), ic: ["in", "ok"], txt: `Check-in · ${esc(P(r.propiedad_id)?.nombre || "")}`, sub: `${r.plazas ? r.plazas + " plazas · " : ""}${r.canal}` })),
  ].sort((a, b) => a.h.localeCompare(b.h));
  const tipoIc = { out: ICON.out, in: ICON.in, clean: ICON.broom };
  const stChip = { hecha: '<span class="chip ok">Hecha</span>', encurso: '<span class="chip blue"><i class="d"></i>En curso</span>', pendiente: '<span class="chip line">Pendiente</span>' };
  const avisos = [];
  DB.facturas.filter(facturaVencida).slice(0, 2).forEach(f =>
    avisos.push({ ic: "gold", icon: ICON.invoice, b: `Factura vencida · ${esc(f.cliente)}`, s: `${eur(f.base * 1.21)} · venció el ${fmtCorto(f.vencimiento)}`, go: "facturacion" }));
  incAb.filter(i => i.prioridad === "alta").slice(0, 2).forEach(i =>
    avisos.push({ ic: "terra", icon: ICON.alert, b: `Incidencia alta · ${esc(P(i.propiedad_id)?.nombre || "")}`, s: esc(i.titulo), go: "incidencias" }));
  entradas.filter(r => !tHoy.some(t => t.propiedad_id === r.propiedad_id && t.tipo === "limpieza")).slice(0, 2).forEach(r =>
    avisos.push({ ic: "blue", icon: ICON.cal, b: `Entrada hoy sin limpieza planificada`, s: esc(P(r.propiedad_id)?.nombre || ""), go: "plan" }));
  if (DB.pendientes.length) avisos.push({ ic: "lilac", icon: ICON.users, b: `${DB.pendientes.length} cuenta(s) pendiente(s) de activar`, s: "Revisa Ajustes → Usuarios", go: "ajustes" });
  DB.lavanderia.filter(l => l.estado === "lista").forEach(l =>
    avisos.push({ ic: "blue", icon: ICON.broom, b: "Ropa lista para recoger", s: esc(P(l.propiedad_id)?.nombre || ""), go: "ropa" }));
  const inj30 = DB.ausencias.filter(a => a.tipo === "injustificada" && a.fecha >= addDias(hoyISO(), -30));
  const porRevisar = DB.emp.filter(e => e.activo).reduce((a, e) => a + diasSinFichar(e.id, addDias(hoyISO(), -30)).length, 0);
  if (inj30.length) avisos.push({ ic: "terra", icon: ICON.alert, b: `${inj30.length} ausencia${inj30.length > 1 ? "s" : ""} sin justificar · 30 días`, s: [...new Set(inj30.map(a => S(a.empleado_id)?.nombre.split(" ")[0]))].filter(Boolean).join(", "), go: "trabajadores" });
  else if (porRevisar) avisos.push({ ic: "gold", icon: ICON.clock, b: `${porRevisar} día${porRevisar > 1 ? "s" : ""} con trabajo asignado sin fichaje`, s: "Revísalos en la ficha de cada trabajador (Asistencia)", go: "trabajadores" });
  const meses12 = Array.from({ length: 12 }, (_, i) => addMeses(mes, i - 11));
  return `
  <div class="dash-hero">
    <div><h2>Hola, ${esc(nombre)} 👋</h2><div class="date">${fmtDia(hoyISO())}</div></div>
    <div class="season">
      <span class="chip gold"><i class="d"></i>Ocupación ${fmtMes(mes).split(" ")[0]} ${ocupacionMes(mes)}%</span>
      <span class="chip ok"><i class="d"></i>${fichados.length} de turno ahora</span>
    </div>
  </div>
  <div class="kpis">
    <div class="kpi"><div class="lab">${ICON.house} Propiedades</div><div class="val">${DB.props.filter(p => p.activa).length}</div><div class="sub">${DB.props.length - DB.props.filter(p => p.activa).length ? DB.props.length - DB.props.filter(p => p.activa).length + " inactivas" : "todas activas"}</div></div>
    <div class="kpi"><div class="lab">${ICON.chart} Ocupación mes</div><div class="val">${ocupacionMes(mes)}<small>%</small></div><div class="sub">noches reservadas / disponibles</div></div>
    <div class="kpi"><div class="lab">${ICON.broom} Servicios hoy</div><div class="val">${tHoy.length}</div><div class="sub">${tHoy.filter(t => t.estado === "hecha").length} hechos · ${tHoy.filter(t => t.estado === "encurso").length} en curso</div></div>
    <div class="kpi"><div class="lab">${ICON.alert} Incidencias abiertas</div><div class="val">${incAb.length}</div><div class="sub">${incAb.filter(i => i.prioridad === "alta").length} de prioridad alta</div></div>
    <div class="kpi"><div class="lab">${ICON.euro} Facturado mes</div><div class="val">${eur0(factMes.reduce((a, f) => a + f.base * 1.21, 0))}</div><div class="sub">${factMes.length} facturas · IVA incl.</div></div>
  </div>

  <div class="card" style="margin-top:16px">
    <div class="card-head"><h3>Ahora mismo</h3><span class="hint">estados en tiempo real, según fichajes y tareas</span>
      <div class="right"><button class="btn sm outline" data-go="equipo">${ICON.pin} Ver mapa en vivo</button></div></div>
    <div class="now-strip">
      ${fichados.length ? fichados.map(e => { const st = estadoEmpleado(e); return `
        <button class="now-chip" data-emp="${e.id}">${ava(e)} ${esc(e.nombre.split(" ")[0])}
        <span>· ${EST[st.key].txt}${st.prop ? " en " + esc(st.prop.nombre) : ""}</span></button>`; }).join("")
      : `<span class="hint">Nadie ha fichado todavía hoy.</span>`}
    </div>
  </div>

  <div class="dash-grid">
    <div class="card">
      <div class="card-head"><h3>Agenda de hoy</h3><span class="sub">${salidas.length} salidas · ${tHoy.length} servicios · ${entradas.length} entradas</span>
        <div class="right"><button class="btn sm outline" data-go="plan">Planificación ${ICON.arrow}</button></div></div>
      ${agenda.length ? agenda.map(a => `
        <div class="agenda-item">
          <span class="agenda-hour">${a.h}</span>
          <span class="ic" style="background:var(--${a.ic[1]}-soft);color:var(--${a.ic[1] === "gold" ? "gold-deep" : a.ic[1]})">${tipoIc[a.ic[0]]}</span>
          <div class="tx"><b>${a.txt}</b><span>${a.sub}</span></div>
          ${a.st ? `<span class="st">${stChip[a.st]}</span>` : ""}
        </div>`).join("")
      : `<div class="empty">${ICON.cal}Hoy no hay salidas, servicios ni entradas programadas.</div>`}
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card">
        <div class="card-head"><h3>Avisos</h3></div>
        ${avisos.length ? avisos.map(a => `
          <div class="alert-row"><span class="ic" style="background:var(--${a.ic}-soft);color:var(--${a.ic === "gold" ? "gold-deep" : a.ic})">${a.icon}</span>
          <div><b>${a.b}</b><span>${a.s}</span></div>
          <button class="btn xs outline go" data-go="${a.go}">Ver</button></div>`).join("")
        : `<div class="empty" style="padding:18px">${ICON.check}Todo en orden.</div>`}
      </div>
      <div class="card">
        <div class="card-head"><h3>Ocupación · 12 meses</h3></div>
        <div class="chart-box" style="height:190px"><canvas id="chart-occ"></canvas></div>
        <div class="legend"><span><i style="background:var(--gold)"></i>% de noches ocupadas de la cartera</span></div>
      </div>
    </div>
  </div>`;
}
function mountDashboard() {
  if (!DB.props.length) return;
  const mes = mesISO();
  const data = Array.from({ length: 12 }, (_, i) => {
    const m = addMeses(mes, i - 11);
    return [new Date(m + "-15T12:00").toLocaleDateString("es-ES", { month: "short" }), ocupacionMes(m)];
  });
  drawBars("chart-occ", data, { hi: 11 });
}

/* ============================================================
   PROPIEDADES
   ============================================================ */
function coverProp(p, cls = "") {
  return p.foto_path
    ? `<img data-foto="${esc(p.foto_path)}" alt="${esc(p.nombre)}" class="${cls}">`
    : `<div class="${cls}" style="display:flex;align-items:center;justify-content:center;height:100%;color:#b9bfae;background:linear-gradient(140deg,var(--sage-soft),#e3e7db)"><span style="width:44px;height:44px">${ICON.house}</span></div>`;
}
function viewProps() {
  const q = (STATE.propQ || "").toLowerCase();
  const list = DB.props.filter(p => !q || (p.nombre + " " + (p.zona || "") + " " + (O(p.propietario_id)?.nombre || "")).toLowerCase().includes(q));
  const mes = mesISO();
  if (!DB.props.length) return vacio(ICON.house, "Aún no hay propiedades",
    "Da de alta cada inmueble que gestionáis: nombre, zona, propietario, licencia y tarifas. Desde su ficha llevarás el calendario, las limpiezas y los documentos.",
    `<button class="btn primary" onclick="openPropForm()">${ICON.plus} Añadir la primera propiedad</button>`);
  return `
  <div class="toolbar">
    <input class="input" style="min-width:220px" placeholder="Buscar propiedad, zona o propietario…" value="${esc(STATE.propQ || "")}" oninput="STATE.propQ=this.value;rerender(true)">
    <div class="spacer"></div>
    <button class="btn primary sm" onclick="openPropForm()">${ICON.plus} Nueva propiedad</button>
  </div>
  <div class="props-grid">
    ${list.map(p => { const st = statsMesProp(p.id, mes); return `
      <button class="prop-card" data-prop="${p.id}">
        <div class="prop-cover">${coverProp(p)}
          ${p.activa ? "" : `<span class="st"><span class="chip gray">Inactiva</span></span>`}
          <span class="zona">${ICON.pin} ${esc(p.zona || "—")}</span>
        </div>
        <div class="prop-body">
          <h4>${esc(p.nombre)}</h4>
          <div class="prop-meta">
            <span>${ICON.house} ${p.habs || 0} hab · ${p.banos || 0} baños</span>
            ${p.llave ? `<span>${ICON.key} ${esc(p.llave)}</span>` : ""}
          </div>
          ${(p.servicios || []).length ? `<div style="display:flex;gap:5px;flex-wrap:wrap">${p.servicios.slice(0, 3).map(s => `<span class="chip line" style="font-size:10.5px;padding:2.5px 8px">${esc(s)}</span>`).join("")}${p.servicios.length > 3 ? `<span class="chip line" style="font-size:10.5px;padding:2.5px 8px">+${p.servicios.length - 3}</span>` : ""}</div>` : ""}
          <div class="prop-occ"><span>${fmtMes(mes).split(" ")[0]}</span><span class="bar"><i style="width:${Math.min(100, st.ocup)}%"></i></span><b>${st.ocup}%</b></div>
          <div class="prop-next">${ICON.cal} ${st.noches} noches este mes · ${st.limpiezas} limpiezas</div>
        </div>
      </button>`; }).join("")}
  </div>
  ${list.length ? "" : `<div class="empty">${ICON.search}Sin resultados para ese filtro.</div>`}`;
}

/* calendario real de un mes (reservas + servicios programados) · readOnly para el propietario */
function calendarioProp(p, mes, readOnly) {
  const y = +mes.slice(0, 4), m = +mes.slice(5, 7);
  const dias = new Date(y, m, 0).getDate();
  const dow = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const rs = DB.reservas.filter(r => r.propiedad_id === p.id);
  const diasTarea = new Set(DB.tareas.filter(t => t.propiedad_id === p.id && t.fecha.startsWith(mes)).map(t => +t.fecha.slice(8, 10)));
  const ocupado = d => rs.find(r => r.estado === "confirmada" && r.entrada <= d && d < r.salida);
  const bloqueado = d => rs.find(r => r.estado === "bloqueo" && r.entrada <= d && d < r.salida);
  let cells = "";
  for (let i = 0; i < dow; i++) cells += `<div class="cal-day out"></div>`;
  for (let d = 1; d <= dias; d++) {
    const iso = `${mes}-${String(d).padStart(2, "0")}`;
    const r = ocupado(iso), b = bloqueado(iso);
    const esIn = rs.some(x => x.entrada === iso && x.estado === "confirmada");
    const esOut = rs.some(x => x.salida === iso && x.estado === "confirmada");
    cells += `<div class="cal-day ${r ? "busy" : ""} ${b ? "clean" : ""} ${iso === hoyISO() ? "today" : ""} ${esIn ? "in" : ""} ${esOut ? "outday" : ""}"
      ${readOnly ? "" : `onclick="openReservaForm(${p.id},'${iso}')"`} title="${r ? esc(readOnly ? "Reservada" : (r.huesped || "Reservada")) + " · " + r.canal : b ? "Bloqueado" : readOnly ? "Libre" : "Libre · click para reservar"}${diasTarea.has(d) ? " · servicio programado" : ""}">${d}${diasTarea.has(d) ? '<span class="m"></span>' : ""}</div>`;
  }
  return `<div class="cal"><div class="cal-head"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
  <div class="cal-grid">${cells}</div></div>
  <div class="legend" style="margin-top:12px">
    <span><i style="background:var(--gold-soft);border:1px solid var(--gold-line)"></i>Ocupada</span>
    <span><i style="background:#fff;box-shadow:inset 0 0 0 2px var(--blue);border-radius:3px"></i>Entrada</span>
    <span><i style="background:#fff;box-shadow:inset 0 0 0 2px var(--terra);border-radius:3px"></i>Salida</span>
    <span><i style="background:#fff;box-shadow:inset 0 0 0 2px var(--ok);border-radius:3px"></i>Bloqueo propietario</span>
    <span><i style="background:var(--ok)"></i>Servicio programado</span>
  </div>`;
}

function viewPropDetail() {
  const p = P(STATE.prop); if (!p) { STATE.route = "propiedades"; return viewProps(); }
  const esAV = (p.servicios || []).includes("Alquiler vacacional") || DB.reservas.some(r => r.propiedad_id === p.id);
  let tab = STATE.propTab || "resumen";
  if (tab === "calendario" && !esAV) tab = "resumen";
  const mes = STATE.propMes || mesISO();
  const incs = DB.incidencias.filter(i => i.propiedad_id === p.id);
  const st = statsMesProp(p.id, mesISO());
  const o = O(p.propietario_id);
  const tabs = [["resumen", "Resumen"],
    ...(esAV ? [["calendario", "Calendario"]] : []),
    ["seguimiento", "Seguimiento"],
    ["limpiezas", "Servicios"], ["incidencias", `Incidencias (${incs.filter(i => i.estado === "abierta").length})`], ["ficha", "Ficha"], ["docs", "Documentos"]];
  let body = "";
  if (tab === "resumen") {
    const proxima = DB.reservas.filter(r => r.propiedad_id === p.id && r.entrada >= hoyISO() && r.estado === "confirmada").sort((a, b) => a.entrada.localeCompare(b.entrada))[0];
    const tarProx = DB.tareas.filter(t => t.propiedad_id === p.id && t.fecha >= hoyISO() && t.estado !== "hecha").sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
    const horasMes = horasPropMes(p.id, mesISO()), costeMes = costePropMes(p.id, mesISO());
    body = `
    <div class="kpis" style="margin-bottom:16px">
      ${esAV ? `<div class="kpi"><div class="lab">${ICON.cal} Noches este mes</div><div class="val">${st.noches}<small>/${st.dias}</small></div><div class="sub">${st.ocup}% de ocupación</div></div>` : ""}
      <div class="kpi"><div class="lab">${ICON.broom} Servicios hechos</div><div class="val">${tareasPropMes(p.id, mesISO()).length}</div><div class="sub">este mes</div></div>
      <div class="kpi"><div class="lab">${ICON.clock} Horas de trabajo</div><div class="val">${horasMes.toLocaleString("es-ES")}<small>h</small></div><div class="sub">del equipo, este mes</div></div>
      <div class="kpi"><div class="lab">${ICON.euro} Coste de trabajo</div><div class="val">${costeMes ? eur0(costeMes) : "—"}</div><div class="sub">${costeMes ? "horas × tarifa de cada trabajador" : "pon tarifas €/h a los trabajadores"}</div></div>
      ${esAV ? `<div class="kpi"><div class="lab">${ICON.euro} Ingresos por reservas</div><div class="val">${eur0(st.ingresos)}</div><div class="sub">entradas de este mes</div></div>` : ""}
      <div class="kpi"><div class="lab">${ICON.alert} Incidencias abiertas</div><div class="val">${incs.filter(i => i.estado === "abierta").length}</div><div class="sub">${incs.length} en total</div></div>
    </div>
    <div class="grid" style="grid-template-columns:1.4fr 1fr">
      <div class="card"><div class="card-head"><h3>Ocupación · últimos 6 meses</h3></div>
        <div class="chart-box" style="height:180px"><canvas id="chart-prop"></canvas></div></div>
      <div class="card"><div class="card-head"><h3>Próximos movimientos</h3></div>
        <div class="tl">
          ${proxima ? `<div class="tl-item gold"><b>Check-in ${fmtCorto(proxima.entrada)} → ${fmtCorto(proxima.salida)}</b><span>${esc(proxima.huesped || proxima.canal)}</span></div>` : ""}
          ${tarProx ? `<div class="tl-item"><b>${tarProx.tipo === "limpieza" ? "Limpieza" : "Servicio"} · ${fmtCorto(tarProx.fecha)}</b><span>${(tarProx.equipo_ids || []).map(id => S(id)?.nombre.split(" ")[0]).join(", ") || "sin asignar"}</span></div>` : ""}
          ${!proxima && !tarProx ? `<div class="hint">Nada programado. Añade reservas en el calendario o servicios en Planificación.</div>` : ""}
        </div></div>
    </div>`;
  }
  if (tab === "calendario") body = `
    <div class="card"><div class="card-head"><h3>Reservas</h3>
      <div class="right"><span class="month-nav">
        <button onclick="STATE.propMes='${addMeses(mes, -1)}';rerender()">${ICON.left}</button><b>${fmtMes(mes)}</b>
        <button onclick="STATE.propMes='${addMeses(mes, 1)}';rerender()">${ICON.right}</button></span>
        <button class="btn sm primary" onclick="openReservaForm(${p.id})">${ICON.plus} Nueva reserva</button></div></div>
      ${calendarioProp(p, mes)}
      <div style="margin-top:18px">
        ${DB.reservas.filter(r => r.propiedad_id === p.id && (r.entrada.startsWith(mes) || r.salida.startsWith(mes))).sort((a, b) => a.entrada.localeCompare(b.entrada)).map(r => `
          <div class="set-row"><div class="tx"><b>${fmtCorto(r.entrada)} → ${fmtCorto(r.salida)} ${r.estado === "bloqueo" ? "· BLOQUEO" : ""}</b>
            <span>${esc(r.huesped || "—")} · ${r.canal}${r.plazas ? " · " + r.plazas + " plazas" : ""}${r.importe ? " · " + eur(r.importe) : ""}</span></div>
            <div class="end"><button class="btn xs outline" onclick="delReserva(${r.id})">${ICON.trash}</button></div></div>`).join("")
        || `<p class="hint">Sin reservas este mes. Toca un día libre del calendario para crear una.</p>`}
      </div>
    </div>`;
  if (tab === "seguimiento") {
    const compras = DB.compras.filter(c => c.propiedad_id === p.id);
    const fotosEstado = DB.tareas.filter(t => t.propiedad_id === p.id && (t.fotos || []).length)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .flatMap(t => t.fotos.map(f => ({ f, fecha: t.fecha, quien: (t.equipo_ids || []).map(id => S(id)?.nombre.split(" ")[0]).filter(Boolean).join(", ") })))
      .slice(0, 24);
    const notas = DB.tareas.filter(t => t.propiedad_id === p.id && t.notas_equipo)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 6);
    body = `
    <div class="grid" style="grid-template-columns:1.3fr 1fr">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card"><div class="card-head"><h3>Fotos del estado de la vivienda</h3><span class="sub">las sube el equipo al trabajar; las más recientes primero</span></div>
          ${fotosEstado.length ? `<div class="galeria">${fotosEstado.map(x => `
            <a href="#" onclick="event.preventDefault();abrirDoc('${esc(x.f)}')" title="${fmtCorto(x.fecha)}${x.quien ? " · " + esc(x.quien) : ""}"><img data-foto="${esc(x.f)}" alt="estado"></a>`).join("")}</div>`
          : `<div class="empty">${ICON.camera}Aún no hay fotos. El equipo las adjunta al finalizar cada servicio.</div>`}
        </div>
        <div class="card"><div class="card-head"><h3>Observaciones del equipo</h3></div>
          ${notas.length ? `<div class="tl">${notas.map(t => `<div class="tl-item"><b>«${esc(t.notas_equipo)}»</b>
            <span>${fmtCorto(t.fecha)} · ${(t.equipo_ids || []).map(id => S(id)?.nombre.split(" ")[0]).filter(Boolean).join(", ") || "equipo"}</span></div>`).join("")}</div>`
          : `<p class="hint">Sin observaciones todavía.</p>`}
        </div>
      </div>
      <div class="card"><div class="card-head"><h3>Lista de compras y materiales</h3><span class="sub">el equipo añade lo que falta; márcalo al comprarlo</span></div>
        <div style="display:flex;gap:8px;margin-bottom:14px">
          <input class="input" id="compra-nueva" placeholder="Ej. 2 bombillas E27, gel de baño…" style="flex:1" onkeydown="if(event.key==='Enter')crearCompraUI(${p.id})">
          <button class="btn sm sage" onclick="crearCompraUI(${p.id})">${ICON.plus} Añadir</button>
        </div>
        ${compras.length ? compras.map(c => `
          <div class="set-row"><button class="check-item" style="width:auto;padding:6px;background:none;border:none" onclick="marcarCompraUI(${c.id},${c.estado !== "comprado"})">
            <span class="bx" style="${c.estado === "comprado" ? "background:var(--ok);border-color:var(--ok);color:#fff" : ""}">${ICON.check}</span></button>
          <div class="tx"><b style="${c.estado === "comprado" ? "text-decoration:line-through;opacity:.6" : ""}">${esc(c.texto)}</b>
            <span>${esc(c.creado_por || "")} · ${fmtCorto(c.created_at.slice(0, 10))}${c.estado === "comprado" ? " · comprado" : ""}</span></div>
          <div class="end">${rolDireccion() ? `<button class="btn xs outline" onclick="borrarCompraUI(${c.id})">${ICON.x}</button>` : ""}</div></div>`).join("")
        : `<p class="hint">Nada pendiente de comprar.</p>`}
      </div>
    </div>`;
  }
  if (tab === "limpiezas") {
    const ts = DB.tareas.filter(t => t.propiedad_id === p.id).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 30);
    body = ts.length ? `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Fecha</th><th>Tipo</th><th>Equipo</th><th>Horario</th><th>Checklist</th><th>Estado</th></tr></thead>
      <tbody>${ts.map(t => `<tr><td><b>${fmtCorto(t.fecha)}</b></td><td>${t.tipo}</td>
        <td>${(t.equipo_ids || []).map(id => S(id)?.nombre).filter(Boolean).join(", ") || "—"}</td>
        <td>${(t.hora_inicio || "").slice(0, 5)}${t.hora_fin ? "–" + t.hora_fin.slice(0, 5) : ""}</td>
        <td>${t.checklist?.length ? t.checklist.filter(c => c.ok).length + "/" + t.checklist.length : "—"}</td>
        <td>${t.estado === "hecha" ? '<span class="chip ok">Hecha</span>' : t.estado === "encurso" ? '<span class="chip blue"><i class="d"></i>En curso</span>' : '<span class="chip line">Pendiente</span>'}</td></tr>`).join("")}
      </tbody></table></div>`
    : `<div class="empty">${ICON.broom}Aún no hay servicios en esta propiedad. Créalos desde Planificación.</div>`;
  }
  if (tab === "incidencias") body = incs.length
    ? `<div class="toolbar"><div class="spacer"></div><button class="btn sm primary" onclick="openNuevaIncidencia(${p.id})">${ICON.plus} Nueva incidencia</button></div>
       <div class="inc-grid">${incs.map(incCardHTML).join("")}</div>`
    : `${vacio(ICON.check, "Sin incidencias", "Cuando el equipo reporte algo de esta propiedad aparecerá aquí.",
        `<button class="btn outline" onclick="openNuevaIncidencia(${p.id})">${ICON.plus} Reportar una</button>`)}`;
  if (tab === "ficha") body = `
    <div class="grid" style="grid-template-columns:1.3fr 1fr">
      <div class="card"><div class="card-head"><h3>Ficha</h3>
        <div class="right"><button class="btn sm outline" onclick="openPropForm(${p.id})">${ICON.edit} Editar</button></div></div>
        <div class="facts">
          <div class="fact"><div class="k">Propietario</div><div class="v">${esc(o?.nombre || "Sin asignar")}</div></div>
          <div class="fact"><div class="k">Licencia</div><div class="v">${esc(p.licencia || "—")}</div></div>
          <div class="fact"><div class="k">Llaves</div><div class="v">${esc(p.llave || "—")}</div></div>
          <div class="fact"><div class="k">Capacidad</div><div class="v">${p.plazas || "—"} plazas</div></div>
          <div class="fact"><div class="k">Distribución</div><div class="v">${p.habs || 0} hab · ${p.banos || 0} baños</div></div>
          <div class="fact"><div class="k">Piscina</div><div class="v">${p.piscina ? "Sí" : "No"}</div></div>
          <div class="fact" style="grid-column:1/-1"><div class="k">Servicios contratados</div><div class="v">${(p.servicios || []).join(" · ") || "Sin definir"}</div></div>
          <div class="fact"><div class="k">Canales</div><div class="v">${(p.canales || []).join(" + ") || "—"}</div></div>
          <div class="fact"><div class="k">Dirección</div><div class="v">${esc(p.direccion || "—")}</div></div>
        </div>
        ${p.notas ? `<p class="hint" style="margin-top:12px">${esc(p.notas)}</p>` : ""}</div>
      <div class="card"><div class="card-head"><h3>Tarifas internas</h3><span class="sub">solo las ve dirección · alimentan las facturas</span></div>
        <div class="facts" style="grid-template-columns:1fr 1fr">
          <div class="fact"><div class="k">Gestión mensual</div><div class="v">${eur(p.tarifa_gestion)}</div></div>
          <div class="fact"><div class="k">Por limpieza</div><div class="v">${eur(p.tarifa_limpieza)}</div></div>
          <div class="fact"><div class="k">Dotación de ropa</div><div class="v">${p.dotacion_ropa || 0} juegos</div></div>
          <div class="fact"><div class="k">Estado</div><div class="v">${p.activa ? "Activa" : "Inactiva"}</div></div>
        </div></div>
    </div>`;
  if (tab === "docs") body = `
    <div class="card"><div class="card-head"><h3>Documentos</h3><span class="sub">contrato, licencia, inventario… quedan guardados en la nube</span>
      <div class="right"><label class="file-btn">${ICON.plus} Subir documento<input type="file" onchange="subirDoc('documentos/${p.id}', this)"></label></div></div>
      <div id="docs-list"><div class="lds"></div></div>
    </div>`;
  return `
  <button class="btn sm outline" style="margin-bottom:14px" data-go="propiedades">${ICON.back} Propiedades</button>
  <div class="prop-hero">
    ${coverProp(p)}
    <div class="inner">
      <div><h2>${esc(p.nombre)}</h2><div class="loc">${ICON.pin} ${esc(p.zona || "")} ${p.tipo ? "· " + esc(p.tipo) : ""} ${p.licencia ? "· " + esc(p.licencia) : ""}</div>
        ${(p.servicios || []).length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${p.servicios.map(s => `<span class="chip" style="background:rgba(255,255,255,.16);color:#f5f3ea;backdrop-filter:blur(4px)">${esc(s)}</span>`).join("")}</div>` : ""}</div>
      <div class="right">
        ${o?.email ? `<a class="btn sm primary" href="mailto:${esc(o.email)}?subject=${encodeURIComponent(p.nombre + " · Hygge Services")}">${ICON.send} Escribir al propietario</a>` : ""}
      </div>
    </div>
  </div>
  <div class="tabs">${tabs.map(t => `<button class="tab ${tab === t[0] ? "on" : ""}" onclick="STATE.propTab='${t[0]}';rerender()">${t[1]}</button>`).join("")}</div>
  ${body}`;
}
function mountPropDetail() {
  const p = P(STATE.prop); if (!p) return;
  if ((STATE.propTab || "resumen") === "resumen") {
    const data = Array.from({ length: 6 }, (_, i) => {
      const m = addMeses(mesISO(), i - 5);
      return [new Date(m + "-15T12:00").toLocaleDateString("es-ES", { month: "short" }), statsMesProp(p.id, m).ocup];
    });
    drawBars("chart-prop", data, { hi: 5 });
  }
  if (STATE.propTab === "docs") cargarDocs(`documentos/${p.id}`);
  resolverFotos();
}

/* ============================================================
   EQUIPO EN VIVO
   ============================================================ */
function viewEquipo() {
  const activos = DB.emp.filter(e => e.activo);
  if (!activos.length) return vacio(ICON.users, "Da de alta a tu equipo",
    "Crea la ficha de cada persona (limpieza, mantenimiento, lavandería…). Cada una recibirá un código con el que crear su cuenta en este portal para fichar, ver sus tareas y reportar incidencias.",
    `<button class="btn primary" onclick="openEmpForm()">${ICON.plus} Añadir persona</button>`);
  const grupos = [
    ["Limpiando ahora", "#4f8a5c", ["limpiando"]], ["En servicio", "#b5533c", ["mantenimiento"]],
    ["De turno", "#4a7fa5", ["turno"]], ["Descanso", "#c79c3d", ["descanso"]], ["Fuera de turno", "#8b8f84", ["libre"]],
  ];
  const conEstado = activos.map(e => ({ e, st: estadoEmpleado(e) }));
  const fichados = conEstado.filter(x => x.st.key !== "libre");
  return `
  <div class="live-grid">
    <div class="card map-card tight">
      <div class="map-real-wrap">
        <div id="mapa-real" aria-label="Mapa de Mallorca con el equipo en tiempo real"></div>
        <div class="map-acciones">
          <button onclick="mapaVista('equipo')" title="Encuadrar al equipo fichado">${ICON.users} Equipo</button>
          <button onclick="mapaVista('isla')" title="Ver Mallorca entera">${ICON.pin} Mallorca</button>
        </div>
        <div class="map-legend">
          <span><i style="background:#4f8a5c"></i>Limpiando</span><span><i style="background:#b5533c"></i>Servicio</span>
          <span><i style="background:#4a7fa5"></i>De turno</span><span><i style="background:#c79c3d"></i>Descanso</span>
          <span><i style="background:#fff;border:1.5px solid var(--gold);border-radius:3px"></i>Propiedad</span>
        </div>
      </div>
    </div>
    <div>
      <div class="kpis" style="grid-template-columns:1fr 1fr;margin-bottom:14px">
        <div class="kpi"><div class="lab">${ICON.users} De turno</div><div class="val">${fichados.length}<small>/${activos.length}</small></div><div class="sub">con fichaje abierto</div></div>
        <div class="kpi"><div class="lab">${ICON.clock} Fichajes hoy</div><div class="val">${DB.fichajes.filter(f => f.fecha === hoyISO()).length}</div><div class="sub">con hora y ubicación</div></div>
      </div>
      <div class="toolbar" style="margin-bottom:10px"><div class="spacer"></div>
        <button class="btn sm primary" onclick="openEmpForm()">${ICON.plus} Añadir persona</button></div>
      <div class="team-list">
        ${grupos.map(([t, col, keys]) => {
          const gente = conEstado.filter(x => keys.includes(x.st.key));
          if (!gente.length) return "";
          return `<div class="team-block"><h4><i style="background:${col}"></i>${t} · ${gente.length}</h4>
            ${gente.map(({ e, st }) => `
              <button class="emp-row" data-emp="${e.id}">
                ${ava(e)}
                <div><div class="nm">${esc(e.nombre)}</div>
                <div class="st">${esc(e.rol_laboral)}${st.prop ? " · " + esc(st.prop.nombre) : ""}</div></div>
                <div class="end">${st.desde ? "desde " + st.desde : ""}</div>
              </button>`).join("")}</div>`;
        }).join("")}
      </div>
    </div>
  </div>`;
}
function drawerEmpleado(e) {
  const st = estadoEmpleado(e);
  const f = DB.fichajes.filter(x => x.empleado_id === e.id && x.fecha === hoyISO());
  const iniSemana = addDias(hoyISO(), -((new Date().getDay() + 6) % 7));
  const hSem = horasEmpleadoRango(e.id, iniSemana, hoyISO());
  const hMes = horasEmpleadoRango(e.id, mesISO() + "-01", hoyISO());
  const tHoy = DB.tareas.filter(t => t.fecha === hoyISO() && (t.equipo_ids || []).includes(e.id));
  const tieneCuenta = !DB.pendientes.some(x => x.empleado_id === e.id); // aproximación: si hay perfil vinculado no sale en pendientes
  return `
  <div class="drawer-head">
    ${ava(e)} <div><b style="font-size:16px">${esc(e.nombre)}</b>
    <div class="hint">${esc(e.rol_laboral)} · contrato ${e.contrato_horas} h/semana</div></div>
    <button class="x" onclick="closeDrawer()">${ICON.x}</button>
  </div>
  <div class="drawer-body">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${chipEstado(e)}
      ${e.telefono ? `<a class="chip line" href="tel:${esc(e.telefono.replace(/ /g, ""))}">${esc(e.telefono)}</a>` : ""}
      ${e.activo ? "" : '<span class="chip gray">Inactivo</span>'}
    </div>
    <div class="facts" style="grid-template-columns:1fr 1fr;margin-bottom:18px">
      <div class="fact"><div class="k">Hoy fichó</div><div class="v">${f.length ? fmtHora(f[0].entrada) : "—"}</div></div>
      <div class="fact"><div class="k">Horas hoy</div><div class="v">${f.length ? msAHoras(f.reduce((a, x) => a + horasDeFichaje(x), 0)) + " h" : "—"}</div></div>
      <div class="fact"><div class="k">Esta semana</div><div class="v">${hSem} h</div></div>
      <div class="fact"><div class="k">Este mes</div><div class="v">${hMes} h</div></div>
    </div>
    ${e.codigo_acceso ? `
      <div style="margin-bottom:18px">
        <h4 style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:8px">Código de acceso a la app</h4>
        <button class="code-chip" onclick="copiar('${esc(e.codigo_acceso)}')">${esc(e.codigo_acceso)} ${ICON.copy}</button>
        <p class="hint" style="margin-top:8px">Con este código ${esc(e.nombre.split(" ")[0])} crea su cuenta en la pantalla de acceso (pestaña «Crear cuenta»). Solo funciona una vez.</p>
      </div>` : ""}
    <h4 style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:12px">Tareas de hoy</h4>
    ${tHoy.length ? `<div class="tl">${tHoy.map(t => `
      <div class="tl-item ${t.estado === "hecha" ? "" : t.estado === "encurso" ? "gold" : ""}">
        <b>${t.tipo === "limpieza" ? "Limpieza" : "Servicio"} · ${esc(P(t.propiedad_id)?.nombre || "")}</b>
        <span>${(t.hora_inicio || "").slice(0, 5)} · ${t.estado}</span></div>`).join("")}</div>`
    : `<p class="hint">Sin tareas asignadas hoy.</p>`}
    <div style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap">
      <button class="btn sm primary" onclick="closeDrawer();STATE.trab=${e.id};STATE.trabTab='resumen';go('trabajadordetail')">${ICON.id} Ficha completa</button>
      <button class="btn sm outline" data-go="fichajes">${ICON.clock} Fichajes</button>
    </div>
  </div>`;
}

/* ============================================================
   TRABAJADORES (negocio: lista + ficha completa)
   ============================================================ */
function viewTrabajadores() {
  if (!DB.emp.length) return vacio(ICON.id, "Aún no hay trabajadores",
    "Da de alta a cada persona con sus datos de contrato. Tendrás su ficha completa: horas, fichajes, documentos y su factura o recibo mensual.",
    `<button class="btn primary" onclick="openEmpForm()">${ICON.plus} Añadir trabajador</button>`);
  const mes = mesISO(), ini = mes + "-01";
  const horasMes = e => horasEmpleadoRango(e.id, ini, hoyISO());
  const activos = DB.emp.filter(e => e.activo);
  const costeMes = DB.emp.reduce((a, e) => a + horasMes(e) * (+ED(e.id).tarifa_hora || 0), 0);
  return `
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.users} En plantilla</div><div class="val">${activos.length}</div><div class="sub">${DB.emp.length - activos.length ? (DB.emp.length - activos.length) + " de baja" : "todos activos"}</div></div>
    <div class="kpi"><div class="lab">${ICON.id} Autónomos</div><div class="val">${DB.empDatos.filter(d => d.tipo_relacion === "autonomo").length}</div><div class="sub">facturan por horas</div></div>
    <div class="kpi"><div class="lab">${ICON.clock} Horas del equipo · mes</div><div class="val">${DB.emp.reduce((a, e) => a + horasMes(e), 0).toLocaleString("es-ES")}<small>h</small></div><div class="sub">fichadas hasta hoy</div></div>
    <div class="kpi"><div class="lab">${ICON.euro} Coste por horas · mes</div><div class="val">${eur0(costeMes)}</div><div class="sub">según tarifa €/h de cada ficha</div></div>
  </div>
  <div class="toolbar">
    <span class="hint">Toca a una persona para abrir su ficha completa: contrato, documentos, actividad y su factura mensual.</span>
    <div class="spacer"></div>
    <button class="btn primary sm" onclick="openEmpForm()">${ICON.plus} Añadir trabajador</button>
  </div>
  <div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Trabajador</th><th>Puesto</th><th>Relación</th><th class="num">Horas mes</th><th class="num">Tarifa</th><th>Ausencias 90 d</th><th>Estado</th><th></th></tr></thead>
    <tbody>${DB.emp.map(e => { const d = ED(e.id);
      const inj = ausenciasDe(e.id, addDias(hoyISO(), -90)).filter(a => a.tipo === "injustificada").length;
      const pend = diasSinFichar(e.id).length;
      return `
      <tr data-trab="${e.id}" style="cursor:pointer">
        <td><span class="who">${ava(e)} ${esc(e.nombre)}</span></td>
        <td>${esc(e.rol_laboral)}</td>
        <td>${d.tipo_relacion === "autonomo" ? '<span class="chip gold">Autónomo</span>' : '<span class="chip sage">Contrato</span>'}</td>
        <td class="num"><b>${horasMes(e).toLocaleString("es-ES")} h</b></td>
        <td class="num">${+d.tarifa_hora ? eur(d.tarifa_hora) + "/h" : "—"}</td>
        <td>${inj ? `<span class="chip terra"><i class="d"></i>${inj} sin justificar</span>` : pend ? `<span class="chip gold"><i class="d"></i>${pend} por revisar</span>` : '<span class="chip ok">Al día</span>'}</td>
        <td>${e.activo ? '<span class="chip ok">Activo</span>' : '<span class="chip gray">De baja</span>'}</td>
        <td class="num" style="white-space:nowrap">
          <button class="btn xs outline" onclick="event.stopPropagation();bajaTrabajador(${e.id})">${e.activo ? "Dar de baja" : "Reactivar"}</button>
          <button class="btn xs outline" style="color:var(--terra)" onclick="event.stopPropagation();eliminarTrabajador(${e.id})">${ICON.trash}</button>
        </td>
      </tr>`; }).join("")}
    </tbody></table></div>`;
}

function viewTrabajadorDetail() {
  const e = S(STATE.trab); if (!e) { STATE.route = "trabajadores"; return viewTrabajadores(); }
  const d = ED(e.id);
  const tab = STATE.trabTab || "resumen";
  const mes = STATE.trabMes || mesISO(), ini = mes + "-01", fin = addDias(addMeses(mes, 1) + "-01", -1);
  const iniSemana = addDias(hoyISO(), -((new Date().getDay() + 6) % 7));
  const horasMes = horasEmpleadoRango(e.id, ini, fin);
  const tieneCuenta = !e.codigo_acceso ? true : false;
  const injTrab = ausenciasDe(e.id, addDias(hoyISO(), -90)).filter(a => a.tipo === "injustificada").length;
  const pendTrab = diasSinFichar(e.id).length;
  const tabs = [["resumen", "Resumen"], ["horario", "Horario"], ["actividad", "Actividad"],
    ["asistencia", `Asistencia${injTrab + pendTrab ? ` (${injTrab + pendTrab})` : ""}`],
    ["ficha", "Ficha y contrato"], ["docs", "Documentos"], ["factura", "Factura mensual"]];
  let body = "";
  if (tab === "horario") body = `
    <div class="toolbar">
      <span class="hint">Sus próximas 3 semanas — exactamente lo que ${e.nombre.split(" ")[0]} ve en su app en «Mi horario».</span>
      <div class="spacer"></div>
      <button class="btn sm outline" onclick="exportHorarioCSV(${e.id})">${ICON.down} Excel</button>
      <button class="btn sm outline" onclick="openPaperHorario(${e.id})">${ICON.print} PDF</button>
    </div>
    ${mhSemanasHTML(e.id)}`;
  if (tab === "asistencia") {
    const aus = ausenciasDe(e.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const inj90 = ausenciasDe(e.id, addDias(hoyISO(), -90)).filter(a => a.tipo === "injustificada");
    const just90 = ausenciasDe(e.id, addDias(hoyISO(), -90)).filter(a => a.tipo === "justificada");
    const diasTrab90 = new Set(DB.fichajes.filter(f => f.empleado_id === e.id && f.fecha >= addDias(hoyISO(), -90)).map(f => f.fecha)).size;
    const tasa = diasTrab90 + inj90.length + just90.length ? Math.round(inj90.length / (diasTrab90 + inj90.length + just90.length) * 100) : 0;
    const pendientes = diasSinFichar(e.id);
    body = `
    <div class="kpis" style="margin-bottom:16px">
      <div class="kpi"><div class="lab">${ICON.alert} Sin justificar · 90 d</div><div class="val" style="${inj90.length ? "color:var(--terra)" : ""}">${inj90.length}</div><div class="sub">${inj90.length ? "requiere atención" : "ninguna"}</div></div>
      <div class="kpi"><div class="lab">${ICON.doc} Justificadas · 90 d</div><div class="val">${just90.length}</div><div class="sub">con motivo o justificante</div></div>
      <div class="kpi"><div class="lab">${ICON.chart} Tasa de absentismo</div><div class="val">${tasa}<small>%</small></div><div class="sub">injustificadas / días esperados</div></div>
      <div class="kpi"><div class="lab">${ICON.check} Días trabajados · 90 d</div><div class="val">${diasTrab90}</div><div class="sub">con fichaje</div></div>
    </div>
    ${pendientes.length ? `
    <div class="legal-note" style="border-color:var(--gold-line);background:var(--gold-soft)">${ICON.alert}
      <div><b>${pendientes.length} día${pendientes.length > 1 ? "s" : ""} con trabajo asignado y sin fichaje</b> — revisa y regístralo como ausencia:
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${pendientes.slice(0, 8).map(d => `
        <button class="btn xs outline" style="background:#fff" onclick="openAusenciaForm(${e.id},'${d}','auto')">${fmtCorto(d)}</button>`).join("")}${pendientes.length > 8 ? `<span class="hint">+${pendientes.length - 8} más</span>` : ""}</div></div>
    </div>` : ""}
    <div class="card">
      <div class="card-head"><h3>Registro de ausencias</h3>
        <div class="right"><button class="btn sm primary" onclick="openAusenciaForm(${e.id})">${ICON.plus} Registrar ausencia</button></div></div>
      ${aus.length ? `<div class="tbl-wrap" style="border:none;box-shadow:none"><table class="tbl">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Motivo</th><th>Origen</th><th>Justificante</th><th></th></tr></thead>
        <tbody>${aus.map(a => `
          <tr><td><b>${fmtCorto(a.fecha)} ${a.fecha.slice(0, 4)}</b></td>
          <td>${a.tipo === "injustificada" ? '<span class="chip terra"><i class="d"></i>Sin justificar</span>' : '<span class="chip ok">Justificada</span>'}</td>
          <td>${esc(a.motivo || "—")}</td>
          <td><span class="chip line">${a.origen === "auto" ? "Detectada" : "Manual"}</span></td>
          <td>${a.justificante_path ? `<button class="btn xs outline" onclick="abrirDoc('${esc(a.justificante_path)}')">${ICON.eye} Ver</button>` : "—"}</td>
          <td class="num" style="white-space:nowrap">
            ${a.tipo === "injustificada" ? `<button class="btn xs sage" onclick="openJustificarForm(${a.id})">${ICON.check} Justificar</button>` : ""}
            <button class="btn xs outline" onclick="borrarAusenciaUI(${a.id})">${ICON.trash}</button></td></tr>`).join("")}
        </tbody></table></div>`
      : `<div class="empty">${ICON.check}Sin ausencias registradas. Los días con trabajo asignado y sin fichaje aparecerán arriba para revisar.</div>`}
    </div>`;
  }
  if (tab === "resumen") {
    const proximas = DB.tareas.filter(t => t.fecha >= hoyISO() && (t.equipo_ids || []).includes(e.id) && t.estado !== "hecha")
      .sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 5);
    body = `
    <div class="kpis" style="margin-bottom:16px">
      <div class="kpi"><div class="lab">${ICON.clock} Hoy</div><div class="val">${horasEmpleadoRango(e.id, hoyISO(), hoyISO()).toLocaleString("es-ES")}<small>h</small></div><div class="sub">${fichajeAbierto(e.id) ? "jornada abierta" : "sin jornada abierta"}</div></div>
      <div class="kpi"><div class="lab">${ICON.cal} Esta semana</div><div class="val">${horasEmpleadoRango(e.id, iniSemana, hoyISO()).toLocaleString("es-ES")}<small>h</small></div><div class="sub">contrato: ${e.contrato_horas} h/semana</div></div>
      <div class="kpi"><div class="lab">${ICON.chart} Este mes</div><div class="val">${horasEmpleadoRango(e.id, mesISO() + "-01", hoyISO()).toLocaleString("es-ES")}<small>h</small></div><div class="sub">pausas descontadas</div></div>
      <div class="kpi"><div class="lab">${ICON.broom} Servicios mes</div><div class="val">${DB.tareas.filter(t => t.estado === "hecha" && t.fecha.startsWith(mesISO()) && (t.equipo_ids || []).includes(e.id)).length}</div><div class="sub">completados</div></div>
    </div>
    <div class="grid" style="grid-template-columns:1.4fr 1fr">
      <div class="card"><div class="card-head"><h3>Horas · últimos 6 meses</h3></div>
        <div class="chart-box" style="height:180px"><canvas id="chart-trab"></canvas></div></div>
      <div class="card"><div class="card-head"><h3>Próximos servicios</h3></div>
        ${proximas.length ? `<div class="tl">${proximas.map(t => `
          <div class="tl-item"><b>${t.tipo === "limpieza" ? "Limpieza" : "Servicio"} · ${esc(P(t.propiedad_id)?.nombre || "")}</b>
          <span>${fmtCorto(t.fecha)} · ${(t.hora_inicio || "").slice(0, 5)}</span></div>`).join("")}</div>`
        : `<p class="hint">Nada asignado próximamente.</p>`}</div>
    </div>`;
  }
  if (tab === "actividad") {
    const fichs = DB.fichajes.filter(f => f.empleado_id === e.id).sort((a, b) => b.entrada.localeCompare(a.entrada)).slice(0, 15);
    const tars = DB.tareas.filter(t => (t.equipo_ids || []).includes(e.id)).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 12);
    body = `
    <div class="grid" style="grid-template-columns:1.2fr 1fr">
      <div class="card tight"><div class="card-head" style="padding:16px 18px 0"><h3>Fichajes recientes</h3></div>
        ${fichs.length ? `<div class="tbl-wrap" style="border:none;box-shadow:none"><table class="tbl">
          <thead><tr><th>Día</th><th>Entrada</th><th>Salida</th><th>GPS</th><th class="num">Horas</th></tr></thead>
          <tbody>${fichs.map(f => `<tr><td><b>${fmtCorto(f.fecha)}</b></td><td>${fmtHora(f.entrada)}</td>
            <td>${f.salida ? fmtHora(f.salida) : '<span class="chip blue"><i class="d"></i>abierta</span>'}</td>
            <td>${f.lat ? `<a class="chip line" target="_blank" rel="noopener" href="https://maps.google.com/?q=${f.lat},${f.lng}">${ICON.pin} mapa</a>` : "—"}</td>
            <td class="num"><b>${msAHoras(horasDeFichaje(f))} h</b></td></tr>`).join("")}</tbody></table></div>`
        : `<div class="empty">${ICON.clock}Aún sin fichajes.</div>`}</div>
      <div class="card tight"><div class="card-head" style="padding:16px 18px 0"><h3>Servicios realizados</h3></div>
        ${tars.length ? `<div class="tbl-wrap" style="border:none;box-shadow:none"><table class="tbl" style="min-width:0">
          <thead><tr><th>Día</th><th>Propiedad</th><th>Estado</th></tr></thead>
          <tbody>${tars.map(t => `<tr><td><b>${fmtCorto(t.fecha)}</b></td><td>${esc(P(t.propiedad_id)?.nombre || "")}</td>
            <td>${t.estado === "hecha" ? '<span class="chip ok">Hecha</span>' : t.estado === "encurso" ? '<span class="chip blue"><i class="d"></i>En curso</span>' : '<span class="chip line">Pendiente</span>'}</td></tr>`).join("")}</tbody></table></div>`
        : `<div class="empty">${ICON.broom}Sin servicios asignados todavía.</div>`}</div>
    </div>`;
  }
  if (tab === "ficha") body = `
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="card"><div class="card-head"><h3>Datos laborales</h3>
        <div class="right"><button class="btn sm outline" onclick="openEmpForm(${e.id})">${ICON.edit} Editar</button></div></div>
        <div class="facts" style="grid-template-columns:1fr 1fr">
          <div class="fact"><div class="k">Puesto</div><div class="v">${esc(e.rol_laboral)}</div></div>
          <div class="fact"><div class="k">Relación</div><div class="v">${d.tipo_relacion === "autonomo" ? "Autónomo/a" : "Contrato laboral"}</div></div>
          <div class="fact"><div class="k">Jornada</div><div class="v">${e.contrato_horas} h/semana</div></div>
          <div class="fact"><div class="k">Fecha de alta</div><div class="v">${d.fecha_alta ? fmtCorto(d.fecha_alta) + " " + d.fecha_alta.slice(0, 4) : "—"}</div></div>
          <div class="fact"><div class="k">Tarifa</div><div class="v">${+d.tarifa_hora ? eur(d.tarifa_hora) + " /h" : "—"}</div></div>
          <div class="fact"><div class="k">Estado</div><div class="v">${e.activo ? "Activo" : "De baja"}</div></div>
        </div>
        ${d.notas ? `<p class="hint" style="margin-top:12px">${esc(d.notas)}</p>` : ""}</div>
      <div class="card"><div class="card-head"><h3>Datos personales</h3><span class="sub">solo visibles para dirección</span></div>
        <div class="facts" style="grid-template-columns:1fr 1fr">
          <div class="fact"><div class="k">DNI / NIE</div><div class="v">${esc(d.dni || "—")}</div></div>
          <div class="fact"><div class="k">Nº Seg. Social</div><div class="v">${esc(d.nass || "—")}</div></div>
          <div class="fact"><div class="k">Teléfono</div><div class="v">${esc(e.telefono || "—")}</div></div>
          <div class="fact"><div class="k">Email</div><div class="v">${esc(d.email || "—")}</div></div>
          <div class="fact" style="grid-column:1/-1"><div class="k">Dirección</div><div class="v">${esc(d.direccion || "—")}</div></div>
          <div class="fact" style="grid-column:1/-1"><div class="k">IBAN</div><div class="v">${esc(d.iban || "—")}</div></div>
        </div>
        ${e.codigo_acceso ? `<div style="margin-top:14px"><span class="hint">Código de acceso a la app (un solo uso): </span>
          <button class="code-chip" onclick="copiar('${esc(e.codigo_acceso)}')">${esc(e.codigo_acceso)} ${ICON.copy}</button></div>` : `<p class="hint" style="margin-top:14px">${ICON.check} Ya tiene cuenta en la app.</p>`}
      </div>
    </div>`;
  if (tab === "docs") body = `
    <div class="card"><div class="card-head"><h3>Documentos del trabajador</h3><span class="sub">contrato firmado, DNI, PRL, certificados… solo los ve dirección</span>
      <div class="right"><label class="file-btn">${ICON.plus} Subir documento<input type="file" onchange="subirDoc('empleados/${e.id}', this)"></label></div></div>
      <div id="docs-list"><div class="lds"></div></div>
    </div>`;
  if (tab === "factura") {
    const servicios = DB.tareas.filter(t => t.estado === "hecha" && t.fecha >= ini && t.fecha <= fin && (t.equipo_ids || []).includes(e.id)).length;
    const dias = new Set(DB.fichajes.filter(f => f.empleado_id === e.id && f.fecha >= ini && f.fecha <= fin).map(f => f.fecha)).size;
    const total = horasMes * (+d.tarifa_hora || 0);
    body = `
    <div class="card">
      <div class="card-head"><h3>${d.tipo_relacion === "autonomo" ? "Factura mensual del autónomo" : "Recibo mensual de horas (para nómina)"}</h3>
        <div class="right"><span class="month-nav">
          <button onclick="STATE.trabMes='${addMeses(mes, -1)}';rerender()">${ICON.left}</button><b>${fmtMes(mes)}</b>
          <button onclick="STATE.trabMes='${addMeses(mes, 1)}';rerender()">${ICON.right}</button></span></div></div>
      <div class="facts" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
        <div class="fact"><div class="k">Días trabajados</div><div class="v">${dias}</div></div>
        <div class="fact"><div class="k">Horas fichadas</div><div class="v">${horasMes.toLocaleString("es-ES")} h</div></div>
        <div class="fact"><div class="k">Servicios hechos</div><div class="v">${servicios}</div></div>
        <div class="fact"><div class="k">Importe (${+d.tarifa_hora ? eur(d.tarifa_hora) + "/h" : "sin tarifa"})</div><div class="v">${+d.tarifa_hora ? eur(total) : "—"}</div></div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn primary" onclick="openPaperTrabajador(${e.id},'${mes}')">${ICON.doc} Generar documento</button>
        ${!+d.tarifa_hora ? `<span class="hint" style="align-self:center">Ponle tarifa €/h en «Editar ficha» para que calcule el importe.</span>` : ""}
      </div>
      <p class="form-note">${d.tipo_relacion === "autonomo"
        ? "Se genera la factura del mes con sus datos fiscales (DNI, dirección, IBAN) y las horas fichadas: lista para que la firme/numere y os la entregue."
        : "Se genera el recibo de horas del mes (días, horas netas con pausas descontadas e importe si hay tarifa), listo para la gestoría y la nómina."}</p>
    </div>`;
  }
  return `
  <button class="btn sm outline" style="margin-bottom:14px" data-go="trabajadores">${ICON.back} Trabajadores</button>
  <div class="card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
    ${ava(e, "mini-ava")}
    <div style="flex:1;min-width:200px"><b style="font-size:18px">${esc(e.nombre)}</b>
      <div class="hint">${esc(e.rol_laboral)} · ${d.tipo_relacion === "autonomo" ? "autónomo/a" : "contrato"} · ${e.contrato_horas} h/semana</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${chipEstado(e)}
      ${e.activo ? "" : '<span class="chip gray">De baja</span>'}
      <button class="btn sm outline" onclick="openEmpForm(${e.id})">${ICON.edit} Editar</button>
      <button class="btn sm primary" onclick="STATE.trabTab='factura';rerender()">${ICON.invoice} Factura del mes</button>
    </div>
  </div>
  <div class="tabs">${tabs.map(t => `<button class="tab ${tab === t[0] ? "on" : ""}" onclick="STATE.trabTab='${t[0]}';rerender()">${t[1]}</button>`).join("")}</div>
  ${body}`;
}
function mountTrabajadorDetail() {
  const e = S(STATE.trab); if (!e) return;
  if ((STATE.trabTab || "resumen") === "resumen") {
    const data = Array.from({ length: 6 }, (_, i) => {
      const m = addMeses(mesISO(), i - 5), fin = addDias(addMeses(m, 1) + "-01", -1);
      return [new Date(m + "-15T12:00").toLocaleDateString("es-ES", { month: "short" }), horasEmpleadoRango(e.id, m + "-01", fin)];
    });
    drawBars("chart-trab", data, { hi: 5 });
  }
  if (STATE.trabTab === "docs") cargarDocs(`empleados/${e.id}`);
}

/* factura / recibo mensual del trabajador */
function paperFacturaTrabajador(e, mes) {
  const d = ED(e.id), emp = DB.ajustes.empresa || {};
  const ini = mes + "-01", fin = addDias(addMeses(mes, 1) + "-01", -1);
  const horas = horasEmpleadoRango(e.id, ini, fin);
  const dias = new Set(DB.fichajes.filter(f => f.empleado_id === e.id && f.fecha >= ini && f.fecha <= fin).map(f => f.fecha)).size;
  const servicios = DB.tareas.filter(t => t.estado === "hecha" && t.fecha >= ini && t.fecha <= fin && (t.equipo_ids || []).includes(e.id)).length;
  const tarifa = +d.tarifa_hora || 0, total = horas * tarifa;
  if (d.tipo_relacion === "autonomo") {
    return `<div class="paper">
      <div class="paper-head">
        <div class="t"><h2>Factura de servicios</h2><p>${fmtMes(mes)} · pendiente de numerar por el emisor</p></div>
        <div class="meta"><b>${esc(e.nombre)}</b><br>${d.dni ? "NIF " + esc(d.dni) + "<br>" : ""}${d.direccion ? esc(d.direccion) + "<br>" : ""}${d.email ? esc(d.email) : ""}</div>
      </div>
      <p style="font-size:12.5px;margin-bottom:4px;color:var(--muted)">Facturar a</p>
      <p style="font-weight:700;margin-bottom:14px">${esc(emp.nombre || "")}${emp.cif ? " · CIF " + esc(emp.cif) : ""}<br><span style="font-weight:400;font-size:12px;color:var(--muted)">${esc(emp.direccion || "")}</span></p>
      <table><thead><tr><th>Concepto</th><th class="num">Importe</th></tr></thead><tbody>
        <tr><td>Servicios de ${esc(e.rol_laboral.toLowerCase())} · ${fmtMes(mes)}<br>
          <span style="color:var(--muted);font-size:11.5px">${dias} día${dias === 1 ? "" : "s"} · ${horas.toLocaleString("es-ES")} h fichadas × ${eur(tarifa)}/h · ${servicios} servicio${servicios === 1 ? "" : "s"} completado${servicios === 1 ? "" : "s"}</span></td>
          <td class="num">${eur(total)}</td></tr>
        <tr class="total"><td class="num" style="text-align:right">Total</td><td class="num">${eur(total)}</td></tr>
      </tbody></table>
      <p style="font-size:11.5px;color:var(--muted)">IVA e IRPF según el régimen fiscal del emisor. ${d.iban ? "Pago por transferencia al IBAN " + esc(d.iban) + "." : ""}
      Detalle de horas verificable en el registro de jornada del portal.</p>
      <div class="sign"><div>Generada por el Portal Hygge con los fichajes de ${fmtMes(mes)}</div></div>
    </div>`;
  }
  return paperShell("Recibo mensual de horas", fmtMes(mes) + " · " + esc(e.nombre) + " (" + esc(e.rol_laboral) + ")",
    `<table><thead><tr><th>Concepto</th><th class="num">Valor</th></tr></thead><tbody>
      <tr><td>Días trabajados</td><td class="num">${dias}</td></tr>
      <tr><td>Horas netas fichadas (pausas descontadas)</td><td class="num">${horas.toLocaleString("es-ES")} h</td></tr>
      <tr><td>Servicios completados</td><td class="num">${servicios}</td></tr>
      ${tarifa ? `<tr><td>Tarifa de referencia</td><td class="num">${eur(tarifa)} /h</td></tr>
      <tr class="total"><td>Importe de referencia del mes</td><td class="num">${eur(total)}</td></tr>` : ""}
    </tbody></table>
    <p style="font-size:11.5px;color:var(--muted)">Trabajador/a: ${esc(e.nombre)}${d.dni ? " · DNI " + esc(d.dni) : ""}${d.nass ? " · NASS " + esc(d.nass) : ""}.
    Documento de apoyo para nómina generado desde el registro de jornada (RD-ley 8/2019); no sustituye a la nómina oficial.</p>
    <div class="sign" style="margin-top:40px"><div>Firma de la empresa</div><div>Firma del trabajador/a</div></div>`);
}

/* ============================================================
   PLANIFICACIÓN
   ============================================================ */
function viewPlanSemana(fecha) {
  const lunes = addDias(fecha, -((new Date(fecha + "T12:00").getDay() + 6) % 7));
  const dias = Array.from({ length: 7 }, (_, i) => addDias(lunes, i));
  const activos = DB.emp.filter(e => e.activo);
  const tareasDe = (empId, dia) => DB.tareas.filter(t => t.fecha === dia && (empId ? (t.equipo_ids || []).includes(empId) : !(t.equipo_ids || []).length));
  const chip = t => `<button class="week-chip ${t.estado}" onclick="openTareaForm('${t.fecha}',null,${t.id})" title="${esc(P(t.propiedad_id)?.nombre || "")} · ${t.tipo}">
    ${(t.hora_inicio || "").slice(0, 5)} ${esc((P(t.propiedad_id)?.nombre || "").replace(/^(Villa|Finca|Casa|Xalet|Apartament|Àtic)\s+/i, ""))}</button>`;
  const sinAsignar = dias.some(d => tareasDe(null, d).length);
  return `
  <div class="tbl-wrap"><table class="tbl week" style="min-width:920px">
    <thead><tr><th style="min-width:150px">Trabajador</th>${dias.map(d => `
      <th style="${d === hoyISO() ? "color:var(--gold-deep)" : ""}">${new Date(d + "T12:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}</th>`).join("")}</tr></thead>
    <tbody>
      ${activos.map(e => `<tr><td><span class="who">${ava(e)} ${esc(e.nombre.split(" ")[0])}</span></td>
        ${dias.map(d => `<td>${tareasDe(e.id, d).map(chip).join("") || ""}</td>`).join("")}</tr>`).join("")}
      ${sinAsignar ? `<tr><td><span class="who" style="color:var(--terra)">${ICON.alert} Sin asignar</span></td>
        ${dias.map(d => `<td>${tareasDe(null, d).map(chip).join("") || ""}</td>`).join("")}</tr>` : ""}
    </tbody></table></div>
  <p class="hint" style="margin-top:10px">Toca un servicio para editarlo o reasignarlo. ${sinAsignar ? "Los de la fila roja no tienen equipo todavía." : ""}</p>`;
}

/* cuadrante de 3 semanas: filas = trabajadores, columnas = 21 días */
function viewPlanCuadrante(fecha) {
  const lunes = addDias(fecha, -((new Date(fecha + "T12:00").getDay() + 6) % 7));
  const dias = Array.from({ length: 21 }, (_, i) => addDias(lunes, i));
  const activos = DB.emp.filter(e => e.activo);
  const tareasDe = (empId, dia) => DB.tareas.filter(t => t.fecha === dia && (empId ? (t.equipo_ids || []).includes(empId) : !(t.equipo_ids || []).length));
  const chip = t => `<button class="week-chip t-${t.tipo} ${t.estado}" onclick="event.stopPropagation();openTareaForm('${t.fecha}',null,${t.id})"
    title="${esc(P(t.propiedad_id)?.nombre || "")} · ${t.tipo} · ${(t.hora_inicio || "").slice(0, 5)}–${(t.hora_fin || "").slice(0, 5)}">
    ${(t.hora_inicio || "").slice(0, 5)} ${esc((P(t.propiedad_id)?.nombre || "").replace(/^(Villa|Finca|Casa|Xalet|Apartament|Àtic)\s+/i, ""))}</button>`;
  const horasSem = (empId, w) => Math.round(dias.slice(w * 7, w * 7 + 7).reduce((a, d) => a + tareasDe(empId, d).reduce((x, t) => x + horasTarea(t), 0), 0));
  const clase = d => `${d === hoyISO() ? "hoy" : ""} ${((new Date(d + "T12:00").getDay() + 6) % 7) === 0 ? "wk" : ""}`;
  const celda = (empId, d) => `<td class="cq-cell ${clase(d)}">
    ${tareasDe(empId, d).map(chip).join("")}<button class="cq-add" title="Asignar servicio este día" onclick="openTareaForm('${d}',null,null,${empId || "null"})">+</button></td>`;
  const sinAsignar = dias.some(d => tareasDe(null, d).length);
  return `
  <div class="tbl-wrap"><table class="tbl week cq" style="min-width:2300px">
    <thead><tr><th class="cq-fix">Trabajador</th>${dias.map(d => `
      <th class="${clase(d)}">${new Date(d + "T12:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}</th>`).join("")}</tr></thead>
    <tbody>
      ${activos.map(e => `<tr><td class="cq-fix"><span class="who">${ava(e)} ${esc(e.nombre.split(" ")[0])}</span>
          <span class="cq-h">${[0, 1, 2].map(w => horasSem(e.id, w)).join(" · ")} h/sem</span></td>
        ${dias.map(d => celda(e.id, d)).join("")}</tr>`).join("")}
      ${sinAsignar ? `<tr><td class="cq-fix"><span class="who" style="color:var(--terra)">${ICON.alert} Sin asignar</span></td>
        ${dias.map(d => celda(null, d)).join("")}</tr>` : ""}
    </tbody></table></div>
  <p class="hint" style="margin-top:10px">Las próximas 3 semanas de un vistazo (desplaza hacia los lados). Toca un servicio para editarlo, o el <b>+</b> de cualquier casilla para asignar a esa persona ese día. Columna dorada = hoy · línea marcada = cambio de semana · bajo cada nombre, sus horas previstas por semana. Con <b>Copiar semana</b> repites el cuadrante base en segundos y solo retocas los cambios.</p>`;
}

/* papeles del horario: agenda individual y cuadrante global */
function paperHorario(empId) {
  const e = S(empId) || {};
  const { dias, de } = horarioEmp(empId);
  let total = 0;
  const filas = dias.flatMap(d => de(d).map(t => {
    const p = P(t.propiedad_id) || {};
    total += horasTarea(t);
    return `<tr><td><b>${fmtCorto(d)}</b> · ${new Date(d + "T12:00").toLocaleDateString("es-ES", { weekday: "long" })}</td>
      <td>${(t.hora_inicio || "").slice(0, 5)}–${(t.hora_fin || "").slice(0, 5)}</td>
      <td>${esc(p.nombre || "")}${p.zona ? ` <span style="color:var(--muted)">· ${esc(p.zona)}</span>` : ""}</td>
      <td>${TIPO_TXT[t.tipo] || esc(t.tipo)}</td><td>${esc(t.descripcion || "")}</td></tr>`;
  }));
  return paperShell("Horario · próximas 3 semanas", `${fmtCorto(dias[0])} → ${fmtCorto(dias[20])} · ${esc(e.nombre || "")}`,
    `<table><thead><tr><th>Día</th><th>Horario</th><th>Propiedad</th><th>Servicio</th><th>Nota</th></tr></thead>
    <tbody>${filas.join("") || '<tr><td colspan="5">Sin servicios planificados en este periodo.</td></tr>'}
    ${filas.length ? `<tr class="total"><td colspan="4">Total horas previstas</td><td class="num">${Math.round(total * 10) / 10} h</td></tr>` : ""}</tbody></table>
    <p style="font-size:11.5px;color:var(--muted)">Horario planificado; puede sufrir cambios que se reflejan al momento en la app.</p>`);
}
function paperCuadrante(fecha) {
  const lunes = addDias(fecha, -((new Date(fecha + "T12:00").getDay() + 6) % 7));
  const activos = DB.emp.filter(x => x.activo);
  const celTxt = ts => ts.map(t => `${(t.hora_inicio || "").slice(0, 5)} ${esc(P(t.propiedad_id)?.nombre || "")}`).join("<br>");
  const tablas = [0, 1, 2].map(w => {
    const dias = Array.from({ length: 7 }, (_, i) => addDias(lunes, w * 7 + i));
    const deDia = (empId, d) => DB.tareas.filter(t => t.fecha === d && (empId ? (t.equipo_ids || []).includes(empId) : !(t.equipo_ids || []).length));
    const sinAsig = dias.some(d => deDia(null, d).length);
    return `
    <h3 style="font-size:13px;margin:16px 0 6px">Semana del ${fmtCorto(dias[0])}</h3>
    <table style="font-size:10px"><thead><tr><th>Trabajador</th>${dias.map(d => `<th>${new Date(d + "T12:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}</th>`).join("")}</tr></thead>
    <tbody>${activos.map(e => `<tr><td><b>${esc(e.nombre.split(" ")[0])}</b></td>${dias.map(d => `<td>${celTxt(deDia(e.id, d))}</td>`).join("")}</tr>`).join("")}
    ${sinAsig ? `<tr><td><b>Sin asignar</b></td>${dias.map(d => `<td>${celTxt(deDia(null, d))}</td>`).join("")}</tr>` : ""}</tbody></table>`;
  });
  return paperShell("Cuadrante del equipo · 3 semanas", `Semanas del ${fmtCorto(lunes)} al ${fmtCorto(addDias(lunes, 20))}`, tablas.join(""));
}

function viewPlan() {
  const fecha = STATE.planDia || hoyISO();
  const vista = STATE.planVista || "dia";
  const salidas = DB.reservas.filter(r => r.salida === fecha && r.estado === "confirmada");
  const entradas = DB.reservas.filter(r => r.entrada === fecha && r.estado === "confirmada");
  const tareas = DB.tareas.filter(t => t.fecha === fecha).sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));
  const stChip = { hecha: '<span class="chip ok">Hecha</span>', encurso: '<span class="chip blue"><i class="d"></i>En curso</span>', pendiente: '<span class="chip line">Pendiente</span>' };
  if (!DB.props.length) return vacio(ICON.cal, "Primero añade propiedades", "La planificación se construye sobre las reservas y servicios de tus propiedades.", `<button class="btn primary" data-go="propiedades">${ICON.house} Ir a Propiedades</button>`);
  const salto = vista === "dia" ? 1 : 7;
  const lunesSel = addDias(fecha, -((new Date(fecha + "T12:00").getDay() + 6) % 7));
  const barra = `
  <div class="toolbar">
    <div class="seg">
      <button class="${vista === "dia" ? "on" : ""}" onclick="STATE.planVista='dia';rerender()">Día</button>
      <button class="${vista === "semana" ? "on" : ""}" onclick="STATE.planVista='semana';rerender()">Semana</button>
      <button class="${vista === "cuadrante" ? "on" : ""}" onclick="STATE.planVista='cuadrante';rerender()">3 semanas</button>
    </div>
    <span class="month-nav">
      <button onclick="STATE.planDia='${addDias(fecha, -salto)}';rerender()">${ICON.left}</button>
      <b>${vista === "cuadrante" ? "3 semanas desde el " + fmtCorto(lunesSel) : vista === "semana" ? "Semana del " + fmtCorto(lunesSel) : (fecha === hoyISO() ? "Hoy · " : "") + fmtCorto(fecha)}</b>
      <button onclick="STATE.planDia='${addDias(fecha, salto)}';rerender()">${ICON.right}</button>
    </span>
    ${fecha !== hoyISO() ? `<button class="btn xs outline" onclick="STATE.planDia='${hoyISO()}';rerender()">Volver a hoy</button>` : ""}
    <div class="spacer"></div>
    ${vista !== "dia" ? `
      <button class="btn sm outline" onclick="exportHorarioCSV(null,'${lunesSel}')">${ICON.down} Excel</button>
      <button class="btn sm outline" onclick="openPaperCuadrante('${fecha}')">${ICON.print} PDF</button>
      <button class="btn sm outline" onclick="openCopiarSemana('${fecha}')">${ICON.copy} Copiar semana</button>` : ""}
    <button class="btn sm primary" onclick="openTareaForm('${fecha}')">${ICON.plus} Nuevo servicio</button>
  </div>`;
  if (vista === "cuadrante") return barra + viewPlanCuadrante(fecha);
  if (vista === "semana") return barra + viewPlanSemana(fecha);
  return barra + `
  <div class="plan-cols">
    <div class="plan-col"><h4>${ICON.out} Check-outs <span class="n">${salidas.length}</span></h4>
      ${salidas.map(r => `<div class="plan-card">
        <div class="top"><b>${esc(P(r.propiedad_id)?.nombre || "")}</b><span class="hr">${(r.hora_salida || "10:00").slice(0, 5)}</span></div>
        <div class="meta">${ICON.pin} ${esc(P(r.propiedad_id)?.zona || "")} ${r.huesped ? "· " + esc(r.huesped) : ""} · ${r.canal}</div>
        ${!tareas.some(t => t.propiedad_id === r.propiedad_id && t.tipo === "limpieza") ? `
          <div style="margin-top:9px"><button class="btn xs sage" onclick="openTareaForm('${fecha}',${r.propiedad_id})">${ICON.broom} Planificar limpieza</button></div>` : ""}
      </div>`).join("") || `<div class="hint" style="padding:8px">Sin salidas.</div>`}
    </div>
    <div class="plan-col"><h4>${ICON.broom} Servicios <span class="n">${tareas.length}</span></h4>
      ${tareas.map(t => `<div class="plan-card">
        <div class="top"><b>${esc(P(t.propiedad_id)?.nombre || "")}</b><span class="hr">${(t.hora_inicio || "").slice(0, 5)}${t.hora_fin ? "–" + t.hora_fin.slice(0, 5) : ""}</span></div>
        <div class="meta">${t.tipo}${t.descripcion ? " · " + esc(t.descripcion) : ""}</div>
        <div class="team">
          <span class="avs">${(t.equipo_ids || []).map(id => S(id) ? ava(S(id)) : "").join("")}</span>
          <span class="hint">${(t.equipo_ids || []).map(id => S(id)?.nombre.split(" ")[0]).filter(Boolean).join(", ") || "sin equipo"}</span>
          <span class="act">${stChip[t.estado]}</span>
        </div>
        <div style="margin-top:9px;display:flex;gap:7px;flex-wrap:wrap">
          ${t.estado === "pendiente" ? `<button class="btn xs outline" onclick="openTareaForm('${fecha}',null,${t.id})">${ICON.edit} Editar</button>
          <button class="btn xs outline" onclick="delTarea(${t.id})">${ICON.trash}</button>` : ""}
          ${t.estado !== "hecha" && rolDireccion() ? `<button class="btn xs sage" onclick="marcarTareaHecha(${t.id})">${ICON.check} Marcar hecha</button>` : ""}
        </div>
      </div>`).join("") || `<div class="hint" style="padding:8px">Sin servicios planificados este día.</div>`}
    </div>
    <div class="plan-col"><h4>${ICON.in} Check-ins <span class="n">${entradas.length}</span></h4>
      ${entradas.map(r => { const lista = tareas.some(t => t.propiedad_id === r.propiedad_id && t.tipo === "limpieza" && t.estado === "hecha"); return `
        <div class="plan-card">
        <div class="top"><b>${esc(P(r.propiedad_id)?.nombre || "")}</b><span class="hr">${(r.hora_entrada || "16:00").slice(0, 5)}</span></div>
        <div class="meta">${r.huesped ? esc(r.huesped) + " · " : ""}${r.plazas ? r.plazas + " plazas · " : ""}${r.canal}</div>
        <div class="team"><span class="chip ${lista ? "ok" : tareas.some(t => t.propiedad_id === r.propiedad_id && t.tipo === "limpieza") ? "gold" : "terra"}">${lista ? "Lista para entrar" : tareas.some(t => t.propiedad_id === r.propiedad_id && t.tipo === "limpieza") ? "Limpieza planificada" : "Sin limpieza planificada"}</span></div>
      </div>`; }).join("") || `<div class="hint" style="padding:8px">Sin entradas.</div>`}
    </div>
  </div>`;
}

/* ============================================================
   FICHAJES (dirección)
   ============================================================ */
function viewFichajes() {
  const fecha = STATE.fichDia || hoyISO();
  const rows = DB.fichajes.filter(f => f.fecha === fecha).sort((a, b) => a.entrada.localeCompare(b.entrada));
  const totalMs = rows.reduce((a, f) => a + horasDeFichaje(f), 0);
  return `
  <div class="legal-note">${ICON.shield}
    <div><b>Registro de jornada conforme al RD-ley 8/2019.</b> Cada fichaje guarda fecha, hora y ubicación GPS
    y se conserva en la base de datos al menos 4 años. Exportable ante una inspección en un clic.</div>
  </div>
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.users} Fichajes del día</div><div class="val">${rows.length}</div><div class="sub">de ${DB.emp.filter(e => e.activo).length} en plantilla activa</div></div>
    <div class="kpi"><div class="lab">${ICON.clock} Horas del día</div><div class="val">${msAHoras(totalMs)}<small>h</small></div><div class="sub">descontadas las pausas</div></div>
    <div class="kpi"><div class="lab">${ICON.check} Jornadas abiertas</div><div class="val">${rows.filter(f => !f.salida).length}</div><div class="sub">sin fichar salida</div></div>
  </div>
  <div class="toolbar">
    <span class="month-nav">
      <button onclick="STATE.fichDia='${addDias(fecha, -1)}';rerender()">${ICON.left}</button>
      <b>${fecha === hoyISO() ? "Hoy · " : ""}${fmtCorto(fecha)}</b>
      <button onclick="STATE.fichDia='${addDias(fecha, 1)}';rerender()">${ICON.right}</button>
    </span>
    <div class="spacer"></div>
    <button class="btn sm outline" onclick="exportFichajesCSV('${fecha}')">${ICON.down} Exportar CSV</button>
    <button class="btn sm outline" onclick="openPaperFichajes('${fecha}')">${ICON.print} Informe PDF</button>
  </div>
  ${rows.length ? `<div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Empleado</th><th>Entrada</th><th>Salida</th><th>Fotos</th><th>Ubicación</th><th>Pausas</th><th class="num">Total</th><th>Estado</th></tr></thead>
    <tbody>${rows.map(f => { const e = S(f.empleado_id) || { nombre: "?" }; const ps = DB.pausas.filter(p => p.fichaje_id === f.id); return `
      <tr><td><span class="who">${ava(e)} ${esc(e.nombre)}</span></td>
      <td><b>${fmtHora(f.entrada)}</b></td>
      <td>${f.salida ? `<b>${fmtHora(f.salida)}</b>` : "—"}</td>
      <td><span class="fich-fotos">
        ${f.foto_entrada_path ? `<a href="#" onclick="event.preventDefault();abrirDoc('${esc(f.foto_entrada_path)}')" title="Foto de entrada"><img data-foto="${esc(f.foto_entrada_path)}" alt="entrada"></a>` : ""}
        ${f.foto_salida_path ? `<a href="#" onclick="event.preventDefault();abrirDoc('${esc(f.foto_salida_path)}')" title="Foto de salida"><img data-foto="${esc(f.foto_salida_path)}" alt="salida"></a>` : ""}
        ${!f.foto_entrada_path && !f.foto_salida_path ? "—" : ""}</span></td>
      <td>${f.lat ? `<a class="chip line" target="_blank" rel="noopener" href="https://maps.google.com/?q=${f.lat},${f.lng}">${ICON.pin} mapa</a>` : "—"}</td>
      <td>${ps.length ? ps.map(p => fmtHora(p.inicio) + "–" + (p.fin ? fmtHora(p.fin) : "…")).join(", ") : "—"}</td>
      <td class="num"><b>${msAHoras(horasDeFichaje(f))} h</b></td>
      <td>${f.salida ? '<span class="chip ok">Completo</span>' : '<span class="chip blue"><i class="d"></i>Abierta</span>'}</td></tr>`; }).join("")}
    </tbody></table></div>`
  : vacio(ICON.clock, "Sin fichajes este día", "Cuando el equipo fiche desde su móvil, los registros aparecerán aquí con hora y ubicación.")}`;
}

/* ============================================================
   INCIDENCIAS
   ============================================================ */
function incCardHTML(i) {
  const rep = i.reportada_por ? S(i.reportada_por) : null;
  return `<button class="inc-card" data-inc="${i.id}">
    <div class="top"><span class="prio ${i.prioridad}"></span><h4>${esc(i.titulo)}</h4></div>
    <div class="top"><span class="chip sage">${esc(P(i.propiedad_id)?.nombre || "")}</span>
      ${i.estado === "resuelta" ? '<span class="chip ok">Resuelta</span>' : '<span class="chip terra"><i class="d"></i>Abierta</span>'}
      ${i.fotos?.length ? `<span class="chip line">${ICON.camera} ${i.fotos.length}</span>` : ""}</div>
    <div class="desc">${esc(i.descripcion || "")}</div>
    <div class="foot">${rep ? ava(rep) + " " + esc(rep.nombre.split(" ")[0]) : "Oficina"} · ${fmtCorto(i.created_at.slice(0, 10))}
      ${i.coste != null ? `<span style="margin-left:auto">${eur(i.coste)}</span>` : ""}</div>
  </button>`;
}
function viewIncidencias() {
  const f = STATE.incFilter || "abiertas";
  const list = DB.incidencias.filter(i => f === "todas" ? true : f === "abiertas" ? i.estado === "abierta" : i.estado === "resuelta");
  const mes = mesISO();
  return `
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.alert} Abiertas</div><div class="val">${DB.incidencias.filter(i => i.estado === "abierta").length}</div><div class="sub">${DB.incidencias.filter(i => i.estado === "abierta" && i.prioridad === "alta").length} de prioridad alta</div></div>
    <div class="kpi"><div class="lab">${ICON.check} Resueltas este mes</div><div class="val">${DB.incidencias.filter(i => i.estado === "resuelta" && (i.resuelta_at || "").startsWith(mes)).length}</div><div class="sub">de ${DB.incidencias.length} totales</div></div>
    <div class="kpi"><div class="lab">${ICON.euro} Coste este mes</div><div class="val">${eur0(DB.incidencias.filter(i => (i.resuelta_at || i.created_at).startsWith(mes)).reduce((a, i) => a + (+i.coste || 0), 0))}</div><div class="sub">repuestos y materiales</div></div>
  </div>
  <div class="toolbar">
    <div class="seg">
      ${[["abiertas", "Abiertas"], ["resuelta", "Resueltas"], ["todas", "Todas"]].map(x => `<button class="${f === x[0] ? "on" : ""}" onclick="STATE.incFilter='${x[0]}';rerender()">${x[1]}</button>`).join("")}
    </div>
    <div class="spacer"></div>
    <button class="btn primary sm" onclick="openNuevaIncidencia()">${ICON.plus} Nueva incidencia</button>
  </div>
  ${list.length ? `<div class="inc-grid">${list.map(incCardHTML).join("")}</div>`
  : vacio(ICON.check, "Nada por aquí", f === "abiertas" ? "No hay incidencias abiertas. El equipo puede reportarlas desde su app con foto." : "Sin incidencias en este filtro.")}`;
}
function drawerIncidencia(i) {
  const rep = i.reportada_por ? S(i.reportada_por) : null;
  const evs = DB.eventos.filter(e => e.incidencia_id === i.id);
  return `
  <div class="drawer-head"><span class="prio ${i.prioridad}" style="width:12px;height:12px"></span>
    <div><b style="font-size:15.5px">${esc(i.titulo)}</b><div class="hint">${esc(P(i.propiedad_id)?.nombre || "")} · ${fmtCorto(i.created_at.slice(0, 10))} ${fmtHora(i.created_at)}</div></div>
    <button class="x" onclick="closeDrawer()">${ICON.x}</button></div>
  <div class="drawer-body">
    ${i.descripcion ? `<p style="font-size:13.5px;margin-bottom:14px">${esc(i.descripcion)}</p>` : ""}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${i.estado === "resuelta" ? '<span class="chip ok">Resuelta</span>' : '<span class="chip terra"><i class="d"></i>Abierta</span>'}
      <span class="chip line">Prioridad ${i.prioridad}</span>
      ${i.coste != null ? `<span class="chip gold">${eur(i.coste)}</span>` : ""}
      ${rep ? `<span class="chip sage">${esc(rep.nombre)}</span>` : ""}
    </div>
    <div class="thumbs" id="inc-fotos">${(i.fotos || []).map(() => `<div class="lds" style="width:74px;height:74px;border-radius:10px"></div>`).join("")}</div>
    ${rolDireccion() ? `
    <h4 style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:16px 0 10px">Documentos</h4>
    <div id="inc-docs"><div class="lds"></div></div>
    <label class="file-btn" style="margin-top:10px">${ICON.plus} Adjuntar documento<input type="file" onchange="subirDoc('incidencias-docs/${i.id}', this, '#inc-docs')"></label>
    <p class="hint" style="margin-top:6px">Contratos, presupuestos o facturas de la reparación · solo los ve dirección.</p>` : ""}
    <h4 style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:16px 0 12px">Historial</h4>
    <div class="tl">${evs.map(t => `<div class="tl-item"><b>${esc(t.texto)}</b><span>${fmtCorto(t.created_at.slice(0, 10))} · ${fmtHora(t.created_at)}${t.autor ? " · " + esc(t.autor) : ""}</span></div>`).join("") || '<p class="hint">Sin movimientos.</p>'}</div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <input class="input" id="inc-coment" placeholder="Añadir comentario…" style="flex:1">
      <button class="btn sm sage" onclick="comentarInc(${i.id})">${ICON.send}</button>
    </div>
    ${i.estado !== "resuelta" && rolDireccion() ? `
      <div style="display:flex;gap:8px;margin-top:18px;align-items:center;flex-wrap:wrap">
        <input class="input" id="inc-coste" type="number" step="0.01" min="0" placeholder="Coste € (opcional)" style="width:150px">
        <button class="btn sm primary" onclick="resolverInc(${i.id})">${ICON.check} Marcar resuelta</button>
        <span class="hint">La asignación al técnico se gestiona fuera del portal.</span>
      </div>` : ""}
  </div>`;
}

/* ============================================================
   INFORMES
   ============================================================ */
function viewInformes() {
  const mes = STATE.repMes || addMeses(mesISO(), -0);
  return `
  <div class="card" style="margin-bottom:16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
    <span class="chip gold">${ICON.cal} Periodo</span>
    <span class="month-nav">
      <button onclick="STATE.repMes='${addMeses(mes, -1)}';rerender()">${ICON.left}</button><b>${fmtMes(mes)}</b>
      <button onclick="STATE.repMes='${addMeses(mes, 1)}';rerender()">${ICON.right}</button>
    </span>
    <span class="hint">Los documentos se generan al momento con los fichajes, servicios y reservas registrados en el periodo.</span>
  </div>
  <div class="report-cards">
    <div class="report-card"><span class="ic">${ICON.users}</span>
      <h4>Horas por empleado</h4>
      <p>Horas fichadas (descontadas pausas) y servicios realizados por cada persona. Listo para la gestoría.</p>
      <button class="btn primary" onclick="openPaperHoras('${mes}')">${ICON.doc} Generar</button></div>
    <div class="report-card"><span class="ic">${ICON.house}</span>
      <h4>Ocupación por propiedad</h4>
      <p>Noches ocupadas, % de ocupación, limpiezas realizadas e ingresos por reservas de cada inmueble.</p>
      <button class="btn primary" onclick="openPaperOcupacion('${mes}')">${ICON.doc} Generar</button></div>
    <div class="report-card"><span class="ic">${ICON.chart}</span>
      <h4>Horas y coste por propiedad</h4>
      <p>Cuánto trabajo lleva cada vivienda: servicios realizados, horas reales del equipo y coste (horas × tarifa de cada trabajador).</p>
      <button class="btn primary" onclick="openPaperCostes('${mes}')">${ICON.doc} Generar</button></div>
    <div class="report-card"><span class="ic">${ICON.euro}</span>
      <h4>Liquidaciones a propietarios</h4>
      <p>Resumen económico por propietario: ingresos por reservas, servicios prestados y neto resultante.</p>
      <button class="btn primary" onclick="openPaperLiquidaciones('${mes}')">${ICON.doc} Generar</button></div>
    <div class="report-card"><span class="ic" style="background:var(--terra-soft);color:var(--terra)">${ICON.alert}</span>
      <h4>Absentismo y asistencia</h4>
      <p>Ausencias justificadas y sin justificar por trabajador, con gráficas y análisis automático de patrones.</p>
      <button class="btn primary" onclick="openPaperAbsentismo('${mes}')">${ICON.doc} Generar</button></div>
  </div>`;
}

/* ---------- papeles ---------- */
function paperShell(titulo, sub, inner, sello) {
  const emp = DB.ajustes.empresa || {};
  return `<div class="paper">
    <div class="paper-head">
      <img src="assets/logo-hygge.png" alt="Hygge">
      <div class="t"><h2>${titulo}</h2><p>${sub}</p></div>
      <div class="meta">${esc(emp.nombre || "")}<br>${esc(emp.direccion || "")}<br>${esc(emp.email || "")}</div>
    </div>
    ${inner}
    <div class="sign">
      <div>Generado por el Portal Hygge · ${fmtDia(hoyISO())}</div>
      ${sello ? `<div class="stamp">${sello}</div>` : ""}
    </div>
  </div>`;
}
function paperHoras(mes) {
  const ini = mes + "-01", fin = addDias(addMeses(mes, 1) + "-01", -1);
  const rows = DB.emp.filter(e => e.activo).map(e => {
    const horas = horasEmpleadoRango(e.id, ini, fin);
    const servicios = DB.tareas.filter(t => t.estado === "hecha" && t.fecha >= ini && t.fecha <= fin && (t.equipo_ids || []).includes(e.id)).length;
    const dias = new Set(DB.fichajes.filter(f => f.empleado_id === e.id && f.fecha >= ini && f.fecha <= fin).map(f => f.fecha)).size;
    return { e, horas, servicios, dias };
  }).filter(r => r.horas > 0 || r.servicios > 0);
  if (!rows.length) return paperShell("Informe de horas por empleado", fmtMes(mes),
    `<p style="padding:20px 0;color:var(--muted)">Sin fichajes registrados en ${fmtMes(mes)}.</p>`);
  const tot = rows.reduce((a, r) => a + r.horas, 0);
  return paperShell("Informe de horas por empleado", fmtMes(mes) + " · registro de jornada art. 34.9 ET",
    `<table><thead><tr><th>Empleado</th><th>Puesto</th><th class="num">Días</th><th class="num">Horas</th><th class="num">Servicios</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td><b>${esc(r.e.nombre)}</b></td><td>${esc(r.e.rol_laboral)}</td>
      <td class="num">${r.dias}</td><td class="num">${r.horas.toLocaleString("es-ES")} h</td><td class="num">${r.servicios || "—"}</td></tr>`).join("")}
    <tr class="total"><td colspan="3">Total equipo</td><td class="num">${tot.toLocaleString("es-ES")} h</td><td class="num">${rows.reduce((a, r) => a + r.servicios, 0)}</td></tr></tbody></table>
    <p style="font-size:11.5px;color:var(--muted)">Horas netas con pausas descontadas, según los fichajes con geolocalización del equipo.</p>`);
}
function paperOcupacion(mes) {
  const rows = DB.props.filter(p => p.activa).map(p => ({ p, st: statsMesProp(p.id, mes) }));
  if (!rows.length) return paperShell("Informe de ocupación", fmtMes(mes), `<p style="padding:20px 0;color:var(--muted)">Sin propiedades activas.</p>`);
  return paperShell("Informe de ocupación por propiedad", fmtMes(mes) + " · " + rows.length + " inmuebles",
    `<table><thead><tr><th>Propiedad</th><th>Zona</th><th class="num">Noches</th><th class="num">Ocup.</th><th class="num">Limpiezas</th><th class="num">Ingresos</th></tr></thead>
    <tbody>${rows.map(({ p, st }) => `<tr><td><b>${esc(p.nombre)}</b></td><td>${esc(p.zona || "")}</td>
      <td class="num">${st.noches}</td><td class="num">${st.ocup}%</td><td class="num">${st.limpiezas}</td><td class="num">${eur(st.ingresos)}</td></tr>`).join("")}
    <tr class="total"><td colspan="2">Total cartera</td><td class="num">${rows.reduce((a, r) => a + r.st.noches, 0)}</td>
      <td class="num">${ocupacionMes(mes)}%</td><td class="num">${rows.reduce((a, r) => a + r.st.limpiezas, 0)}</td>
      <td class="num">${eur(rows.reduce((a, r) => a + r.st.ingresos, 0))}</td></tr></tbody></table>
    <p style="font-size:11.5px;color:var(--muted)">Ingresos: suma de reservas con entrada dentro del mes (si se registró su importe).</p>`);
}
function paperCostes(mes) {
  const rows = DB.props.map(p => {
    const ts = tareasPropMes(p.id, mes);
    return { p, n: ts.length, horas: horasPropMes(p.id, mes), coste: costePropMes(p.id, mes) };
  }).filter(r => r.n > 0 || r.p.activa);
  if (!rows.length) return paperShell("Horas y coste por propiedad", fmtMes(mes), `<p style="padding:20px 0;color:var(--muted)">Sin propiedades.</p>`);
  const tH = rows.reduce((a, r) => a + r.horas, 0), tC = rows.reduce((a, r) => a + r.coste, 0), tN = rows.reduce((a, r) => a + r.n, 0);
  return paperShell("Horas y coste de trabajo por propiedad", fmtMes(mes) + " · según llegada/salida real del equipo",
    `<table><thead><tr><th>Propiedad</th><th>Zona</th><th class="num">Servicios</th><th class="num">Horas de equipo</th><th class="num">Coste</th></tr></thead>
    <tbody>${rows.sort((a, b) => b.coste - a.coste || b.horas - a.horas).map(r => `
      <tr><td><b>${esc(r.p.nombre)}</b></td><td>${esc(r.p.zona || "")}</td>
      <td class="num">${r.n}</td><td class="num">${r.horas.toLocaleString("es-ES")} h</td>
      <td class="num">${r.coste ? eur(r.coste) : "—"}</td></tr>`).join("")}
    <tr class="total"><td colspan="2">Total cartera</td><td class="num">${tN}</td><td class="num">${Math.round(tH * 10) / 10} h</td><td class="num">${eur(tC)}</td></tr></tbody></table>
    <p style="font-size:11.5px;color:var(--muted)">Horas = duración real de cada servicio (llegada → finalización) × personas asignadas.
    Coste = duración × tarifa €/h de cada trabajador asignado (ficha del trabajador). Los servicios sin tarifa cuentan horas pero no coste.</p>`);
}

/* gráfica de barras horizontal en SVG (se imprime bien en el PDF) */
function svgBarras(pares, color = "#b5533c") {
  if (!pares.length) return "";
  const max = Math.max(1, ...pares.map(p => p[1]));
  const w = 660, rowH = 30, h = pares.length * rowH + 4;
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;margin:6px 0 2px" xmlns="http://www.w3.org/2000/svg" font-family="Product Sans,sans-serif">
    ${pares.map((p, i) => {
      const y = i * rowH, bw = Math.max(3, p[1] / max * (w - 250));
      return `<text x="0" y="${y + 19}" font-size="12" fill="#3d4237">${esc(String(p[0]).slice(0, 24))}</text>
      <rect x="180" y="${y + 6}" width="${bw}" height="17" rx="5" fill="${color}" opacity="${.45 + .55 * (p[1] / max)}"/>
      <text x="${186 + bw}" y="${y + 19}" font-size="12" font-weight="700" fill="#3d4237">${p[1]}</text>`;
    }).join("")}
  </svg>`;
}
/* análisis automático de patrones de absentismo (generado de los datos) */
function analisisAbsentismo(mes) {
  const desde = addMeses(mes, -5) + "-01", hasta = addDias(addMeses(mes, 1) + "-01", -1);
  const aus6 = DB.ausencias.filter(a => a.fecha >= desde && a.fecha <= hasta);
  const inj6 = aus6.filter(a => a.tipo === "injustificada");
  const ausMes = DB.ausencias.filter(a => a.fecha.startsWith(mes));
  const injMes = ausMes.filter(a => a.tipo === "injustificada");
  const frases = [];
  if (!aus6.length) return ["Sin ausencias registradas en los últimos 6 meses. El registro se alimenta de los días con trabajo asignado y sin fichaje, más las ausencias que registre dirección."];
  frases.push(`En ${fmtMes(mes)} se registraron <b>${ausMes.length}</b> ausencia${ausMes.length === 1 ? "" : "s"}, de las que <b>${injMes.length}</b> ${injMes.length === 1 ? "fue" : "fueron"} sin justificar. En los últimos 6 meses acumulan ${aus6.length} (${inj6.length} sin justificar).`);
  if (inj6.length) {
    const porEmp = {};
    inj6.forEach(a => porEmp[a.empleado_id] = (porEmp[a.empleado_id] || 0) + 1);
    const [topId, topN] = Object.entries(porEmp).sort((a, b) => b[1] - a[1])[0];
    const pct = Math.round(topN / inj6.length * 100);
    if (pct >= 40 && topN >= 2) frases.push(`<b>${esc(S(+topId)?.nombre || "Un trabajador")}</b> concentra el <b>${pct}%</b> de las ausencias sin justificar del semestre (${topN} de ${inj6.length}). Conviene una conversación individual y pedir justificante por escrito.`);
    const porDia = [0, 0, 0, 0, 0, 0, 0];
    inj6.forEach(a => porDia[(new Date(a.fecha + "T12:00").getDay() + 6) % 7]++);
    const maxDia = Math.max(...porDia);
    if (inj6.length >= 3 && maxDia / inj6.length >= .4) {
      const dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábados", "domingos"];
      frases.push(`Patrón semanal: los <b>${dias[porDia.indexOf(maxDia)]}</b> concentran el <b>${Math.round(maxDia / inj6.length * 100)}%</b> de las ausencias sin justificar — un patrón repetido en un día concreto suele indicar causa organizativa o personal recurrente, no casualidad.`);
    }
    const prev3 = DB.ausencias.filter(a => a.tipo === "injustificada" && a.fecha >= addMeses(mes, -3) + "-01" && a.fecha < mes + "-01").length / 3;
    if (injMes.length > prev3 * 1.5 && injMes.length >= 2) frases.push(`Tendencia <b>al alza</b>: este mes hay ${injMes.length} sin justificar frente a una media de ${Math.round(prev3 * 10) / 10}/mes en el trimestre anterior.`);
    else if (injMes.length < prev3 * .6) frases.push(`Tendencia <b>a la baja</b>: ${injMes.length} sin justificar este mes frente a una media de ${Math.round(prev3 * 10) / 10}/mes en el trimestre anterior.`);
    frases.push(`Recomendación: solicitar justificante en un máximo de 48 h tras cada ausencia, dejar constancia en este registro (queda fecha, origen y documento) y revisar los casos reincidentes en la reunión semanal de planificación.`);
  }
  return frases;
}
function paperAbsentismo(mes) {
  const activos = DB.emp.filter(e => e.activo);
  const rows = activos.map(e => {
    const am = ausenciasDe(e.id).filter(a => a.fecha.startsWith(mes));
    const inj = am.filter(a => a.tipo === "injustificada").length;
    const just = am.length - inj;
    const trab = new Set(DB.fichajes.filter(f => f.empleado_id === e.id && f.fecha.startsWith(mes)).map(f => f.fecha)).size;
    const esperados = trab + am.length;
    return { e, trab, inj, just, tasa: esperados ? Math.round(inj / esperados * 100) : 0 };
  });
  const desde6 = addMeses(mes, -5) + "-01";
  const inj6PorEmp = activos.map(e => [e.nombre, ausenciasDe(e.id, desde6).filter(a => a.tipo === "injustificada" && a.fecha <= addDias(addMeses(mes, 1) + "-01", -1)).length]).filter(p => p[1] > 0).sort((a, b) => b[1] - a[1]);
  const meses6 = Array.from({ length: 6 }, (_, i) => addMeses(mes, i - 5));
  const evol = meses6.map(m => [new Date(m + "-15T12:00").toLocaleDateString("es-ES", { month: "short", year: "2-digit" }), DB.ausencias.filter(a => a.tipo === "injustificada" && a.fecha.startsWith(m)).length]);
  const analisis = analisisAbsentismo(mes);
  return paperShell("Informe de absentismo y asistencia", fmtMes(mes) + " · " + activos.length + " trabajadores en plantilla",
    `<table><thead><tr><th>Trabajador</th><th class="num">Días trabajados</th><th class="num">Justificadas</th><th class="num">Sin justificar</th><th class="num">Tasa</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td><b>${esc(r.e.nombre)}</b></td><td class="num">${r.trab}</td><td class="num">${r.just || "—"}</td>
      <td class="num" style="${r.inj ? "color:var(--terra);font-weight:700" : ""}">${r.inj || "—"}</td><td class="num">${r.tasa}%</td></tr>`).join("")}
    <tr class="total"><td>Total</td><td class="num">${rows.reduce((a, r) => a + r.trab, 0)}</td>
      <td class="num">${rows.reduce((a, r) => a + r.just, 0)}</td><td class="num">${rows.reduce((a, r) => a + r.inj, 0)}</td><td></td></tr></tbody></table>
    ${inj6PorEmp.length ? `<h3 style="font-size:13px;margin:18px 0 4px">Ausencias sin justificar por trabajador · últimos 6 meses</h3>${svgBarras(inj6PorEmp)}` : ""}
    ${evol.some(e => e[1] > 0) ? `<h3 style="font-size:13px;margin:18px 0 4px">Evolución mensual (sin justificar)</h3>${svgBarras(evol, "#c79c3d")}` : ""}
    <h3 style="font-size:13px;margin:18px 0 6px">Análisis automático</h3>
    ${analisis.map(f => `<p style="font-size:12.5px;margin-bottom:8px">• ${f}</p>`).join("")}
    <p style="font-size:11.5px;color:var(--muted);margin-top:10px">Metodología: el portal detecta automáticamente los días con trabajo asignado y sin fichaje; dirección los confirma como ausencia (justificada o no) y puede adjuntar el justificante. Cada registro conserva fecha, origen y autor.</p>`);
}

function liquidacionOwner(o, mes) {
  const propsO = DB.props.filter(p => p.propietario_id === o.id);
  const ini = mes + "-01", fin = addDias(addMeses(mes, 1) + "-01", -1);
  let ingresos = 0, gestion = 0, servicios = 0, nLimp = 0;
  propsO.forEach(p => {
    const st = statsMesProp(p.id, mes);
    ingresos += st.ingresos; gestion += +p.tarifa_gestion || 0;
    const limp = DB.tareas.filter(t => t.propiedad_id === p.id && t.tipo === "limpieza" && t.estado === "hecha" && t.fecha >= ini && t.fecha <= fin).length;
    nLimp += limp; servicios += limp * (+p.tarifa_limpieza || 0);
  });
  return { propsO, ingresos, gestion, servicios, nLimp, neto: ingresos - gestion - servicios };
}
function paperLiquidaciones(mes) {
  const rows = DB.owners.map(o => ({ o, l: liquidacionOwner(o, mes) })).filter(r => r.l.propsO.length);
  if (!rows.length) return paperShell("Liquidaciones a propietarios", fmtMes(mes), `<p style="padding:20px 0;color:var(--muted)">No hay propietarios con propiedades asignadas.</p>`);
  return paperShell("Liquidaciones a propietarios", fmtMes(mes),
    `<table><thead><tr><th>Propietario</th><th>Propiedades</th><th class="num">Ingresos</th><th class="num">Gestión</th><th class="num">Limpiezas</th><th class="num">Neto</th></tr></thead>
    <tbody>${rows.map(({ o, l }) => `<tr><td><b>${esc(o.nombre)}</b></td><td>${l.propsO.map(p => esc(p.nombre)).join(", ")}</td>
      <td class="num">${eur(l.ingresos)}</td><td class="num">−${eur(l.gestion)}</td><td class="num">−${eur(l.servicios)}</td><td class="num"><b>${eur(l.neto)}</b></td></tr>`).join("")}
    </tbody></table>
    <p style="font-size:11.5px;color:var(--muted)">Neto = ingresos por reservas − gestión mensual − limpiezas realizadas (${rows.reduce((a, r) => a + r.l.nLimp, 0)} en total).</p>`);
}
function paperFichajesDia(fecha) {
  const rows = DB.fichajes.filter(f => f.fecha === fecha);
  return paperShell("Registro de jornada", fmtDia(fecha) + " · RD-ley 8/2019",
    rows.length ? `<table><thead><tr><th>Empleado</th><th>Puesto</th><th class="num">Entrada</th><th class="num">Salida</th><th class="num">Pausas</th><th class="num">Total</th></tr></thead>
    <tbody>${rows.map(f => { const e = S(f.empleado_id) || {}; const ps = DB.pausas.filter(p => p.fichaje_id === f.id); return `
      <tr><td><b>${esc(e.nombre || "?")}</b></td><td>${esc(e.rol_laboral || "")}</td>
      <td class="num">${fmtHora(f.entrada)}</td><td class="num">${f.salida ? fmtHora(f.salida) : "en curso"}</td>
      <td class="num">${ps.length}</td><td class="num">${msAHoras(horasDeFichaje(f))} h</td></tr>`; }).join("")}</tbody></table>
    <p style="font-size:11.5px;color:var(--muted)">Registro inalterable con sello de tiempo y ubicación. Conservación mínima: 4 años.</p>`
    : `<p style="padding:20px 0;color:var(--muted)">Sin fichajes este día.</p>`);
}
function paperFactura(f) {
  const emp = DB.ajustes.empresa || {};
  const lineas = (f.lineas || []).length ? f.lineas : [{ c: f.concepto || "Servicios", importe: +f.base }];
  const iva = (DB.ajustes.tarifas?.iva ?? 21) / 100;
  return `<div class="paper">
    <div class="paper-head">
      <img src="assets/logo-hygge.png" alt="Hygge">
      <div class="t"><h2>${f.numero ? "Factura " + esc(f.numero) : "Borrador de factura"}</h2>
        <p>Fecha ${fmtCorto(f.fecha)}${f.vencimiento ? " · vencimiento " + fmtCorto(f.vencimiento) : ""}</p></div>
      <div class="meta"><b>${esc(emp.nombre || "")}</b><br>${emp.cif ? "CIF " + esc(emp.cif) + "<br>" : ""}${esc(emp.direccion || "")}<br>${esc(emp.email || "")}</div>
    </div>
    <p style="font-size:12.5px;margin-bottom:4px;color:var(--muted)">Facturar a</p>
    <p style="font-weight:700;margin-bottom:14px">${esc(f.cliente)}</p>
    <table><thead><tr><th>Concepto</th><th class="num">Importe</th></tr></thead>
    <tbody>${lineas.map(l => `<tr><td>${esc(l.c)}</td><td class="num">${eur(l.importe)}</td></tr>`).join("")}
      <tr><td class="num" style="text-align:right">Base imponible</td><td class="num">${eur(f.base)}</td></tr>
      <tr><td class="num" style="text-align:right">IVA ${Math.round(iva * 100)} %</td><td class="num">${eur(f.base * iva)}</td></tr>
      <tr class="total"><td class="num" style="text-align:right">Total</td><td class="num">${eur(f.base * (1 + iva))}</td></tr>
    </tbody></table>
    <div style="font-size:11.5px;color:var(--muted);margin-top:8px">
      ${emp.iban ? "Pago por transferencia · IBAN " + esc(emp.iban) + "<br>" : ""}
      ${f.numero ? "Referencia: " + esc(f.numero) : "Este borrador aún no tiene número: al emitirla se asigna de forma correlativa e inalterable."}
    </div>
    <div class="sign"><div>Generada por el Portal Hygge</div>${f.estado === "borrador" ? '<div class="stamp">Borrador</div>' : ""}</div>
  </div>`;
}

/* ============================================================
   FACTURACIÓN
   ============================================================ */
function viewFacturacion() {
  const filtro = STATE.factFilter || "todas";
  const list = DB.facturas.filter(x => filtro === "todas" || estadoFactura(x) === filtro);
  const iva = 1 + (DB.ajustes.tarifas?.iva ?? 21) / 100;
  const tot = e => DB.facturas.filter(x => estadoFactura(x) === e).reduce((a, x) => a + x.base * iva, 0);
  const stChip = { cobrada: '<span class="chip ok">Cobrada</span>', emitida: '<span class="chip gold"><i class="d"></i>Emitida</span>', vencida: '<span class="chip terra"><i class="d"></i>Vencida</span>', borrador: '<span class="chip gray">Borrador</span>' };
  return `
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.invoice} Facturas</div><div class="val">${DB.facturas.length}</div><div class="sub">${DB.facturas.filter(x => x.estado === "borrador").length} borradores</div></div>
    <div class="kpi"><div class="lab">${ICON.check} Cobradas</div><div class="val">${DB.facturas.filter(x => x.estado === "cobrada").length}</div><div class="sub">${eur0(tot("cobrada"))}</div></div>
    <div class="kpi"><div class="lab">${ICON.clock} Pendientes de cobro</div><div class="val">${DB.facturas.filter(x => estadoFactura(x) === "emitida").length}</div><div class="sub">${eur0(tot("emitida"))}</div></div>
    <div class="kpi"><div class="lab">${ICON.alert} Vencidas</div><div class="val">${DB.facturas.filter(facturaVencida).length}</div><div class="sub">${eur0(tot("vencida"))}</div></div>
  </div>
  <div class="toolbar">
    <div class="seg">
      ${[["todas", "Todas"], ["borrador", "Borradores"], ["emitida", "Emitidas"], ["cobrada", "Cobradas"]].map(x => `<button class="${filtro === x[0] ? "on" : ""}" onclick="STATE.factFilter='${x[0]}';rerender()">${x[1]}</button>`).join("")}
    </div>
    <span class="verifactu">${ICON.shield} Numeración correlativa · preparado para VeriFactu</span>
    <div class="spacer"></div>
    <button class="btn sm outline" onclick="openFacturaManual()">${ICON.plus} Factura manual</button>
    <button class="btn sm primary" onclick="openGenerarFacturas()">${ICON.invoice} Generar facturas del mes</button>
  </div>
  ${list.length ? `<div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Nº</th><th>Cliente</th><th>Concepto</th><th>Fecha</th><th class="num">Base</th><th class="num">Total</th><th>Estado</th><th></th></tr></thead>
    <tbody>${list.map(x => `
      <tr><td class="fact-num">${x.numero || "—"}</td><td><b>${esc(x.cliente)}</b></td><td>${esc(x.concepto || "")}</td><td>${fmtCorto(x.fecha)}</td>
      <td class="num">${eur(x.base)}</td><td class="num"><b>${eur(x.base * iva)}</b></td>
      <td>${stChip[estadoFactura(x)]}</td>
      <td class="num" style="white-space:nowrap">
        <button class="btn xs outline" onclick="openFacturaPaper(${x.id})">${ICON.eye} Ver</button>
        ${x.estado === "borrador" ? `<button class="btn xs sage" onclick="emitirFacturaUI(${x.id})">${ICON.send} Emitir</button>` : ""}
        ${["emitida"].includes(x.estado) ? `<button class="btn xs primary" onclick="cobrarFacturaUI(${x.id})">${ICON.check} Cobrada</button>` : ""}
      </td></tr>`).join("")}
    </tbody></table></div>`
  : vacio(ICON.invoice, "Todavía no hay facturas",
    "Genera las del mes con un clic (usa las tarifas de cada propiedad y las limpiezas hechas) o crea una manual.",
    `<button class="btn primary" onclick="openGenerarFacturas()">${ICON.invoice} Generar facturas del mes</button>`)}`;
}

/* ============================================================
   PROPIETARIOS (admin)
   ============================================================ */
const stars = n => `<span style="color:var(--gold);letter-spacing:1px">${"★".repeat(n)}<span style="color:#d8d4c6">${"★".repeat(5 - n)}</span></span>`;
const mejoraEstadoChip = m => ({
  propuesta: '<span class="chip gold"><i class="d"></i>Propuesta</span>',
  aceptada: '<span class="chip blue"><i class="d"></i>Aceptada por el propietario</span>',
  implementada: '<span class="chip ok">Implementada</span>',
  descartada: '<span class="chip gray">Descartada</span>',
}[m.estado]);

function viewPropietarios() {
  if (!DB.owners.length) return vacio(ICON.users, "Aún no hay propietarios",
    "Registra a los dueños: tendrán su propio acceso al portal para ver su casa, las reseñas y las propuestas de mejora con su impacto en ingresos.",
    `<button class="btn primary" onclick="openOwnerForm()">${ICON.plus} Añadir propietario</button>`);
  const mesLiq = addMeses(mesISO(), -1);
  return `
  <div class="toolbar">
    <span class="hint">Toca a un propietario para gestionar sus propiedades, reseñas y propuestas de mejora — y darle su acceso al portal.</span>
    <div class="spacer"></div>
    <button class="btn primary sm" onclick="openOwnerForm()">${ICON.plus} Nuevo propietario</button></div>
  <div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Propietario</th><th>Acceso</th><th>Propiedades</th><th>Mejoras</th><th class="num">Liquidación ${fmtMes(mesLiq).split(" ")[0]}</th><th></th></tr></thead>
    <tbody>${DB.owners.map(o => {
      const l = liquidacionOwner(o, mesLiq);
      const propIds = l.propsO.map(p => p.id);
      const acept = DB.mejoras.filter(m => propIds.includes(m.propiedad_id) && m.estado === "aceptada").length;
      const prop = DB.mejoras.filter(m => propIds.includes(m.propiedad_id) && m.estado === "propuesta").length;
      return `
      <tr data-owner="${o.id}" style="cursor:pointer">
      <td><b>${esc(o.nombre)}</b>${o.pais ? ` <span style="color:var(--muted)">· ${esc(o.pais)}</span>` : ""}</td>
      <td>${o.codigo_acceso ? `<span class="chip gold" title="Código para crear su cuenta">${esc(o.codigo_acceso)}</span>` : '<span class="chip ok">Con cuenta</span>'}</td>
      <td>${l.propsO.map(p => esc(p.nombre)).join(", ") || "—"}</td>
      <td>${acept ? `<span class="chip blue"><i class="d"></i>${acept} por implementar</span>` : prop ? `<span class="chip gold">${prop} propuesta${prop > 1 ? "s" : ""}</span>` : "—"}</td>
      <td class="num"><b>${l.propsO.length ? eur(l.neto) : "—"}</b></td>
      <td class="num" style="white-space:nowrap">
        <button class="btn xs outline" onclick="event.stopPropagation();openPaperLiqOwner(${o.id},'${mesLiq}')">${ICON.eye} Liquidación</button>
        <button class="btn xs outline" onclick="event.stopPropagation();openOwnerForm(${o.id})">${ICON.edit}</button>
      </td></tr>`; }).join("")}
    </tbody></table></div>`;
}

function viewPropietarioDetail() {
  const o = O(STATE.owner); if (!o) { STATE.route = "propietarios"; return viewPropietarios(); }
  const tab = STATE.ownerTab || "props";
  const propsO = DB.props.filter(p => p.propietario_id === o.id);
  const propIds = propsO.map(p => p.id);
  const resenas = DB.resenas.filter(r => propIds.includes(r.propiedad_id));
  const mejoras = DB.mejoras.filter(m => propIds.includes(m.propiedad_id));
  const tabs = [["props", `Propiedades (${propsO.length})`], ["resenas", `Reseñas (${resenas.length})`], ["mejoras", `Mejoras (${mejoras.filter(m => m.estado !== "descartada").length})`]];
  let body = "";
  if (tab === "props") {
    const sueltas = DB.props.filter(p => !p.propietario_id);
    body = `
    <div class="card"><div class="card-head"><h3>Propiedades vinculadas</h3>
      <div class="right">${sueltas.length ? `
        <select class="select" id="vinc-prop">${sueltas.map(p => `<option value="${p.id}">${esc(p.nombre)}</option>`).join("")}</select>
        <button class="btn sm sage" onclick="vincularPropUI(${o.id})">${ICON.plus} Vincular</button>` : `<span class="hint">No hay propiedades sin dueño; asígnalas también desde la ficha de cada propiedad.</span>`}</div></div>
      ${propsO.length ? propsO.map(p => `
        <div class="set-row"><div class="tx"><b>${esc(p.nombre)}</b><span>${esc(p.zona || "")} · ${(p.servicios || []).join(" · ") || "sin servicios definidos"}</span></div>
        <div class="end">
          <button class="btn xs outline" data-prop="${p.id}">${ICON.eye} Ficha</button>
          <button class="btn xs outline" onclick="desvincularPropUI(${p.id})">${ICON.x} Desvincular</button>
        </div></div>`).join("")
      : `<p class="hint">Sin propiedades vinculadas todavía.</p>`}
    </div>`;
  }
  if (tab === "resenas") body = `
    <div class="toolbar"><span class="hint">Las reseñas que registres aquí las ve el propietario en su portal.</span>
      <div class="spacer"></div><button class="btn primary sm" onclick="openResenaForm(${o.id})">${ICON.plus} Añadir reseña</button></div>
    ${resenas.length ? resenas.map(r => `
      <div class="card" style="margin-bottom:10px;display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${stars(r.puntuacion)}
            <b>${esc(r.autor || "Huésped")}</b><span class="chip line">${esc(r.canal || "")}</span>
            <span class="hint">${esc(P(r.propiedad_id)?.nombre || "")} · ${fmtCorto(r.fecha)}</span></div>
          ${r.texto ? `<p style="font-size:13.5px;margin-top:8px">«${esc(r.texto)}»</p>` : ""}
        </div>
        <button class="btn xs outline" onclick="borrarResenaUI(${r.id})">${ICON.trash}</button>
      </div>`).join("")
    : vacio(ICON.star, "Sin reseñas registradas", "Copia aquí las reseñas de Airbnb/Booking de sus propiedades: al propietario le encanta verlas.")}`;
  if (tab === "mejoras") body = `
    <div class="toolbar"><span class="hint">Propuestas del inquilino o de la agencia, con su mejora de precio por noche. El propietario las ve y puede aceptarlas.</span>
      <div class="spacer"></div><button class="btn primary sm" onclick="openMejoraForm(${o.id})">${ICON.plus} Nueva propuesta</button></div>
    ${mejoras.length ? mejoras.map(m => `
      <div class="card" style="margin-bottom:10px">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <b style="font-size:14.5px">${esc(m.titulo)}</b>
          <span class="chip ${m.origen === "inquilino" ? "lilac" : "sage"}">${m.origen === "inquilino" ? "Propuesta de inquilino" : "Propuesta de la agencia"}</span>
          ${mejoraEstadoChip(m)}
          <span class="chip gold">+${eur(m.incremento_precio)}/noche</span>
          ${m.coste_estimado ? `<span class="chip line">coste ~${eur0(m.coste_estimado)}</span>` : ""}
          <span class="hint" style="margin-left:auto">${esc(P(m.propiedad_id)?.nombre || "")}${m.autor ? " · " + esc(m.autor) : ""}</span>
        </div>
        ${m.descripcion ? `<p class="hint" style="margin-top:8px">${esc(m.descripcion)}</p>` : ""}
        ${m.estado === "implementada" ? `<p style="font-size:12.5px;color:var(--ok);font-weight:700;margin-top:8px">Este mes: +${eur(ingresoExtraMejora(m))} (${statsMesProp(m.propiedad_id, mesISO()).noches} noches × ${eur(m.incremento_precio)})</p>` : ""}
        <div style="display:flex;gap:7px;margin-top:10px;flex-wrap:wrap">
          ${m.estado === "propuesta" || m.estado === "aceptada" ? `<button class="btn xs sage" onclick="estadoMejoraUI(${m.id},'implementada')">${ICON.check} Marcar implementada</button>` : ""}
          ${m.estado !== "descartada" && m.estado !== "implementada" ? `<button class="btn xs outline" onclick="estadoMejoraUI(${m.id},'descartada')">Descartar</button>` : ""}
          <button class="btn xs outline" onclick="openMejoraForm(${o.id},${m.id})">${ICON.edit}</button>
          <button class="btn xs outline" onclick="borrarMejoraUI(${m.id})">${ICON.trash}</button>
        </div>
      </div>`).join("")
    : vacio(ICON.chart, "Sin propuestas de mejora", "Apunta aquí lo que sugieren los inquilinos y lo que detecta la agencia, con su mejora de precio: es el mejor argumento para que el propietario invierta.")}`;
  return `
  <button class="btn sm outline" style="margin-bottom:14px" data-go="propietarios">${ICON.back} Propietarios</button>
  <div class="card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
    <span class="mini-ava" style="width:44px;height:44px;font-size:15px;background:var(--gold)">${ini(o.nombre)}</span>
    <div style="flex:1;min-width:200px"><b style="font-size:18px">${esc(o.nombre)}</b>
      <div class="hint">${esc(o.pais || "")}${o.email ? " · " + esc(o.email) : ""}${o.idioma ? " · idioma " + esc(o.idioma) : ""}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      ${o.codigo_acceso ? `<span class="hint">Su acceso al portal:</span><button class="code-chip" onclick="copiar('${esc(o.codigo_acceso)}')">${esc(o.codigo_acceso)} ${ICON.copy}</button>` : `<span class="chip ok">${ICON.check} Ya tiene cuenta en el portal</span>`}
      <button class="btn sm outline" onclick="openOwnerForm(${o.id})">${ICON.edit} Editar</button>
    </div>
  </div>
  <div class="tabs">${tabs.map(t => `<button class="tab ${tab === t[0] ? "on" : ""}" onclick="STATE.ownerTab='${t[0]}';rerender()">${t[1]}</button>`).join("")}</div>
  ${body}`;
}
function paperLiqOwner(o, mes) {
  const l = liquidacionOwner(o, mes);
  return paperShell("Liquidación mensual", fmtMes(mes) + " · " + esc(o.nombre),
    `<table><thead><tr><th>Concepto</th><th class="num">Importe</th></tr></thead><tbody>
      <tr><td>Ingresos por reservas (${l.propsO.map(p => esc(p.nombre)).join(", ")})</td><td class="num">${eur(l.ingresos)}</td></tr>
      <tr><td>Gestión mensual</td><td class="num">−${eur(l.gestion)}</td></tr>
      <tr><td>Limpiezas realizadas (${l.nLimp})</td><td class="num">−${eur(l.servicios)}</td></tr>
      <tr class="total"><td>Neto a favor de ${esc(o.nombre)}</td><td class="num">${eur(l.neto)}</td></tr>
    </tbody></table>
    <p style="font-size:11.5px;color:var(--muted)">Ingresos según los importes registrados en las reservas del periodo.</p>`);
}

/* ============================================================
   CRM DE CLIENTES · huéspedes y recurrencia
   ============================================================ */
const VIA_TXT = { whatsapp: "WhatsApp", email: "Email", llamada: "Llamada", encuentro: "En persona", otro: "Otro" };
function chipUltimoContacto(c) {
  const uc = ultimoContacto(c.id);
  if (!uc) return `<span class="chip terra">Sin contactar</span>`;
  const d = diasDesde(uc.fecha);
  return `<span class="chip ${d > 90 ? "gold" : "ok"}">${VIA_TXT[uc.via] || esc(uc.via)} · ${haceTxt(uc.fecha)}</span>`;
}
function botonesContacto(c, xs) {
  const cls = xs ? "btn xs" : "btn sm";
  return `${c.telefono ? `<button class="${cls} sage" onclick="event.stopPropagation();contactarCliente(${c.id},'whatsapp')">${ICON.chat} WhatsApp</button>` : ""}
    ${c.email ? `<button class="${cls} outline" onclick="event.stopPropagation();contactarCliente(${c.id},'email')">${ICON.mail} Email</button>` : ""}`;
}
function viewClientes() {
  if (!DB.clientes.length) return vacio(ICON.chat, "Aún no hay clientes en tu agenda",
    "Un huésped que repite vale oro: reserva directa, sin comisión de portal y con la confianza ya ganada. Guarda aquí a tus inquilinos y mantén vivo el contacto para que vuelvan cada temporada.",
    `<button class="btn primary" onclick="openClienteForm()">${ICON.plus} Añadir cliente</button>`);
  const q = (STATE.cliQ || "").toLowerCase();
  const lista = DB.clientes
    .filter(c => (c.nombre + " " + (c.email || "") + " " + (c.telefono || "") + " " + (c.origen || "")).toLowerCase().includes(q))
    .map(c => ({ c, est: estanciasCliente(c.id) }))
    .sort((a, b) => (b.est[0]?.entrada || "").localeCompare(a.est[0]?.entrada || "") || a.c.nombre.localeCompare(b.c.nombre));
  const recurrentes = DB.clientes.filter(c => estanciasCliente(c.id).length >= 2).length;
  const frios = DB.clientes.filter(c => { const uc = ultimoContacto(c.id); return !uc || diasDesde(uc.fecha) > 90; }).length;
  return `
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.users} Clientes</div><div class="val">${DB.clientes.length}</div><div class="sub">en tu agenda</div></div>
    <div class="kpi"><div class="lab">${ICON.star} Recurrentes</div><div class="val">${recurrentes}</div><div class="sub">con 2 o más estancias</div></div>
    <div class="kpi"><div class="lab">${ICON.chat} Por retomar</div><div class="val">${frios}</div><div class="sub">sin contacto en 3 meses</div></div>
  </div>
  <div class="toolbar">
    <input class="input" style="min-width:220px" placeholder="Buscar cliente, email o teléfono…" value="${esc(STATE.cliQ || "")}" oninput="STATE.cliQ=this.value;rerender(true)">
    <span class="hint">Toca a un cliente para ver sus estancias y el historial de comunicación.</span>
    <div class="spacer"></div>
    <button class="btn primary sm" onclick="openClienteForm()">${ICON.plus} Nuevo cliente</button></div>
  <div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Cliente</th><th>Contacto</th><th>Estancias</th><th>Último contacto</th><th></th></tr></thead>
    <tbody>${lista.map(({ c, est }) => `
      <tr data-cli="${c.id}" style="cursor:pointer">
      <td><b>${esc(c.nombre)}</b> ${est.length >= 2 ? `<span class="chip gold" title="Ha repetido estancia">★ recurrente</span>` : ""}
        <div class="hint">${esc(c.origen || "")}${c.idioma ? " · " + esc(c.idioma) : ""}</div></td>
      <td style="font-size:13px">${c.telefono ? esc(c.telefono) : ""}${c.telefono && c.email ? "<br>" : ""}${c.email ? esc(c.email) : (c.telefono ? "" : "—")}</td>
      <td>${est.length ? (est[0].entrada > hoyISO() ? `<b>${est.length}</b> · próxima el ${fmtCorto(est[0].entrada)}` : `<b>${est.length}</b> · última ${haceTxt(est[0].entrada + "T12:00")}`) : '<span class="hint">sin estancias aún</span>'}</td>
      <td>${chipUltimoContacto(c)}</td>
      <td class="num" style="white-space:nowrap">${botonesContacto(c, true)}
        <button class="btn xs outline" onclick="event.stopPropagation();openClienteForm(${c.id})">${ICON.edit}</button></td>
      </tr>`).join("")}
    </tbody></table></div>`;
}
function viewClienteDetail() {
  const c = CL(STATE.cli); if (!c) { STATE.route = "clientes"; return viewClientes(); }
  const est = estanciasCliente(c.id);
  const contactos = contactosDe(c.id);
  const noches = est.reduce((a, r) => a + Math.round((new Date(r.salida + "T12:00") - new Date(r.entrada + "T12:00")) / 864e5), 0);
  const gasto = est.reduce((a, r) => a + (+r.importe || 0), 0);
  const uc = ultimoContacto(c.id);
  const proxima = est.filter(r => r.entrada > hoyISO()).pop();
  const pasadas = est.filter(r => r.entrada <= hoyISO());
  const sueltas = DB.reservas.filter(r => !r.cliente_id && r.estado !== "bloqueo" && r.huesped).sort((a, b) => b.entrada.localeCompare(a.entrada));
  const retomar = !proxima && pasadas[0] && pasadas[0].salida < hoyISO() && (!uc || new Date(uc.fecha) < new Date(pasadas[0].salida + "T12:00"));
  return `
  <button class="btn sm outline" style="margin-bottom:14px" data-go="clientes">${ICON.back} Clientes</button>
  <div class="card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
    <span class="mini-ava" style="width:44px;height:44px;font-size:15px;background:var(--gold)">${ini(c.nombre)}</span>
    <div style="flex:1;min-width:200px"><b style="font-size:18px">${esc(c.nombre)}</b>
      ${est.length >= 2 ? `<span class="chip gold" style="margin-left:8px">★ recurrente</span>` : ""}
      <div class="hint">${esc(c.origen || "")}${c.idioma ? " · idioma " + esc(c.idioma) : ""}${c.telefono ? " · " + esc(c.telefono) : ""}${c.email ? " · " + esc(c.email) : ""}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${botonesContacto(c)}
      <button class="btn sm outline" onclick="openClienteForm(${c.id})">${ICON.edit} Editar</button></div>
  </div>
  ${retomar ? `<div class="card aviso-cli" style="margin-bottom:16px;border-left:4px solid var(--gold)"><b style="font-size:13.5px">${ICON.chat} Buen momento para escribirle</b>
    <p class="hint" style="margin-top:4px">Su última estancia terminó ${haceTxt(pasadas[0].salida + "T12:00")} y no le habéis contactado después. Un mensaje a tiempo es la mejor forma de que repita el próximo verano.</p></div>` : ""}
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.cal} Estancias</div><div class="val">${est.length}</div><div class="sub">${proxima ? "entra el " + fmtCorto(proxima.entrada) : pasadas[0] ? "última " + haceTxt(pasadas[0].entrada + "T12:00") : "todavía ninguna"}</div></div>
    <div class="kpi"><div class="lab">${ICON.sun} Noches</div><div class="val">${noches}</div><div class="sub">en total</div></div>
    <div class="kpi"><div class="lab">${ICON.euro} Facturado</div><div class="val">${eur0(gasto)}</div><div class="sub">suma de sus reservas</div></div>
    <div class="kpi"><div class="lab">${ICON.chat} Último contacto</div><div class="val" style="font-size:20px">${uc ? haceTxt(uc.fecha) : "nunca"}</div><div class="sub">${uc ? "por " + (VIA_TXT[uc.via] || esc(uc.via)).toLowerCase() : "aún sin contactar"}</div></div>
  </div>
  <div class="grid" style="grid-template-columns:1.1fr .9fr;align-items:start">
    <div class="card">
      <div class="card-head"><h3>Comunicación</h3>
        <div class="right"><button class="btn sm sage" onclick="openContactoForm(${c.id})">${ICON.plus} Registrar contacto</button></div></div>
      <p class="hint" style="margin-bottom:4px">Los botones de WhatsApp y Email dejan apuntado el contacto aquí automáticamente.</p>
      ${contactos.length ? contactos.map(x => `
        <div class="set-row"><div class="tx"><b>${VIA_TXT[x.via] || esc(x.via)}</b>
          <span>${x.nota ? esc(x.nota) + " · " : ""}${fmtCorto(x.fecha.slice(0, 10))} (${haceTxt(x.fecha)})${x.autor ? " · " + esc(x.autor) : ""}</span></div>
        <div class="end"><button class="btn xs outline" onclick="borrarContactoUI(${x.id})">${ICON.trash}</button></div></div>`).join("")
      : `<p class="hint" style="padding:10px 0">Sin contactos registrados todavía.</p>`}
    </div>
    <div>
      <div class="card">
        <div class="card-head"><h3>Estancias</h3></div>
        ${est.length ? est.map(r => `
          <div class="set-row"><div class="tx"><b>${esc(P(r.propiedad_id)?.nombre || "Propiedad")}</b>
            <span>${fmtCorto(r.entrada)} → ${fmtCorto(r.salida)}${r.canal ? " · " + esc(r.canal) : ""}${r.importe ? " · " + eur0(r.importe) : ""}</span></div>
          <div class="end"><button class="btn xs outline" title="Quitar de este cliente" onclick="desvincularReservaCli(${r.id})">${ICON.x}</button></div></div>`).join("")
        : `<p class="hint" style="padding:10px 0">Sin estancias vinculadas. Vincula sus reservas para ver su historial completo.</p>`}
        ${sueltas.length ? `
        <div class="set-row"><div class="tx" style="flex:1">
          <select class="select" id="cli-res-vinc" style="max-width:100%">${sueltas.map(r => `<option value="${r.id}">${esc(r.huesped)} · ${esc(P(r.propiedad_id)?.nombre || "")} · ${fmtCorto(r.entrada)}</option>`).join("")}</select></div>
        <div class="end"><button class="btn xs sage" onclick="vincularReservaCli(${c.id})">${ICON.plus} Vincular reserva</button></div></div>` : ""}
      </div>
      ${c.notas ? `<div class="card" style="margin-top:16px"><div class="card-head"><h3>Notas</h3></div><p style="font-size:13.5px;white-space:pre-wrap">${esc(c.notas)}</p></div>` : ""}
    </div>
  </div>`;
}

/* ============================================================
   PORTAL DEL PROPIETARIO (rol 'propietario')
   ============================================================ */
function ownPropActual() {
  const mias = misProps();
  if (!mias.length) return null;
  return mias.find(p => p.id === STATE.ownProp) || mias[0];
}
function ownSelector() {
  const mias = misProps();
  if (mias.length < 2) return "";
  return `<select class="select" onchange="STATE.ownProp=+this.value;rerender()">
    ${mias.map(p => `<option value="${p.id}" ${ownPropActual()?.id === p.id ? "selected" : ""}>${esc(p.nombre)}</option>`).join("")}</select>`;
}
function viewOwnerHome() {
  const o = miOwner();
  const p = ownPropActual();
  if (!p) return vacio(ICON.house, "Tu cuenta aún no tiene propiedades vinculadas", "Hygge Services te la vinculará en cuanto esté dada de alta. Si crees que es un error, escríbenos.");
  const mes = mesISO();
  const st = statsMesProp(p.id, mes);
  const extraMes = DB.mejoras.filter(m => m.propiedad_id === p.id && m.estado === "implementada").reduce((a, m) => a + ingresoExtraMejora(m, mes), 0);
  const hoyOcupada = DB.reservas.some(r => r.propiedad_id === p.id && r.estado === "confirmada" && r.entrada <= hoyISO() && hoyISO() < r.salida);
  const proxima = DB.reservas.filter(r => r.propiedad_id === p.id && r.entrada >= hoyISO() && r.estado === "confirmada").sort((a, b) => a.entrada.localeCompare(b.entrada))[0];
  const feed = [
    ...DB.tareas.filter(t => t.propiedad_id === p.id && t.estado === "hecha").slice(-6).map(t => ({
      f: t.fecha, ic: ICON.broom, cl: "ok", b: (t.tipo === "limpieza" ? "Limpieza realizada" : "Servicio realizado"),
      s: `${(t.fotos || []).length ? (t.fotos.length + " foto" + (t.fotos.length > 1 ? "s" : "") + " del estado") : "por el equipo Hygge"}${t.notas_equipo ? " · «" + esc(t.notas_equipo) + "»" : ""}`, fotos: t.fotos || [] })),
    ...DB.incidencias.filter(i => i.propiedad_id === p.id).slice(0, 4).map(i => ({
      f: i.created_at.slice(0, 10), ic: ICON.alert, cl: i.estado === "resuelta" ? "ok" : "terra",
      b: (i.estado === "resuelta" ? "Incidencia resuelta: " : "Incidencia en gestión: ") + esc(i.titulo), s: i.estado === "resuelta" ? "resuelta por el equipo Hygge" : "nos estamos ocupando", fotos: [] })),
  ].sort((a, b) => b.f.localeCompare(a.f)).slice(0, 8);
  return `
  <div class="dash-hero">
    <div><h2>Hola${o ? ", " + esc(o.nombre) : ""} 👋</h2>
      <div class="date">${fmtDia(hoyISO())} · así está tu casa hoy</div></div>
    <div class="season">${ownSelector()}</div>
  </div>
  <div class="prop-hero">
    ${coverProp(p)}
    <div class="inner">
      <div><h2>${esc(p.nombre)}</h2><div class="loc">${ICON.pin} ${esc(p.zona || "")}</div></div>
      <div class="right">${hoyOcupada ? '<span class="chip gold"><i class="d"></i>Ocupada ahora</span>' : '<span class="chip ok"><i class="d"></i>Libre hoy</span>'}
        ${proxima ? `<span class="chip line">Próxima entrada: ${fmtCorto(proxima.entrada)}</span>` : ""}</div>
    </div>
  </div>
  <div class="kpis" style="margin:16px 0">
    <div class="kpi"><div class="lab">${ICON.cal} Noches este mes</div><div class="val">${st.noches}<small>/${st.dias}</small></div><div class="sub">${st.ocup}% de ocupación</div></div>
    <div class="kpi"><div class="lab">${ICON.euro} Ingresos por reservas</div><div class="val">${eur0(st.ingresos)}</div><div class="sub">entradas de este mes</div></div>
    <div class="kpi"><div class="lab">${ICON.broom} Servicios realizados</div><div class="val">${tareasPropMes(p.id, mes).length}</div><div class="sub">limpiezas y mantenimiento</div></div>
    <div class="kpi"><div class="lab">${ICON.chart} Extra por mejoras</div><div class="val" style="${extraMes ? "color:var(--ok)" : ""}">${extraMes ? "+" + eur0(extraMes) : "—"}</div><div class="sub">${extraMes ? "este mes, por mejoras implementadas" : "mira la pestaña Mejoras"}</div></div>
  </div>
  <div class="dash-grid">
    <div class="card"><div class="card-head"><h3>Qué está pasando en tu casa</h3></div>
      ${feed.length ? feed.map(x => `
        <div class="agenda-item">
          <span class="agenda-hour">${fmtCorto(x.f)}</span>
          <span class="ic" style="background:var(--${x.cl}-soft);color:var(--${x.cl})">${x.ic}</span>
          <div class="tx"><b>${x.b}</b><span>${x.s}</span></div>
        </div>
        ${x.fotos.length ? `<div class="thumbs" style="margin:0 0 10px 58px">${x.fotos.slice(0, 4).map(f => `<a href="#" onclick="event.preventDefault();abrirDoc('${esc(f)}')"><img data-foto="${esc(f)}" alt=""></a>`).join("")}</div>` : ""}`).join("")
      : `<div class="empty">${ICON.check}Sin actividad reciente.</div>`}
    </div>
    <div class="card"><div class="card-head"><h3>Calendario</h3>
      <div class="right"><span class="month-nav">
        <button onclick="STATE.propMes='${addMeses(STATE.propMes || mesISO(), -1)}';rerender()">${ICON.left}</button><b>${fmtMes(STATE.propMes || mesISO())}</b>
        <button onclick="STATE.propMes='${addMeses(STATE.propMes || mesISO(), 1)}';rerender()">${ICON.right}</button></span></div></div>
      ${calendarioProp(p, STATE.propMes || mesISO(), true)}
    </div>
  </div>`;
}

function viewOwnerResenas() {
  const propIds = misProps().map(p => p.id);
  const rs = DB.resenas.filter(r => propIds.includes(r.propiedad_id));
  const media = rs.length ? Math.round(rs.reduce((a, r) => a + r.puntuacion, 0) / rs.length * 10) / 10 : 0;
  return `
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.star} Valoración media</div><div class="val">${media || "—"}</div><div class="sub">${rs.length} reseña${rs.length === 1 ? "" : "s"}</div></div>
    <div class="kpi"><div class="lab">${ICON.check} 5 estrellas</div><div class="val">${rs.filter(r => r.puntuacion === 5).length}</div><div class="sub">de ${rs.length}</div></div>
  </div>
  ${rs.length ? rs.map(r => `
    <div class="card" style="margin-bottom:10px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${stars(r.puntuacion)}
        <b>${esc(r.autor || "Huésped")}</b><span class="chip line">${esc(r.canal || "")}</span>
        <span class="hint" style="margin-left:auto">${esc(P(r.propiedad_id)?.nombre || "")} · ${fmtCorto(r.fecha)}</span></div>
      ${r.texto ? `<p style="font-size:14px;margin-top:8px">«${esc(r.texto)}»</p>` : ""}
    </div>`).join("")
  : vacio(ICON.star, "Aún sin reseñas", "Cuando tus huéspedes valoren su estancia, las verás aquí.")}`;
}

function viewOwnerMejoras() {
  const propIds = misProps().map(p => p.id);
  const todas = DB.mejoras.filter(m => propIds.includes(m.propiedad_id));
  const propuestas = todas.filter(m => m.estado === "propuesta");
  const aceptadas = todas.filter(m => m.estado === "aceptada");
  const implementadas = todas.filter(m => m.estado === "implementada");
  const extraMes = implementadas.reduce((a, m) => a + ingresoExtraMejora(m), 0);
  const sel = STATE.mejorasSel;
  const selMejoras = propuestas.filter(m => sel.has(m.id));
  const extraNoche = selMejoras.reduce((a, m) => a + (+m.incremento_precio || 0), 0);
  const extraProy = selMejoras.reduce((a, m) => a + (+m.incremento_precio || 0) * nochesReferencia(m.propiedad_id), 0);
  return `
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.chart} Propuestas abiertas</div><div class="val">${propuestas.length}</div><div class="sub">de inquilinos y de Hygge</div></div>
    <div class="kpi"><div class="lab">${ICON.check} Implementadas</div><div class="val">${implementadas.length}</div><div class="sub">${aceptadas.length ? aceptadas.length + " aceptadas en marcha" : "mejorando tu precio/noche"}</div></div>
    <div class="kpi"><div class="lab">${ICON.euro} Extra este mes</div><div class="val" style="${extraMes ? "color:var(--ok)" : ""}">${extraMes ? "+" + eur0(extraMes) : "—"}</div><div class="sub">por las mejoras ya implementadas</div></div>
  </div>

  ${propuestas.length ? `
  <div class="card" style="margin-bottom:16px;background:linear-gradient(120deg,#fff,#f7f1e2)">
    <div class="card-head"><h3>Simulador: ¿y si las implemento?</h3>
      <span class="sub">marca propuestas y mira cuánto subiría tu precio por noche y tus ingresos del mes</span></div>
    <div class="check-list">
      ${propuestas.map(m => `
        <button class="check-item sim ${sel.has(m.id) ? "on" : ""}" onclick="toggleMejoraSel(${m.id})">
          <span class="bx">${ICON.check}</span>
          <span style="flex:1;text-align:left">${esc(m.titulo)}
            <span class="hint" style="display:block;font-weight:400">${m.origen === "inquilino" ? "lo piden tus huéspedes" : "propuesta de Hygge"}${m.coste_estimado ? " · inversión ~" + eur0(m.coste_estimado) : ""} · ${esc(P(m.propiedad_id)?.nombre || "")}</span></span>
          <span class="chip gold">+${eur(m.incremento_precio)}/noche</span>
        </button>`).join("")}
    </div>
    <div style="display:flex;gap:16px;align-items:center;margin-top:16px;flex-wrap:wrap">
      <div class="fact" style="flex:1;min-width:190px"><div class="k">Tu precio subiría</div><div class="v" style="font-size:19px">+${eur(extraNoche)} /noche</div></div>
      <div class="fact" style="flex:1;min-width:190px;background:var(--ok-soft)"><div class="k">Ingresos extra estimados</div><div class="v" style="font-size:19px;color:var(--ok)">+${eur0(extraProy)} /mes</div></div>
      <button class="btn primary" ${sel.size ? "" : "disabled"} onclick="aceptarMejorasSel()">${ICON.check} Me interesan: adelante</button>
    </div>
    <p class="form-note">Estimación con las noches ocupadas del último mes. Al aceptar, Hygge se pone en marcha y te confirma coste y fechas.</p>
  </div>` : ""}

  ${aceptadas.length ? `<div class="card" style="margin-bottom:16px"><div class="card-head"><h3>Aceptadas · en marcha</h3></div>
    ${aceptadas.map(m => `<div class="set-row"><div class="tx"><b>${esc(m.titulo)}</b><span>+${eur(m.incremento_precio)}/noche en cuanto esté lista · ${esc(P(m.propiedad_id)?.nombre || "")}</span></div>
    <div class="end"><span class="chip blue"><i class="d"></i>Hygge trabajando en ello</span></div></div>`).join("")}</div>` : ""}

  ${implementadas.length ? `<div class="card"><div class="card-head"><h3>Implementadas · ya generan ingresos</h3></div>
    ${implementadas.map(m => `<div class="set-row"><div class="tx"><b>${esc(m.titulo)}</b>
      <span>desde ${m.implementada_at ? fmtCorto(m.implementada_at) : "—"} · ${esc(P(m.propiedad_id)?.nombre || "")}</span></div>
    <div class="end"><span class="chip ok">+${eur(ingresoExtraMejora(m))} este mes</span></div></div>`).join("")}</div>` : ""}

  ${!todas.length ? vacio(ICON.chart, "Sin propuestas todavía", "Cuando tus huéspedes o el equipo Hygge detecten mejoras que suban el valor de tu casa, aparecerán aquí con su impacto en precio.") : ""}`;
}

function viewOwnerLiq() {
  const o = miOwner(); if (!o) return "";
  const mes = STATE.liqMes || addMeses(mesISO(), -1);
  return `
  <div class="toolbar">
    <span class="month-nav">
      <button onclick="STATE.liqMes='${addMeses(mes, -1)}';rerender()">${ICON.left}</button><b style="text-transform:capitalize">${fmtMes(mes)}</b>
      <button onclick="STATE.liqMes='${addMeses(mes, 1)}';rerender()">${ICON.right}</button>
    </span>
    <div class="spacer"></div>
    <button class="btn sm outline" onclick="printPaper()">${ICON.print} Descargar PDF</button>
  </div>
  ${paperLiqOwner(o, mes)}`;
}

/* ============================================================
   AJUSTES
   ============================================================ */
function viewAjustes() {
  const emp = DB.ajustes.empresa || {};
  const serie = DB.ajustes.factura_serie || { prefijo: "HSM", n: 0 };
  const chk = DB.ajustes.checklist_base || [];
  const sinCuenta = DB.emp.filter(e => e.activo && e.codigo_acceso);
  return `
  <div class="grid" style="grid-template-columns:1fr 1fr">
    <div class="card"><div class="card-head"><h3>Datos de la empresa</h3><span class="sub">salen en informes y facturas</span></div>
      <div class="inline-form">
        ${[["nombre", "Razón social"], ["cif", "CIF"], ["direccion", "Dirección"], ["telefono", "Teléfono"], ["email", "Email"], ["iban", "IBAN (para facturas)"]].map(([k, l]) => `
          <div class="f-field"><label>${l}</label><input id="emp-${k}" value="${esc(emp[k] || "")}"></div>`).join("")}
        <button class="btn primary sm" onclick="guardarEmpresa()">${ICON.check} Guardar</button>
      </div></div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card"><div class="card-head"><h3>Facturación</h3></div>
        <div class="facts" style="grid-template-columns:1fr 1fr">
          <div class="fact"><div class="k">Serie</div><div class="v">${esc(serie.prefijo)}-${new Date().getFullYear()}-…</div></div>
          <div class="fact"><div class="k">Próximo número</div><div class="v">${String((+serie.n || 0) + 1).padStart(3, "0")}</div></div>
        </div>
        <p class="form-note">La numeración es correlativa e inalterable (se asigna al emitir, nunca al crear el borrador): preparado para VeriFactu.</p></div>
      <div class="card"><div class="card-head"><h3>Usuarios y accesos</h3></div>
        ${DB.pendientes.length ? DB.pendientes.map(p => `
          <div class="set-row"><div class="tx"><b>${esc(p.nombre || "Sin nombre")}</b><span>cuenta pendiente de activar</span></div>
          <div class="end"><button class="btn xs sage" onclick="activarDireccionUI('${p.id}')">${ICON.check} Activar como dirección</button></div></div>`).join("")
        : `<p class="hint" style="margin-bottom:10px">No hay cuentas pendientes.</p>`}
        <div class="set-row"><div class="tx"><b>Códigos de equipo activos</b>
          <span>${sinCuenta.length ? sinCuenta.map(e => esc(e.nombre.split(" ")[0]) + " (" + esc(e.codigo_acceso) + ")").join(" · ") : "todos los empleados tienen cuenta o no hay códigos"}</span></div></div>
        <div class="set-row"><div class="tx"><b>Acceso de la lavandería</b>
          <span>con este código la lavandería crea su cuenta: solo ve y actualiza el estado de la ropa</span></div>
          <div class="end">${DB.lavAcceso ? `
            <button class="code-chip" onclick="copiar('${esc(DB.lavAcceso.codigo_acceso)}')">${esc(DB.lavAcceso.codigo_acceso)} ${ICON.copy}</button>
            <button class="btn xs outline" title="Generar código nuevo" onclick="regenLavUI()">↻</button>`
          : '<span class="hint">activa esta función ejecutando el schema actualizado</span>'}</div></div>
      </div>
    </div>
    <div class="card"><div class="card-head"><h3>Checklist de limpieza</h3><span class="sub">plantilla que se copia a cada nuevo servicio</span></div>
      <div id="chk-admin">${chk.map((c, i) => `
        <div class="set-row"><div class="tx"><b>${i + 1}. ${esc(c)}</b></div>
        <div class="end"><button class="btn xs outline" onclick="quitarChecklist(${i})">${ICON.x}</button></div></div>`).join("") || '<p class="hint">Sin pasos. Añade el primero.</p>'}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <input class="input" id="chk-new" placeholder="Añadir paso…" style="flex:1">
        <button class="btn sm sage" onclick="addChecklistStep()">${ICON.plus} Añadir</button>
      </div></div>
    <div class="card"><div class="card-head"><h3>Fichajes y asistencia</h3></div>
      <div class="set-row"><div class="tx"><b>Foto obligatoria al fichar</b><span>entrada y salida requieren foto: confirma presencia y estado</span></div>
        <div class="end"><button class="toggle ${fotoFichajeObligatoria() ? "on" : ""}" onclick="toggleFotoFichaje(this)"></button></div></div>
      <div class="set-row"><div class="tx"><b>Detección de ausencias</b><span>día con trabajo asignado y sin fichaje → aviso en la ficha del trabajador</span></div>
        <div class="end"><span class="chip ok"><i class="d"></i>Activa</span></div></div>
    </div>
    <div class="card"><div class="card-head"><h3>Conexión</h3></div>
      <div class="set-row"><div class="tx"><b>Base de datos</b><span>Supabase · ${esc((HYGGE_CONFIG.SUPABASE_URL || "").replace("https://", ""))}</span></div>
        <div class="end"><span class="chip ok"><i class="d"></i>Conectada</span></div></div>
      <div class="set-row"><div class="tx"><b>Tiempo real</b><span>fichajes, tareas, posiciones e incidencias</span></div>
        <div class="end"><span class="chip ok"><i class="d"></i>Activo</span></div></div>
      <div class="set-row"><div class="tx"><b>Copias de seguridad</b><span>diarias, automáticas (Supabase)</span></div>
        <div class="end"><span class="chip ok">Incluidas</span></div></div>
    </div>
  </div>`;
}

/* ============================================================
   LAVANDERÍA · estado de la ropa por propiedad
   ============================================================ */
function viewRopa() {
  const orden = { lista: 0, proceso: 1, enviada: 2, vacio: 3 };
  const props = DB.props.filter(p => p.activa)
    .sort((a, b) => orden[ropaDe(a.id).estado] - orden[ropaDe(b.id).estado] || a.nombre.localeCompare(b.nombre));
  if (!props.length) return vacio(ICON.broom, "Sin propiedades activas",
    "Cuando haya propiedades, aquí se controla en qué estado está la ropa de cada una.");
  const fuera = props.filter(p => ropaDe(p.id).estado !== "vacio").length;
  const listas = props.filter(p => ropaDe(p.id).estado === "lista").length;
  return `
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.broom} Ropa fuera</div><div class="val">${fuera}</div><div class="sub">propiedades con ropa en la lavandería</div></div>
    <div class="kpi"><div class="lab">${ICON.check} Lista para recoger</div><div class="val">${listas}</div><div class="sub">${listas ? "pásate a por ella" : "nada pendiente de recoger"}</div></div>
  </div>
  <div class="toolbar"><span class="hint">${STATE.role === "lavanderia"
    ? "Toca el estado de la ropa de cada propiedad: la oficina y el equipo lo ven al momento."
    : "Estado en tiempo real por propiedad · lo actualiza la propia lavandería desde su acceso (y también podéis tocarlo aquí, p. ej. al recogerla)."}</span></div>
  ${props.map(p => { const r = ropaDe(p.id); return `
  <div class="card ropa-card">
    <div class="tx"><b>Ropa de ${esc(p.nombre)}</b>
      <span class="hint">${esc(p.zona || "")}${r.estado !== "vacio" && r.updated_at ? ` · ${haceTxt(r.updated_at)}${r.updated_by ? " por " + esc(r.updated_by) : ""}` : ""}</span></div>
    <div class="ropa-est">${Object.entries(ROPA_ESTADOS).map(([k, txt]) => `
      <button class="ropa-btn ${k} ${r.estado === k ? "on" : ""}" onclick="setRopaUI(${p.id},'${k}')">${txt}</button>`).join("")}
    </div>
  </div>`; }).join("")}`;
}

/* ============================================================
   EMPLEADO (rol equipo)
   ============================================================ */
function viewMiDia() {
  const me = miEmp();
  if (!me) return vacio(ICON.users, "Cuenta sin ficha de empleado",
    "Tu cuenta está activa pero no está vinculada a una ficha. Pide a la oficina tu código de equipo o que te vincule.");
  const f = fichajeAbierto(me.id);
  const enPausa = f && pausaAbierta(f.id);
  const misTareas = DB.tareas.filter(t => t.fecha === hoyISO() && (t.equipo_ids || []).includes(me.id))
    .sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));
  return `
  <div class="emp-hero">
    <div><div class="hi">Hola, ${esc(me.nombre.split(" ")[0])} ☀️</div>
      <div class="sub">${fmtDia(hoyISO())}${f ? ` · entrada a las <b style="color:#f2d999">${fmtHora(f.entrada)}</b>` : " · aún sin fichar"}</div>
      <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="fichar-btn ${f ? "out" : ""}" onclick="${f ? "ficharSalidaUI()" : "ficharEntradaUI()"}" id="btn-fichar">${ICON.clock} ${f ? "Fichar salida" : "Fichar entrada"}</button>
        ${f ? `<button class="btn ghost-light btn-ghost-light" style="border-color:rgba(255,255,255,.3)" onclick="pausaUI()">${ICON.coffee} ${enPausa ? "Volver del descanso" : "Descanso"}</button>` : ""}
      </div>
    </div>
    <div class="timer"><div class="l">${enPausa ? "En descanso" : "Jornada de hoy"}</div><div class="t" id="emp-timer">${f ? "" : "—"}</div></div>
  </div>
  <div class="grid" style="grid-template-columns:1.5fr 1fr">
    <div>
      <div class="card-head" style="margin:4px 0 12px"><h3>Mis servicios de hoy · ${misTareas.length}</h3></div>
      ${misTareas.length ? misTareas.map(t => {
        const p = P(t.propiedad_id) || {};
        const chkOk = (t.checklist || []).filter(c => c.ok).length, chkTot = (t.checklist || []).length;
        return `
        <div class="task-card ${t.estado === "hecha" ? "done" : ""}">
          <span class="ic" style="background:var(--${t.estado === "hecha" ? "ok" : t.estado === "encurso" ? "gold" : "gray"}-soft);color:var(--${t.estado === "hecha" ? "ok" : t.estado === "encurso" ? "gold-deep" : "muted"})">${t.estado === "hecha" ? ICON.check : ICON.broom}</span>
          <div class="tx"><b>${esc(p.nombre || "")}</b>
            <span>${(t.hora_inicio || "").slice(0, 5)}${t.hora_fin ? "–" + t.hora_fin.slice(0, 5) : ""} · ${t.tipo}${p.llave ? " · llaves " + esc(p.llave) : ""}${t.descripcion ? " · " + esc(t.descripcion) : ""}</span></div>
          <div class="act">
            ${t.estado === "pendiente" ? `<button class="btn sm primary" onclick="tareaLlegada(${t.id})">${ICON.pin} He llegado</button>` : ""}
            ${t.estado === "encurso" ? `
              <button class="btn sm outline" onclick="openChecklist(${t.id})">${ICON.check} Checklist (${chkOk}/${chkTot})</button>
              <button class="btn sm outline" onclick="openCompraRapida(${t.propiedad_id})" title="Añadir a la lista de compras">🛒 Falta algo</button>
              <button class="btn sm primary" ${chkTot && chkOk === chkTot ? "" : "disabled"} onclick="openFinalizarModal(${t.id})">${ICON.check} Finalizar</button>` : ""}
            ${t.estado === "hecha" ? `<span class="chip ok">Hecha${chkTot ? " · checklist " + Math.round(chkOk / chkTot * 100) + "%" : ""}</span>` : ""}
          </div>
        </div>`; }).join("")
      : `<div class="empty">${ICON.sun}No tienes servicios asignados hoy.</div>`}
      ${f && !misTareas.some(t => t.estado === "encurso") ? `
      <div class="task-card" style="border-style:dashed">
        <span class="ic" style="background:var(--sage-soft);color:var(--sage)">${ICON.pin}</span>
        <div class="tx"><b>¿Trabajas en una propiedad no planificada?</b><span>Abre el trabajo aquí: quedará registrada tu llegada, salida y las horas en esa casa.</span></div>
        <div class="act"><button class="btn sm sage" onclick="openTareaAdhoc()">${ICON.plus} Empezar trabajo</button></div>
      </div>` : ""}
      <div class="task-card" style="border-style:dashed">
        <span class="ic" style="background:var(--terra-soft);color:var(--terra)">${ICON.alert}</span>
        <div class="tx"><b>¿Ha pasado algo en el inmueble?</b><span>Rotura, avería, falta algo… avisa con foto y llega al momento a la oficina.</span></div>
        <div class="act"><button class="btn sm danger" onclick="openNuevaIncidencia()">${ICON.camera} Reportar incidencia</button></div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card"><div class="card-head"><h3>Mi semana</h3></div>
        <div class="chart-box" style="height:150px"><canvas id="chart-emp"></canvas></div>
        <p class="hint" style="margin-top:8px">Horas fichadas por día (pausas descontadas).</p></div>
      ${DB.lavanderia.some(l => l.estado !== "vacio") ? `
      <div class="card"><div class="card-head"><h3>Ropa en lavandería</h3><div class="right"><button class="btn xs outline" data-go="ropa">${ICON.eye} Ver</button></div></div>
        ${DB.lavanderia.filter(l => l.estado !== "vacio").map(l => `
          <div class="set-row"><div class="tx"><b>${esc(P(l.propiedad_id)?.nombre || "")}</b><span>${haceTxt(l.updated_at)}</span></div>
          <div class="end"><span class="chip ${l.estado === "lista" ? "ok" : l.estado === "proceso" ? "gold" : "blue"}">${ROPA_ESTADOS[l.estado]}</span></div></div>`).join("")}
      </div>` : ""}
      <div class="card"><div class="card-head"><h3>Mi posición</h3></div>
        <p class="hint" style="margin-bottom:12px">La oficina ve tu posición en el mapa solo mientras tienes la jornada abierta.</p>
        <button class="btn sm outline" onclick="actualizarPosicionUI()">${ICON.gps} Actualizar mi posición</button></div>
    </div>
  </div>`;
}
function mountMiDia() {
  const me = miEmp(); if (!me) return;
  const dias = ["L", "M", "X", "J", "V", "S", "D"];
  const iniSemana = addDias(hoyISO(), -((new Date().getDay() + 6) % 7));
  const data = dias.map((d, i) => {
    const dia = addDias(iniSemana, i);
    return [d, dia > hoyISO() ? 0 : horasEmpleadoRango(me.id, dia, dia)];
  });
  drawBars("chart-emp", data, { hi: (new Date().getDay() + 6) % 7 });
  startEmpTimer();
}
/* mi horario: las próximas 3 semanas (compartido entre la app del trabajador y su ficha en dirección) */
const TIPO_TXT = { limpieza: "Limpieza", mantenimiento: "Mantenimiento", piscina: "Piscina / jardín", otro: "Servicio" };
function horarioEmp(empId, desde) {
  const dias = Array.from({ length: 21 }, (_, i) => addDias(desde || hoyISO(), i));
  const de = d => DB.tareas.filter(t => t.fecha === d && (t.equipo_ids || []).includes(empId))
    .sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));
  return { dias, de };
}
function mhSemanasHTML(empId) {
  const { dias, de } = horarioEmp(empId);
  const semanas = [];
  dias.forEach(d => {
    const lunes = addDias(d, -((new Date(d + "T12:00").getDay() + 6) % 7));
    let s = semanas.find(x => x.lunes === lunes);
    if (!s) { s = { lunes, dias: [] }; semanas.push(s); }
    s.dias.push(d);
  });
  return semanas.map(s => {
    const h = s.dias.reduce((a, d) => a + de(d).reduce((x, t) => x + horasTarea(t), 0), 0);
    return `
    <div class="card" style="margin-bottom:14px">
      <div class="card-head"><h3>Semana del ${fmtCorto(s.lunes)}</h3><span class="sub">${Math.round(h)} h previstas</span></div>
      ${s.dias.map(d => { const ts = de(d); return `
        <div class="mh-dia ${d === hoyISO() ? "hoy" : ""} ${ts.length ? "" : "libre"}">
          <div class="mh-fecha"><b>${new Date(d + "T12:00").toLocaleDateString("es-ES", { weekday: "short" })}</b><span>${new Date(d + "T12:00").getDate()}</span></div>
          <div class="mh-tareas">${ts.length ? ts.map(t => { const p = P(t.propiedad_id) || {}; const compis = (t.equipo_ids || []).filter(id => id !== empId).map(id => S(id)?.nombre.split(" ")[0]).filter(Boolean); return `
            <div class="mh-tarea t-${t.tipo}">
              <b class="hr">${(t.hora_inicio || "").slice(0, 5)}${t.hora_fin ? "–" + t.hora_fin.slice(0, 5) : ""}</b>
              <div class="tx"><b>${esc(p.nombre || "")}</b>
                <span>${TIPO_TXT[t.tipo] || esc(t.tipo)}${p.zona ? " · " + esc(p.zona) : ""}${p.llave ? " · llaves " + esc(p.llave) : ""}${t.descripcion ? " · " + esc(t.descripcion) : ""}${compis.length ? " · con " + compis.join(", ") : ""}</span></div>
            </div>`; }).join("") : `<span class="mh-libre">Libre</span>`}</div>
        </div>`; }).join("")}
    </div>`; }).join("");
}
function viewMiHorario() {
  const me = miEmp();
  if (!me) return vacio(ICON.users, "Cuenta sin ficha de empleado",
    "Tu cuenta está activa pero no está vinculada a una ficha. Pide a la oficina tu código de equipo.");
  const { dias, de } = horarioEmp(me.id);
  const nServicios = dias.reduce((a, d) => a + de(d).length, 0);
  const total3 = dias.reduce((a, d) => a + de(d).reduce((x, t) => x + horasTarea(t), 0), 0);
  return `
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.cal} Servicios</div><div class="val">${nServicios}</div><div class="sub">en las próximas 3 semanas</div></div>
    <div class="kpi"><div class="lab">${ICON.clock} Horas previstas</div><div class="val">${Math.round(total3)}<small>h</small></div><div class="sub">según la planificación</div></div>
    <div class="kpi"><div class="lab">${ICON.sun} Días libres</div><div class="val">${dias.filter(d => !de(d).length).length}</div><div class="sub">sin servicios asignados</div></div>
  </div>
  <p class="hint" style="margin-bottom:14px">Tu horario de las próximas tres semanas: a qué casa vas, qué servicio das y de qué hora a qué hora. Si la oficina cambia algo, aquí lo ves actualizado al momento.</p>
  ${mhSemanasHTML(me.id)}`;
}

function viewMisHoras() {
  const me = miEmp(); if (!me) return viewMiDia();
  const iniSemana = addDias(hoyISO(), -((new Date().getDay() + 6) % 7));
  const propios = DB.fichajes.filter(f => f.empleado_id === me.id).sort((a, b) => b.entrada.localeCompare(a.entrada)).slice(0, 14);
  return `
  <div class="kpis" style="margin-bottom:16px">
    <div class="kpi"><div class="lab">${ICON.clock} Esta semana</div><div class="val">${horasEmpleadoRango(me.id, iniSemana, hoyISO())}<small>h</small></div><div class="sub">contrato: ${me.contrato_horas} h/semana</div></div>
    <div class="kpi"><div class="lab">${ICON.cal} Este mes</div><div class="val">${horasEmpleadoRango(me.id, mesISO() + "-01", hoyISO())}<small>h</small></div><div class="sub">pausas descontadas</div></div>
    <div class="kpi"><div class="lab">${ICON.sun} Vacaciones</div><div class="val">—</div><div class="sub">se gestionan con la oficina</div></div>
  </div>
  ${propios.length ? `<div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Día</th><th>Entrada</th><th>Salida</th><th>Pausas</th><th class="num">Total</th></tr></thead>
    <tbody>${propios.map(f => { const ps = DB.pausas.filter(p => p.fichaje_id === f.id); return `
      <tr><td><b>${fmtCorto(f.fecha)}</b></td><td>${fmtHora(f.entrada)}</td><td>${f.salida ? fmtHora(f.salida) : "en curso"}</td>
      <td>${ps.map(p => fmtHora(p.inicio) + "–" + (p.fin ? fmtHora(p.fin) : "…")).join(", ") || "—"}</td>
      <td class="num"><b>${msAHoras(horasDeFichaje(f))} h</b></td></tr>`; }).join("")}</tbody></table></div>`
  : vacio(ICON.clock, "Aún sin fichajes", "Cuando fiches tu primera jornada aparecerá aquí tu historial.")}
  <p class="hint" style="margin-top:12px">Tus fichajes se conservan 4 años. Si un día se te olvidó fichar, avisa a la oficina.</p>`;
}
function viewMisIncidencias() {
  const me = miEmp();
  const mias = DB.incidencias.filter(i => me && i.reportada_por === me.id);
  return `
  <div class="toolbar"><span class="hint">Incidencias que has reportado tú. La oficina las ve al instante.</span>
    <div class="spacer"></div>
    <button class="btn primary sm" onclick="openNuevaIncidencia()">${ICON.camera} Reportar incidencia</button></div>
  ${mias.length ? `<div class="inc-grid">${mias.map(incCardHTML).join("")}</div>`
  : vacio(ICON.check, "No has reportado ninguna incidencia", "Si encuentras una avería o falta algo en una casa, repórtala con foto desde aquí.")}`;
}

/* ============================================================
   REGISTRO DE VISTAS
   ============================================================ */
const VIEWS = {
  dashboard:    { t: "Inicio",        c: "Resumen del día",                    r: viewDashboard,     m: () => mountDashboard() },
  propiedades:  { t: "Propiedades",   c: "Cartera en gestión",                 r: viewProps,         m: () => resolverFotos() },
  propdetail:   { t: "Propiedad",     c: "Ficha completa",                     r: viewPropDetail,    m: () => mountPropDetail() },
  equipo:       { t: "Equipo en vivo",c: "Dónde está cada persona ahora",      r: viewEquipo,        m: () => initLiveMap() },
  trabajadores: { t: "Trabajadores",  c: "Plantilla, contratos y facturas",    r: viewTrabajadores,  m: () => {} },
  trabajadordetail: { t: "Trabajador",c: "Ficha completa",                     r: viewTrabajadorDetail, m: () => mountTrabajadorDetail() },
  plan:         { t: "Planificación", c: "Check-outs → servicios → check-ins", r: viewPlan,          m: () => {} },
  fichajes:     { t: "Fichajes",      c: "Registro de jornada del equipo",     r: viewFichajes,      m: () => resolverFotos() },
  incidencias:  { t: "Incidencias",   c: "Averías y avisos del equipo",        r: viewIncidencias,   m: () => {} },
  informes:     { t: "Informes",      c: "Documentos mensuales con tus datos", r: viewInformes,      m: () => {} },
  facturacion:  { t: "Facturación",   c: "Borradores, emisión y cobros",       r: viewFacturacion,   m: () => {} },
  propietarios: { t: "Propietarios",  c: "Dueños, reseñas y mejoras",          r: viewPropietarios,  m: () => {} },
  propietariodetail: { t: "Propietario", c: "Propiedades, reseñas y mejoras",   r: viewPropietarioDetail, m: () => {} },
  clientes:     { t: "Clientes",      c: "Huéspedes y recurrencia",            r: viewClientes,      m: () => {} },
  ropa:         { t: "Lavandería",    c: "Estado de la ropa por propiedad",    r: viewRopa,          m: () => {} },
  clientedetail:{ t: "Cliente",       c: "Ficha, comunicación y estancias",    r: viewClienteDetail, m: () => {} },
  ajustes:      { t: "Ajustes",       c: "Empresa, usuarios y plantillas",     r: viewAjustes,       m: () => {} },
  midia:        { t: "Mi día",        c: "Fichaje, tareas e incidencias",      r: viewMiDia,         m: () => mountMiDia() },
  mihorario:    { t: "Mi horario",    c: "Tus próximas 3 semanas",             r: viewMiHorario,     m: () => {} },
  mishoras:     { t: "Mis horas",     c: "Tu registro de jornada",             r: viewMisHoras,      m: () => {} },
  misincidencias:{ t: "Incidencias",  c: "Las que has reportado tú",           r: viewMisIncidencias,m: () => {} },
  /* propietario */
  ownerhome:    { t: "Mi propiedad",  c: "Así está tu casa hoy",               r: viewOwnerHome,     m: () => resolverFotos() },
  ownerresenas: { t: "Reseñas",       c: "Lo que dicen tus huéspedes",         r: viewOwnerResenas,  m: () => {} },
  ownermejoras: { t: "Mejoras",       c: "Sube el valor de tu casa",           r: viewOwnerMejoras,  m: () => {} },
  ownerliq:     { t: "Liquidaciones", c: "Tu resumen económico mensual",       r: viewOwnerLiq,      m: () => {} },
};
