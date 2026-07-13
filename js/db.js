/* ============================================================
   CAPA DE DATOS · Portal Hygge (Supabase)
   Toda la app habla con Supabase a través de este archivo.
   ============================================================ */

const DB = {
  sb: null, ready: false,
  session: null, profile: null,          // profile: {id, nombre, rol, empleado_id}
  emp: [], props: [], owners: [], reservas: [], tareas: [],
  fichajes: [], pausas: [], posiciones: [], incidencias: [], eventos: [],
  facturas: [], ajustes: {}, pendientes: [],
  fotoUrls: {},                          // path -> signed url (caché)
  cargado: false,
};

/* ---------- utilidades de fecha ---------- */
const hoyISO = () => new Date().toLocaleDateString("sv-SE");                 // YYYY-MM-DD local
const mesISO = d => (d || hoyISO()).slice(0, 7);
const fmtDia = iso => new Date(iso + "T12:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
const fmtCorto = iso => new Date(iso + "T12:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" });
const fmtHora = ts => ts ? new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—";
const fmtMes = m => new Date(m + "-15T12:00").toLocaleDateString("es-ES", { month: "long", year: "numeric" });
const addDias = (iso, n) => { const d = new Date(iso + "T12:00"); d.setDate(d.getDate() + n); return d.toLocaleDateString("sv-SE"); };
const addMeses = (m, n) => { const d = new Date(m + "-15T12:00"); d.setMonth(d.getMonth() + n); return d.toLocaleDateString("sv-SE").slice(0, 7); };
const msAHoras = ms => Math.round(ms / 36e5 * 10) / 10;

/* ---------- init ---------- */
function dbInit() {
  if (!HYGGE_CONFIG.SUPABASE_URL || !HYGGE_CONFIG.SUPABASE_ANON_KEY) { DB.ready = false; return; }
  DB.sb = window.supabase.createClient(HYGGE_CONFIG.SUPABASE_URL, HYGGE_CONFIG.SUPABASE_ANON_KEY);
  DB.ready = true;
}

/* ---------- auth ---------- */
async function dbLogin(email, pass) {
  const { data, error } = await DB.sb.auth.signInWithPassword({ email, password: pass });
  if (error) return error.message === "Invalid login credentials" ? "Email o contraseña incorrectos" : error.message;
  DB.session = data.session;
  return null;
}
async function dbSignup(nombre, email, pass) {
  const { data, error } = await DB.sb.auth.signUp({ email, password: pass, options: { data: { nombre } } });
  if (error) return { error: error.message };
  return { needsConfirm: !data.session };
}
async function dbReclamar(codigo) {
  const { data, error } = await DB.sb.rpc("reclamar_acceso", { p_codigo: codigo || null });
  if (error) return { error: limpiaErr(error.message) };
  return { rol: data };
}
async function dbLogout() { await DB.sb.auth.signOut(); location.reload(); }
async function dbCargarPerfil() {
  const { data: { session } } = await DB.sb.auth.getSession();
  DB.session = session;
  if (!session) return null;
  const { data } = await DB.sb.from("profiles").select("*").eq("id", session.user.id).single();
  DB.profile = data || null;
  return DB.profile;
}
const limpiaErr = m => (m || "").replace(/^.*?exception:?\s*/i, "").replace("new row violates row-level security policy", "No tienes permiso para esta acción");

