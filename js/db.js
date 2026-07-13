/* ============================================================
   CAPA DE DATOS · Portal Hygge (Supabase)
   Toda la app habla con Supabase a través de este archivo.
   ============================================================ */

const DB = {
  sb: null, ready: false,
  session: null, profile: null,          // profile: {id, nombre, rol, empleado_id}
  emp: [], empDatos: [], props: [], owners: [], reservas: [], tareas: [],
  fichajes: [], pausas: [], posiciones: [], incidencias: [], eventos: [],
  facturas: [], compras: [], ausencias: [], resenas: [], mejoras: [],
  clientes: [], clienteContactos: [], ajustes: {}, pendientes: [],
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
  const [emp, empd, props, owners, res, tar, fic, pau, pos, inc, ev, fac, com, aus, rsn, mej, cli, cct, aj, pend] = await Promise.all([
    q("empleados", "*", x => x.order("nombre")),
    q("empleados_datos", "*"),
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
    q("compras", "*", x => x.order("created_at", { ascending: false })),
    q("ausencias", "*", x => x.order("fecha", { ascending: false })),
    q("resenas", "*", x => x.order("fecha", { ascending: false })),
    q("mejoras", "*", x => x.order("created_at", { ascending: false })),
    q("clientes", "*", x => x.order("nombre")),
    q("cliente_contactos", "*", x => x.order("fecha", { ascending: false })),
    q("ajustes", "*"),
    DB.sb.from("profiles").select("*").is("rol", null),
  ]);
  DB.emp = emp.data || []; DB.empDatos = empd.data || [];
  DB.props = props.data || []; DB.owners = owners.data || [];
  DB.reservas = res.data || []; DB.tareas = tar.data || []; DB.fichajes = fic.data || [];
  DB.pausas = pau.data || []; DB.posiciones = pos.data || []; DB.incidencias = inc.data || [];
  DB.eventos = ev.data || []; DB.facturas = fac.data || []; DB.compras = com.data || [];
  DB.ausencias = aus.data || [];
  DB.resenas = rsn.data || []; DB.mejoras = mej.data || [];
  DB.clientes = cli.data || []; DB.clienteContactos = cct.data || [];
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
    .on("postgres_changes", { event: "*", schema: "public", table: "compras" }, dbRecargaSuave)
    .subscribe();
}

/* ---------- helpers de dominio ---------- */
const P = id => DB.props.find(p => p.id === id);
const S = id => DB.emp.find(e => e.id === id);
const O = id => DB.owners.find(o => o.id === id);
const ED = id => DB.empDatos.find(d => d.empleado_id === id) || {};
const CL = id => DB.clientes.find(c => c.id === id);
const miEmp = () => DB.profile?.empleado_id ? S(DB.profile.empleado_id) : null;
const miOwner = () => DB.profile?.propietario_id ? O(DB.profile.propietario_id) : null;
const misProps = () => { const o = miOwner(); return o ? DB.props.filter(p => p.propietario_id === o.id) : []; };

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

/* horas y coste de trabajo POR PROPIEDAD (lo que el cliente quiere medir) */
function horasTarea(t) {
  if (t.inicio_real && t.fin_real) return Math.max(0, (new Date(t.fin_real) - new Date(t.inicio_real)) / 36e5);
  if (t.hora_inicio && t.hora_fin) {
    const [h1, m1] = t.hora_inicio.split(":").map(Number), [h2, m2] = t.hora_fin.split(":").map(Number);
    return Math.max(0, (h2 * 60 + m2 - h1 * 60 - m1) / 60);
  }
  return 0;
}
function costeTarea(t) {
  const tarifas = (t.equipo_ids || []).reduce((a, id) => a + (+ED(id).tarifa_hora || 0), 0);
  return horasTarea(t) * tarifas;
}
function tareasPropMes(propId, mes) {
  return DB.tareas.filter(t => t.propiedad_id === propId && t.estado === "hecha" && t.fecha.startsWith(mes));
}
function horasPropMes(propId, mes) {
  return Math.round(tareasPropMes(propId, mes).reduce((a, t) => a + horasTarea(t) * Math.max(1, (t.equipo_ids || []).length), 0) * 10) / 10;
}
function costePropMes(propId, mes) {
  return tareasPropMes(propId, mes).reduce((a, t) => a + costeTarea(t), 0);
}

