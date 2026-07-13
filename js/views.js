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
          <div class="prop-occ"><span>${fmtMes(mes).split(" ")[0]}</span><span class="bar"><i style="width:${Math.min(100, st.ocup)}%"></i></span><b>${st.ocup}%</b></div>
          <div class="prop-next">${ICON.cal} ${st.noches} noches este mes · ${st.limpiezas} limpiezas</div>
        </div>
      </button>`; }).join("")}
  </div>
  ${list.length ? "" : `<div class="empty">${ICON.search}Sin resultados para ese filtro.</div>`}`;
}

/* calendario real de un mes */
function calendarioProp(p, mes) {
  const y = +mes.slice(0, 4), m = +mes.slice(5, 7);
  const dias = new Date(y, m, 0).getDate();
  const dow = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const rs = DB.reservas.filter(r => r.propiedad_id === p.id);
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
      onclick="openReservaForm(${p.id},'${iso}')" title="${r ? esc(r.huesped || "Reservada") + " · " + r.canal : b ? "Bloqueado" : "Libre · click para reservar"}">${d}</div>`;
  }
  return `<div class="cal"><div class="cal-head"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
  <div class="cal-grid">${cells}</div></div>
  <div class="legend" style="margin-top:12px">
    <span><i style="background:var(--gold-soft);border:1px solid var(--gold-line)"></i>Ocupada</span>
    <span><i style="background:#fff;box-shadow:inset 0 0 0 2px var(--blue);border-radius:3px"></i>Entrada</span>
    <span><i style="background:#fff;box-shadow:inset 0 0 0 2px var(--terra);border-radius:3px"></i>Salida</span>
    <span><i style="background:#fff;box-shadow:inset 0 0 0 2px var(--ok);border-radius:3px"></i>Bloqueo propietario</span>
  </div>`;
}

function viewPropDetail() {
  const p = P(STATE.prop); if (!p) { STATE.route = "propiedades"; return viewProps(); }
  const tab = STATE.propTab || "resumen";
  const mes = STATE.propMes || mesISO();
  const incs = DB.incidencias.filter(i => i.propiedad_id === p.id);
  const st = statsMesProp(p.id, mesISO());
  const o = O(p.propietario_id);
  const tabs = [["resumen", "Resumen"], ["calendario", "Calendario"], ["limpiezas", "Servicios"], ["incidencias", `Incidencias (${incs.filter(i => i.estado === "abierta").length})`], ["ficha", "Ficha"], ["docs", "Documentos"]];
  let body = "";
  if (tab === "resumen") {
    const proxima = DB.reservas.filter(r => r.propiedad_id === p.id && r.entrada >= hoyISO() && r.estado === "confirmada").sort((a, b) => a.entrada.localeCompare(b.entrada))[0];
    const tarProx = DB.tareas.filter(t => t.propiedad_id === p.id && t.fecha >= hoyISO() && t.estado !== "hecha").sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
    body = `
    <div class="kpis" style="margin-bottom:16px">
      <div class="kpi"><div class="lab">${ICON.cal} Noches este mes</div><div class="val">${st.noches}<small>/${st.dias}</small></div><div class="sub">${st.ocup}% de ocupación</div></div>
      <div class="kpi"><div class="lab">${ICON.broom} Limpiezas hechas</div><div class="val">${st.limpiezas}</div><div class="sub">este mes</div></div>
      <div class="kpi"><div class="lab">${ICON.euro} Ingresos por reservas</div><div class="val">${eur0(st.ingresos)}</div><div class="sub">reservas con entrada este mes</div></div>
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
      <div class="right"><label class="file-btn">${ICON.plus} Subir documento<input type="file" onchange="subirDoc(${p.id}, this)"></label></div></div>
      <div id="docs-list"><div class="lds"></div></div>
    </div>`;
  return `
  <button class="btn sm outline" style="margin-bottom:14px" data-go="propiedades">${ICON.back} Propiedades</button>
  <div class="prop-hero">
    ${coverProp(p)}
    <div class="inner">
      <div><h2>${esc(p.nombre)}</h2><div class="loc">${ICON.pin} ${esc(p.zona || "")} ${p.tipo ? "· " + esc(p.tipo) : ""} ${p.licencia ? "· " + esc(p.licencia) : ""}</div></div>
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
  if (STATE.propTab === "docs") cargarDocs(p.id);
  resolverFotos();
}