/* ---------- carga de datos (RLS filtra según rol) ---------- */
async function dbCargarTodo() {
  const desde = addDias(hoyISO(), -400), hasta = addDias(hoyISO(), 400);
  const q = (t, sel, mod) => { let x = DB.sb.from(t).select(sel || "*"); if (mod) x = mod(x); return x; };
  const [emp, props, owners, res, tar, fic, pau, pos, inc, ev, fac, aj, pend] = await Promise.all([
    q("empleados", "*", x => x.order("nombre")),
    q("propiedades", "*", x => x.order("nombre")),
    q("propietarios", "*", x => x.order("nombre")),
    q("reservas", "*", x => x.gte("salida", desde).lte("entrada", hasta).order("entrada")),
    q("tareas", "*", x => x.gte("fecha", addDias(hoyISO(), -370)).order("fecha").order("hora_inicio")),
    q("fichajes", "*", x => x.gte("fecha", addDias(hoyISO(), -370)).order("entrada")),
    q("fichaje_pausas", "*"),
    q("posiciones", "*"),
    q("incidencias", "*", x => x.order("created_at", { ascending: false })),
    q("incidencia_eventos", "*", x => x.order("created_at")),
    q("facturas", "*", x => x.order("created_at", { ascending: false })),
    q("ajustes", "*"),
    DB.sb.from("profiles").select("*").is("rol", null),
  ]);
  DB.emp = emp.data || []; DB.props = props.data || []; DB.owners = owners.data || [];
  DB.reservas = res.data || []; DB.tareas = tar.data || []; DB.fichajes = fic.data || [];
  DB.pausas = pau.data || []; DB.posiciones = pos.data || []; DB.incidencias = inc.data || [];
  DB.eventos = ev.data || []; DB.facturas = fac.data || [];
  DB.ajustes = Object.fromEntries((aj.data || []).map(a => [a.clave, a.valor]));
  DB.pendientes = pend.data || [];
  DB.cargado = true;
}
let _recargaTimer = null;
function dbRecargaSuave() {
  clearTimeout(_recargaTimer);
  _recargaTimer = setTimeout(async () => { await dbCargarTodo(); if (typeof rerender === "function" && STATE.role) rerender(true); }, 350);
}
function dbRealtime() {
  DB.sb.channel("hygge-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "fichajes" }, dbRecargaSuave)
    .on("postgres_changes", { event: "*", schema: "public", table: "fichaje_pausas" }, dbRecargaSuave)
    .on("postgres_changes", { event: "*", schema: "public", table: "posiciones" }, dbRecargaSuave)
    .on("postgres_changes", { event: "*", schema: "public", table: "tareas" }, dbRecargaSuave)
    .on("postgres_changes", { event: "*", schema: "public", table: "incidencias" }, dbRecargaSuave)
    .subscribe();
}

/* ---------- helpers de dominio ---------- */
const P = id => DB.props.find(p => p.id === id);
const S = id => DB.emp.find(e => e.id === id);
const O = id => DB.owners.find(o => o.id === id);
const miEmp = () => DB.profile?.empleado_id ? S(DB.profile.empleado_id) : null;

const fichajeAbierto = empId => DB.fichajes.find(f => f.empleado_id === empId && !f.salida);
const pausaAbierta = ficId => DB.pausas.find(p => p.fichaje_id === ficId && !p.fin);
const tareaActiva = empId => DB.tareas.find(t => t.fecha === hoyISO() && t.estado === "encurso" && (t.equipo_ids || []).includes(empId));

function estadoEmpleado(e) {
  const f = fichajeAbierto(e.id);
  if (!f) return { key: "libre", txt: "Fuera de turno" };
  if (pausaAbierta(f.id)) return { key: "descanso", txt: "Descanso", desde: fmtHora(pausaAbierta(f.id).inicio) };
  const t = tareaActiva(e.id);
  if (t) {
    const key = t.tipo === "limpieza" ? "limpiando" : "mantenimiento";
    return { key, txt: key === "limpiando" ? "Limpiando" : "En servicio", prop: P(t.propiedad_id), desde: fmtHora(t.inicio_real) };
  }
  return { key: "turno", txt: "De turno", desde: fmtHora(f.entrada) };
}

function horasDeFichaje(f) {
  const fin = f.salida ? new Date(f.salida) : new Date();
  let ms = fin - new Date(f.entrada);
  DB.pausas.filter(p => p.fichaje_id === f.id).forEach(p => { ms -= (p.fin ? new Date(p.fin) : new Date()) - new Date(p.inicio); });
  return Math.max(0, ms);
}
function horasEmpleadoRango(empId, desde, hasta) {
  return msAHoras(DB.fichajes
    .filter(f => f.empleado_id === empId && f.fecha >= desde && f.fecha <= hasta)
    .reduce((a, f) => a + horasDeFichaje(f), 0));
}

/* proyección GPS real -> mapa esquemático del Llevant (x/y en %) */
const MAPA_BOUNDS = { latMax: 39.80, latMin: 39.52, lngMin: 3.13, lngMax: 3.52 };
const OFICINA = { lat: 39.6936, lng: 3.3494 }; // Costa i Llobera 53, Artà
function proyecta(lat, lng) {
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  return {
    x: cl((lng - MAPA_BOUNDS.lngMin) / (MAPA_BOUNDS.lngMax - MAPA_BOUNDS.lngMin) * 100, 3, 97),
    y: cl((MAPA_BOUNDS.latMax - lat) / (MAPA_BOUNDS.latMax - MAPA_BOUNDS.latMin) * 100, 4, 94),
  };
}
const ZONA_POS = {
  "artà": { x: 32, y: 38 }, "capdepera": { x: 63, y: 30 }, "cala ratjada": { x: 77, y: 20 },
  "canyamel": { x: 71, y: 45 }, "cala millor": { x: 60, y: 72 }, "son servera": { x: 50, y: 62 },
  "colònia de sant pere": { x: 14, y: 13 }, "colonia de sant pere": { x: 14, y: 13 },
  "betlem": { x: 25, y: 10 }, "cala mesquida": { x: 58, y: 9 }, "font de sa cala": { x: 74, y: 33 },
};
function posProp(p) {
  if (p.lat && p.lng) return proyecta(+p.lat, +p.lng);
  const z = (p.zona || "").toLowerCase().split(" (")[0].trim();
  return ZONA_POS[z] || { x: 40, y: 45 };
}
function posEmpleado(e) {
  const pos = DB.posiciones.find(x => x.empleado_id === e.id);
  if (pos) return proyecta(+pos.lat, +pos.lng);
  const t = tareaActiva(e.id);
  if (t && P(t.propiedad_id)) return posProp(P(t.propiedad_id));
  return proyecta(OFICINA.lat, OFICINA.lng);
}

/* geolocalización del navegador (silenciosa si el usuario la deniega) */
function getGPS() {
  return new Promise(res => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) }),
      () => res(null), { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 });
  });
}
async function dbPingPosicion() {
  const me = miEmp(); if (!me) return;
  const gps = await getGPS(); if (!gps) return;
  await DB.sb.from("posiciones").upsert({ empleado_id: me.id, lat: gps.lat, lng: gps.lng, updated_at: new Date().toISOString() });
}