/* posiciones reales en lat/lng (mapa Leaflet de Mallorca) */
const OFICINA = { lat: 39.6936, lng: 3.3494 }; // Costa i Llobera 53, Artà
const ZONA_POS = { // centros aproximados de núcleos, fallback si la propiedad no tiene coordenadas propias
  "artà": [39.6936, 3.3494], "capdepera": [39.7027, 3.4355], "cala ratjada": [39.7128, 3.4629],
  "canyamel": [39.6736, 3.4433], "cala millor": [39.5959, 3.3830], "son servera": [39.6211, 3.3613],
  "colònia de sant pere": [39.7371, 3.2716], "colonia de sant pere": [39.7371, 3.2716],
  "betlem": [39.7346, 3.3120], "cala mesquida": [39.7477, 3.4354], "font de sa cala": [39.6866, 3.4570],
  "cala bona": [39.6070, 3.3937], "s'illot": [39.5807, 3.3468], "sa coma": [39.5850, 3.3660],
  "porto cristo": [39.5417, 3.3358], "manacor": [39.5696, 3.2093], "sant llorenç": [39.6096, 3.2839],
  "palma": [39.5696, 2.6502], "alcúdia": [39.8531, 3.1211], "alcudia": [39.8531, 3.1211],
  "pollença": [39.8770, 3.0163], "pollenca": [39.8770, 3.0163], "inca": [39.7212, 2.9107],
  "santanyí": [39.3548, 3.1290], "santanyi": [39.3548, 3.1290], "felanitx": [39.4696, 3.1481],
};
function posProp(p) {
  if (p.lat && p.lng) return { lat: +p.lat, lng: +p.lng };
  const z = (p.zona || "").toLowerCase().split(" (")[0].trim();
  const c = ZONA_POS[z];
  return c ? { lat: c[0], lng: c[1] } : OFICINA;
}
function posEmpleado(e) {
  const pos = DB.posiciones.find(x => x.empleado_id === e.id);
  if (pos) return { lat: +pos.lat, lng: +pos.lng };
  const t = tareaActiva(e.id);
  if (t && P(t.propiedad_id)) return posProp(P(t.propiedad_id));
  return OFICINA;
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
async function dbGuardarEmpleado(payload, id, datos) {
  const r = id ? await DB.sb.from("empleados").update(payload).eq("id", id).select().single()
               : await DB.sb.from("empleados").insert(payload).select().single();
  if (r.error) return { error: limpiaErr(r.error.message) };
  if (datos) {
    const rd = await DB.sb.from("empleados_datos").upsert({ empleado_id: r.data.id, ...datos });
    if (rd.error) return { error: "Ficha guardada, pero los datos de contrato fallaron: " + limpiaErr(rd.error.message) + " (¿has ejecutado el schema actualizado?)" };
  }
  await dbCargarTodo(); return { emp: r.data };
}
async function dbEliminarEmpleado(id) {
  const { error } = await DB.sb.from("empleados").delete().eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
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
const fotoFichajeObligatoria = () => DB.ajustes.fichaje?.foto_obligatoria !== false;
async function dbFicharEntrada(fotoFile) {
  const me = miEmp(); if (!me) return "Tu cuenta no está vinculada a una ficha de empleado";
  if (fichajeAbierto(me.id)) return "Ya tienes la jornada abierta";
  let fotoPath = null;
  if (fotoFile) fotoPath = await dbSubirFoto(`fichajes/${me.id}/${Date.now()}_in.jpg`, fotoFile);
  const gps = await getGPS();
  const { error } = await DB.sb.from("fichajes").insert({
    empleado_id: me.id, fecha: hoyISO(), lat: gps?.lat, lng: gps?.lng, foto_entrada_path: fotoPath,
  });
  if (error) return limpiaErr(error.message);
  if (gps) await DB.sb.from("posiciones").upsert({ empleado_id: me.id, lat: gps.lat, lng: gps.lng, updated_at: new Date().toISOString() });
  await dbCargarTodo(); return null;
}
async function dbFicharSalida(fotoFile) {
  const me = miEmp(); const f = me && fichajeAbierto(me.id);
  if (!f) return "No tienes jornada abierta";
  const p = pausaAbierta(f.id);
  if (p) await DB.sb.from("fichaje_pausas").update({ fin: new Date().toISOString() }).eq("id", p.id);
  let fotoPath = null;
  if (fotoFile) fotoPath = await dbSubirFoto(`fichajes/${me.id}/${Date.now()}_out.jpg`, fotoFile);
  const gps = await getGPS();
  const { error } = await DB.sb.from("fichajes").update({
    salida: new Date().toISOString(), lat_salida: gps?.lat, lng_salida: gps?.lng, foto_salida_path: fotoPath,
  }).eq("id", f.id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}

/* ---------- absentismo ---------- */
async function dbCrearAusencia(empleado_id, fecha, tipo, motivo, origen, justFile) {
  let justificante_path = null;
  if (justFile) justificante_path = await dbSubirFoto(`ausencias/${empleado_id}/${Date.now()}_${justFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, justFile);
  const { error } = await DB.sb.from("ausencias").insert({
    empleado_id, fecha, tipo, motivo: motivo || null, origen: origen || "manual",
    justificante_path, creado_por: DB.profile?.nombre || null,
  });
  if (error) return limpiaErr(error.message.includes("duplicate") ? "Ya hay una ausencia registrada ese día" : error.message);
  await dbCargarTodo(); return null;
}
async function dbJustificarAusencia(id, motivo, justFile) {
  const a = DB.ausencias.find(x => x.id === id); if (!a) return "No encontrada";
  let justificante_path = a.justificante_path;
  if (justFile) justificante_path = await dbSubirFoto(`ausencias/${a.empleado_id}/${Date.now()}_${justFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, justFile);
  const { error } = await DB.sb.from("ausencias").update({ tipo: "justificada", motivo: motivo || a.motivo, justificante_path }).eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbBorrarAusencia(id) {
  const { error } = await DB.sb.from("ausencias").delete().eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}

/* ---------- reseñas y mejoras (portal del propietario) ---------- */
async function dbCrearResena(payload) {
  const { error } = await DB.sb.from("resenas").insert(payload);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbBorrarResena(id) {
  const { error } = await DB.sb.from("resenas").delete().eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbGuardarMejora(payload, id) {
  const r = id ? await DB.sb.from("mejoras").update(payload).eq("id", id)
               : await DB.sb.from("mejoras").insert(payload);
  if (r.error) return limpiaErr(r.error.message);
  await dbCargarTodo(); return null;
}
async function dbEstadoMejora(id, estado) {
  const cambios = { estado };
  if (estado === "implementada") cambios.implementada_at = hoyISO();
  const { error } = await DB.sb.from("mejoras").update(cambios).eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbBorrarMejora(id) {
  const { error } = await DB.sb.from("mejoras").delete().eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbVincularProp(propId, ownerId) {
  const { error } = await DB.sb.from("propiedades").update({ propietario_id: ownerId }).eq("id", propId);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
/* ---------- CRM de clientes (recurrencia de huéspedes) ---------- */
async function dbGuardarCliente(payload, id) {
  const r = id ? await DB.sb.from("clientes").update(payload).eq("id", id)
               : await DB.sb.from("clientes").insert(payload);
  if (r.error) return limpiaErr(r.error.message);
  await dbCargarTodo(); return null;
}
async function dbBorrarCliente(id) {
  const { error } = await DB.sb.from("clientes").delete().eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbRegistrarContacto(clienteId, via, nota) {
  const { error } = await DB.sb.from("cliente_contactos").insert({ cliente_id: clienteId, via, nota: nota || null, autor: DB.profile?.nombre || null });
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbBorrarContacto(id) {
  const { error } = await DB.sb.from("cliente_contactos").delete().eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbVincularReservaCliente(reservaId, clienteId) {
  const { error } = await DB.sb.from("reservas").update({ cliente_id: clienteId }).eq("id", reservaId);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
const contactosDe = cid => DB.clienteContactos.filter(x => x.cliente_id === cid);
const ultimoContacto = cid => contactosDe(cid)[0] || null;   // ya vienen ordenados desc
const estanciasCliente = cid => DB.reservas.filter(r => r.cliente_id === cid && r.estado !== "bloqueo")
  .slice().sort((a, b) => b.entrada.localeCompare(a.entrada));
const diasDesde = fechaTs => fechaTs ? Math.floor((Date.now() - new Date(fechaTs)) / 864e5) : null;
const haceTxt = fechaTs => {
  const d = diasDesde(fechaTs);
  if (d === null) return "nunca";
  if (d <= 0) return "hoy";
  if (d === 1) return "ayer";
  if (d < 30) return `hace ${d} días`;
  if (d < 365) return `hace ${Math.round(d / 30)} mes${d >= 60 ? "es" : ""}`;
  return `hace más de ${Math.floor(d / 365)} año${d >= 730 ? "s" : ""}`;
};
/* teléfono → enlace wa.me (quita símbolos; si son 9 cifras, antepone 34) */
function telWa(tel) {
  let n = (tel || "").replace(/\D/g, "");
  if (n.length === 9) n = "34" + n;
  return n;
}

/* impacto de una mejora: € por noche × noches del mes (mes anterior como referencia) */
function nochesReferencia(propId) {
  const prev = statsMesProp(propId, addMeses(mesISO(), -1)).noches;
  return prev || statsMesProp(propId, mesISO()).noches || 0;
}
function ingresoExtraMejora(m, mes) {
  if (m.estado !== "implementada") return 0;
  return (+m.incremento_precio || 0) * statsMesProp(m.propiedad_id, mes || mesISO()).noches;
}
/* días pasados con trabajo asignado, sin fichaje y sin ausencia registrada */
function diasSinFichar(empId, desde) {
  const dias = [...new Set(DB.tareas
    .filter(t => (t.equipo_ids || []).includes(empId) && t.fecha >= (desde || addDias(hoyISO(), -90)) && t.fecha < hoyISO())
    .map(t => t.fecha))];
  return dias.filter(d =>
    !DB.fichajes.some(f => f.empleado_id === empId && f.fecha === d) &&
    !DB.ausencias.some(a => a.empleado_id === empId && a.fecha === d)).sort().reverse();
}
function ausenciasDe(empId, desde) {
  return DB.ausencias.filter(a => a.empleado_id === empId && (!desde || a.fecha >= desde));
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
async function dbCrearCompra(propiedad_id, texto) {
  const { error } = await DB.sb.from("compras").insert({ propiedad_id, texto, creado_por: DB.profile?.nombre || null });
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbMarcarCompra(id, comprado) {
  const { error } = await DB.sb.from("compras").update({
    estado: comprado ? "comprado" : "pendiente", comprado_at: comprado ? new Date().toISOString() : null,
  }).eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbBorrarCompra(id) {
  const { error } = await DB.sb.from("compras").delete().eq("id", id);
  if (error) return limpiaErr(error.message);
  await dbCargarTodo(); return null;
}
async function dbFotosTarea(tareaId, files) {
  const t = DB.tareas.find(x => x.id === tareaId); if (!t) return "Tarea no encontrada";
  const nuevas = [];
  for (const file of files || []) {
    const path = `tareas/${tareaId}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;
    if (await dbSubirFoto(path, file)) nuevas.push(path);
  }
  if (!nuevas.length) return null;
  const { error } = await DB.sb.from("tareas").update({ fotos: [...(t.fotos || []), ...nuevas] }).eq("id", tareaId);
  return error ? limpiaErr(error.message) : null;
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
async function dbSubirDocumento(prefix, file) {
  const limpio = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${prefix}/${Date.now()}_${limpio}`;
  const ok = await dbSubirFoto(path, file);
  return ok ? null : "No se pudo subir el documento";
}
async function dbListarDocumentos(prefix) {
  const { data } = await DB.sb.storage.from("fotos").list(prefix, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  return (data || []).filter(d => d.name !== ".emptyFolderPlaceholder");
}