/* ============================================================
   EQUIPO EN VIVO
   ============================================================ */
const MAP_TOWNS = [
  { n: "Artà", x: 32, y: 38, big: true }, { n: "Capdepera", x: 63, y: 30, big: true },
  { n: "Cala Ratjada", x: 77, y: 20 }, { n: "Canyamel", x: 71, y: 45 },
  { n: "Cala Millor", x: 60, y: 72 }, { n: "Son Servera", x: 50, y: 62 },
  { n: "Colònia de St. Pere", x: 14, y: 13 }, { n: "Betlem", x: 25, y: 10 }, { n: "Cala Mesquida", x: 58, y: 9 },
];
function mapBaseSVG() {
  return `<svg class="map-base" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dcebe7"/><stop offset="1" stop-color="#cfe3dd"/></linearGradient>
      <linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f0e4"/><stop offset="1" stop-color="#eae6d6"/></linearGradient>
    </defs>
    <rect width="1000" height="640" fill="url(#sea)"/>
    <path d="M0 640V96Q60 74 96 58q54-24 96-22 46 2 92-14 30-10 56 6 22 14 40 34 16 18 42 22 34 6 96 4 44-2 82 18 30 16 44 44 12 26 30 44 22 22 26 52 4 28-8 56-14 30-40 46-30 18-48 44-16 24-24 54-8 32-30 52-24 22-56 26-40 6-70 30-24 20-54 14H0Z" fill="url(#land)" stroke="#d8d2bd" stroke-width="2.5"/>
    <g stroke="#cbc6b0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85">
      <path d="M320 244 Q470 170 630 192 Q710 152 770 128"/><path d="M320 244 Q220 170 140 84"/>
      <path d="M630 192 Q700 240 710 288"/><path d="M320 244 Q420 320 500 396 Q560 428 600 460"/><path d="M500 396 Q590 400 706 410"/>
    </g>
    <g font-family="Product Sans,sans-serif" fill="#6d7266">
      ${MAP_TOWNS.map(t => `
        <circle cx="${t.x * 10}" cy="${t.y * 6.4}" r="${t.big ? 6 : 4.5}" fill="#fff" stroke="#8f9486" stroke-width="2"/>
        <text x="${t.x * 10}" y="${t.y * 6.4 - 12}" text-anchor="middle" font-size="${t.big ? 15 : 13}" font-weight="${t.big ? 700 : 400}">${t.n}</text>`).join("")}
      <text x="855" y="70" font-size="14" fill="#8ba39b" font-style="italic">Mar Mediterráneo</text>
      <text x="30" y="612" font-size="13" fill="#9a957f">Llevant de Mallorca</text>
    </g>
  </svg>`;
}
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
      <div class="map-wrap" id="map-wrap">
        ${mapBaseSVG()}
        <div class="map-note">Posiciones GPS reales del equipo fichado</div>
        ${DB.props.filter(p => p.activa).map(p => { const pos = posProp(p); return `
          <div class="map-pin" style="left:${pos.x}%;top:${pos.y}%" data-tip="<b>${esc(p.nombre)}</b>${esc(p.zona || "")}" data-prop-go="${p.id}"><span class="ho">${ICON.house}</span></div>`; }).join("")}
        ${fichados.map(({ e, st }) => { const pos = posEmpleado(e); return `
          <div class="map-emp ${["limpiando", "mantenimiento"].includes(st.key) ? "working" : ""}" style="left:${pos.x}%;top:${pos.y}%;--st:${EST[st.key].col}"
            data-emp="${e.id}" data-tip="<b>${esc(e.nombre)}</b>${EST[st.key].txt}${st.prop ? " · " + esc(st.prop.nombre) : ""}${st.desde ? " · desde " + st.desde : ""}">
            <span class="av" style="background:${e.color}">${ini(e.nombre)}</span></div>`; }).join("")}
        <div class="map-tip" id="map-tip"></div>
        <div class="map-legend">
          <span><i style="background:#4f8a5c"></i>Limpiando</span><span><i style="background:#b5533c"></i>Servicio</span>
          <span><i style="background:#4a7fa5"></i>De turno</span><span><i style="background:#c79c3d"></i>Descanso</span>
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
      <button class="btn sm outline" data-go="fichajes">${ICON.clock} Fichajes</button>
      <button class="btn sm outline" onclick="openEmpForm(${e.id})">${ICON.edit} Editar ficha</button>
    </div>
  </div>`;
}

/* ============================================================
   PLANIFICACIÓN
   ============================================================ */
function viewPlan() {
  const fecha = STATE.planDia || hoyISO();
  const salidas = DB.reservas.filter(r => r.salida === fecha && r.estado === "confirmada");
  const entradas = DB.reservas.filter(r => r.entrada === fecha && r.estado === "confirmada");
  const tareas = DB.tareas.filter(t => t.fecha === fecha).sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));
  const stChip = { hecha: '<span class="chip ok">Hecha</span>', encurso: '<span class="chip blue"><i class="d"></i>En curso</span>', pendiente: '<span class="chip line">Pendiente</span>' };
  if (!DB.props.length) return vacio(ICON.cal, "Primero añade propiedades", "La planificación se construye sobre las reservas y servicios de tus propiedades.", `<button class="btn primary" data-go="propiedades">${ICON.house} Ir a Propiedades</button>`);
  return `
  <div class="toolbar">
    <span class="month-nav">
      <button onclick="STATE.planDia='${addDias(fecha, -1)}';rerender()">${ICON.left}</button>
      <b>${fecha === hoyISO() ? "Hoy · " : ""}${fmtCorto(fecha)}</b>
      <button onclick="STATE.planDia='${addDias(fecha, 1)}';rerender()">${ICON.right}</button>
    </span>
    ${fecha !== hoyISO() ? `<button class="btn xs outline" onclick="STATE.planDia='${hoyISO()}';rerender()">Volver a hoy</button>` : ""}
    <div class="spacer"></div>
    <button class="btn sm primary" onclick="openTareaForm('${fecha}')">${ICON.plus} Nuevo servicio</button>
  </div>
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
    <thead><tr><th>Empleado</th><th>Entrada</th><th>Ubicación</th><th>Pausas</th><th>Salida</th><th class="num">Total</th><th>Estado</th></tr></thead>
    <tbody>${rows.map(f => { const e = S(f.empleado_id) || { nombre: "?" }; const ps = DB.pausas.filter(p => p.fichaje_id === f.id); return `
      <tr><td><span class="who">${ava(e)} ${esc(e.nombre)}</span></td>
      <td><b>${fmtHora(f.entrada)}</b></td>
      <td>${f.lat ? `<a class="chip line" target="_blank" rel="noopener" href="https://maps.google.com/?q=${f.lat},${f.lng}">${ICON.pin} ver mapa</a>` : "—"}</td>
      <td>${ps.length ? ps.map(p => fmtHora(p.inicio) + "–" + (p.fin ? fmtHora(p.fin) : "…")).join(", ") : "—"}</td>
      <td>${f.salida ? `<b>${fmtHora(f.salida)}</b>` : "—"}</td>
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
    <div class="report-card"><span class="ic">${ICON.euro}</span>
      <h4>Liquidaciones a propietarios</h4>
      <p>Resumen económico por propietario: ingresos por reservas, servicios prestados y neto resultante.</p>
      <button class="btn primary" onclick="openPaperLiquidaciones('${mes}')">${ICON.doc} Generar</button></div>
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
   PROPIETARIOS
   ============================================================ */
function viewPropietarios() {
  if (!DB.owners.length) return vacio(ICON.users, "Aún no hay propietarios",
    "Registra a los dueños de las casas: sus liquidaciones mensuales y facturas se generan solas a partir de sus propiedades.",
    `<button class="btn primary" onclick="openOwnerForm()">${ICON.plus} Añadir propietario</button>`);
  const mesLiq = addMeses(mesISO(), -1);
  return `
  <div class="toolbar"><div class="spacer"></div>
    <button class="btn primary sm" onclick="openOwnerForm()">${ICON.plus} Nuevo propietario</button></div>
  <div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Propietario</th><th>Contacto</th><th>Propiedades</th><th class="num">Liquidación ${fmtMes(mesLiq).split(" ")[0]}</th><th></th></tr></thead>
    <tbody>${DB.owners.map(o => { const l = liquidacionOwner(o, mesLiq); return `
      <tr><td><b>${esc(o.nombre)}</b>${o.pais ? ` <span style="color:var(--muted)">· ${esc(o.pais)}</span>` : ""}</td>
      <td>${o.email ? `<a class="chip line" href="mailto:${esc(o.email)}">${esc(o.email)}</a>` : "—"}</td>
      <td>${l.propsO.map(p => esc(p.nombre)).join(", ") || "—"}</td>
      <td class="num"><b>${l.propsO.length ? eur(l.neto) : "—"}</b></td>
      <td class="num" style="white-space:nowrap">
        <button class="btn xs outline" onclick="openPaperLiqOwner(${o.id},'${mesLiq}')">${ICON.eye} Liquidación</button>
        <button class="btn xs outline" onclick="openOwnerForm(${o.id})">${ICON.edit}</button>
      </td></tr>`; }).join("")}
    </tbody></table></div>`;
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
              <button class="btn sm primary" ${chkTot && chkOk === chkTot ? "" : "disabled"} onclick="tareaFinalizar(${t.id})">${ICON.check} Finalizar</button>` : ""}
            ${t.estado === "hecha" ? `<span class="chip ok">Hecha${chkTot ? " · checklist " + Math.round(chkOk / chkTot * 100) + "%" : ""}</span>` : ""}
          </div>
        </div>`; }).join("")
      : `<div class="empty">${ICON.sun}No tienes servicios asignados hoy.</div>`}
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
  equipo:       { t: "Equipo en vivo",c: "Dónde está cada persona ahora",      r: viewEquipo,        m: () => {} },
  plan:         { t: "Planificación", c: "Check-outs → servicios → check-ins", r: viewPlan,          m: () => {} },
  fichajes:     { t: "Fichajes",      c: "Registro de jornada del equipo",     r: viewFichajes,      m: () => {} },
  incidencias:  { t: "Incidencias",   c: "Averías y avisos del equipo",        r: viewIncidencias,   m: () => {} },
  informes:     { t: "Informes",      c: "Documentos mensuales con tus datos", r: viewInformes,      m: () => {} },
  facturacion:  { t: "Facturación",   c: "Borradores, emisión y cobros",       r: viewFacturacion,   m: () => {} },
  propietarios: { t: "Propietarios",  c: "Dueños y liquidaciones",             r: viewPropietarios,  m: () => {} },
  ajustes:      { t: "Ajustes",       c: "Empresa, usuarios y plantillas",     r: viewAjustes,       m: () => {} },
  midia:        { t: "Mi día",        c: "Fichaje, tareas e incidencias",      r: viewMiDia,         m: () => mountMiDia() },
  mishoras:     { t: "Mis horas",     c: "Tu registro de jornada",             r: viewMisHoras,      m: () => {} },
  misincidencias:{ t: "Incidencias",  c: "Las que has reportado tú",           r: viewMisIncidencias,m: () => {} },
};