/* ---------- storage ---------- */
async function dbSubirFoto(path, file) {
  const { error } = await DB.sb.storage.from("fotos").upload(path, file, { upsert: true });
  return error ? null : path;
}
async function fotoUrl(path) {
  if (!path) return null;
  if (DB.fotoUrls[path]) return DB.fotoUrls[path];
  const { data } = await DB.sb.storage.from("fotos").createSignedUrl(path, 3600);
  if (data?.signedUrl) DB.fotoUrls[path] = data.signedUrl;
  return DB.fotoUrls[path] || null;
}

/* ---------- mutaciones ---------- */
async function dbGuardarProp(payload, id, fotoFile) {
  let error, prop;
  if (id) ({ error } = await DB.sb.from("propiedades").update(payload).eq("id", id));
  else { const r = await DB.sb.from("propiedades").insert(payload).select().single(); error = r.error; prop = r.data; id = prop?.id; }
  if (error) return limpiaErr(error.message);
  if (fotoFile && id) {
    const path = `propiedades/${id}/cover_${Date.now()}.jpg`;
    if (await dbSubirFoto(path, fotoFile)) await DB.sb.from("propiedades").update({ foto_path: path }).eq("id", id);
  }
  await dbCargarTodo(); return null;
}
async function dbGuardarOwner(payload, id) {
  const r = id ? await DB.sb.from("propietarios").update(payload).eq("id", id)
               : await DB.sb.from("propietarios").insert(payload);
  if (r.error) return limpiaErr(r.error.message);
  await dbCargarTodo(); return null;
}
async function dbGuardarEmpleado(payload, id) {
  const r = id ? await DB.sb.from("empleados").update(payload).eq("id", id).select().single()
               : await DB.sb.from("empleados").insert(payload).select().single();
  if (r.error) return { error: limpiaErr(r.error.message) };
  await dbCargarTodo(); return { emp: r.data };
}
async function dbCrearReserva(payload) {
  const { error } = await DB.sb.from("reservas").insert(payload);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbBorrarReserva(id) {
  const { error } = await DB.sb.from("reservas").delete().eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbCrearTarea(payload) {
  const plantilla = (DB.ajustes.checklist_base || []).map(t => ({ t, ok: false }));
  const { error } = await DB.sb.from("tareas").insert({ checklist: plantilla, ...payload });
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbTareaEstado(id, cambios) {
  const { error } = await DB.sb.from("tareas").update(cambios).eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbBorrarTarea(id) {
  const { error } = await DB.sb.from("tareas").delete().eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbFicharEntrada() {
  const me = miEmp(); if (!me) return "Tu cuenta no está vinculada a una ficha de empleado";
  if (fichajeAbierto(me.id)) return "Ya tienes la jornada abierta";
  const gps = await getGPS();
  const { error } = await DB.sb.from("fichajes").insert({
    empleado_id: me.id, fecha: hoyISO(), lat: gps?.lat, lng: gps?.lng,
  });
  if (error) return limpiaErr(error.message);
  if (gps) await DB.sb.from("posiciones").upsert({ empleado_id: me.id, lat: gps.lat, lng: gps.lng, updated_at: new Date().toISOString() });
  await dbCargarTodo(); return null;
}
async function dbFicharSalida() {
  const me = miEmp(); const f = me && fichajeAbierto(me.id);
  if (!f) return "No tienes jornada abierta";
  const p = pausaAbierta(f.id);
  if (p) await DB.sb.from("fichaje_pausas").update({ fin: new Date().toISOString() }).eq("id", p.id);
  const gps = await getGPS();
  const { error } = await DB.sb.from("fichajes").update({
    salida: new Date().toISOString(), lat_salida: gps?.lat, lng_salida: gps?.lng,
  }).eq("id", f.id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbPausa() {
  const me = miEmp(); const f = me && fichajeAbierto(me.id);
  if (!f) return "Ficha primero la entrada";
  const p = pausaAbierta(f.id);
  const r = p ? await DB.sb.from("fichaje_pausas").update({ fin: new Date().toISOString() }).eq("id", p.id)
              : await DB.sb.from("fichaje_pausas").insert({ fichaje_id: f.id });
  if (r.error) return limpiaErr(r.error.message);
  await dbCargarTodo(); return null;
}
async function dbCrearIncidencia({ propiedad_id, titulo, descripcion, prioridad }, files) {
  const me = miEmp();
  const fotos = [];
  for (const file of files || []) {
    const path = `incidencias/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;
    if (await dbSubirFoto(path, file)) fotos.push(path);
  }
  const { data, error } = await DB.sb.from("incidencias").insert({
    propiedad_id, titulo, descripcion, prioridad, fotos,
    reportada_por: me?.id || null, creador_uid: DB.session.user.id,
  }).select().single();
  if (error) return limpiaErr(error.message);
  await DB.sb.from("incidencia_eventos").insert({
    incidencia_id: data.id, autor: DB.profile.nombre,
    texto: `Reportada por ${DB.profile.nombre}${fotos.length ? ` con ${fotos.length} foto${fotos.length > 1 ? "s" : ""}` : ""}`,
  });
  await dbCargarTodo(); return null;
}
async function dbResolverIncidencia(id, coste) {
  const cambios = { estado: "resuelta", resuelta_at: new Date().toISOString() };
  if (coste !== null && coste !== "" && !isNaN(+coste)) cambios.coste = +coste;
  const { error } = await DB.sb.from("incidencias").update(cambios).eq("id", id);
  if (error) return limpiaErr(error.message);
  await DB.sb.from("incidencia_eventos").insert({ incidencia_id: id, autor: DB.profile.nombre, texto: "Marcada como resuelta" });
  await dbCargarTodo(); return null;
}
async function dbComentarIncidencia(id, texto) {
  const { error } = await DB.sb.from("incidencia_eventos").insert({ incidencia_id: id, autor: DB.profile.nombre, texto });
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbGenerarFacturasMes(mes) {
  const ini = mes + "-01", fin = addDias(addMeses(mes, 1) + "-01", -1);
  let creadas = 0;
  for (const o of DB.owners) {
    const propsO = DB.props.filter(p => p.propietario_id === o.id && p.activa);
    if (!propsO.length) continue;
    const lineas = [];
    propsO.forEach(p => {
      if (+p.tarifa_gestion > 0) lineas.push({ c: `Gestión integral ${fmtMes(mes)} · ${p.nombre}`, importe: +p.tarifa_gestion });
      const limp = DB.tareas.filter(t => t.propiedad_id === p.id && t.tipo === "limpieza" && t.estado === "hecha" && t.fecha >= ini && t.fecha <= fin).length;
      if (limp && +p.tarifa_limpieza > 0) lineas.push({ c: `${limp} limpieza${limp > 1 ? "s" : ""} de salida · ${p.nombre}`, importe: limp * +p.tarifa_limpieza });
    });
    const base = lineas.reduce((a, l) => a + l.importe, 0);
    if (!base) continue;
    const ya = DB.facturas.find(f => f.propietario_id === o.id && f.concepto === `Servicios ${fmtMes(mes)}`);
    if (ya) continue;
    const { error } = await DB.sb.from("facturas").insert({
      cliente: o.nombre, propietario_id: o.id, tipo: "Propietario",
      concepto: `Servicios ${fmtMes(mes)}`, lineas, base, fecha: hoyISO(),
    });
    if (!error) creadas++;
  }
  await dbCargarTodo(); return creadas;
}
async function dbEmitirFactura(id) {
  const { data, error } = await DB.sb.rpc("emitir_factura", { p_id: id });
  if (error) return { error: limpiaErr(error.message) };
  await dbCargarTodo(); return { numero: data };
}
async function dbCobrarFactura(id) {
  const { error } = await DB.sb.from("facturas").update({ estado: "cobrada" }).eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbSetAjuste(clave, valor) {
  const { error } = await DB.sb.from("ajustes").upsert({ clave, valor });
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbActivarDireccion(uid) {
  const { error } = await DB.sb.rpc("activar_direccion", { p_uid: uid });
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbSubirDocumento(propId, file) {
  const limpio = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `documentos/${propId}/${Date.now()}_${limpio}`;
  const ok = await dbSubirFoto(path, file);
  return ok ? null : "No se pudo subir el documento";
}
async function dbListarDocumentos(propId) {
  const { data } = await DB.sb.storage.from("fotos").list(`documentos/${propId}`, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  return (data || []).filter(d => d.name !== ".emptyFolderPlaceholder");
}
