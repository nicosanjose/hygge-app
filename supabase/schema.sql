-- ============================================================
-- PORTAL HYGGE SERVICES MALLORCA · BACKEND COMPLETO
-- Pegar TODO este archivo una sola vez en:
-- Supabase → SQL Editor → New query → Run
-- Es seguro re-ejecutarlo (idempotente).
-- ============================================================

-- ---------- TABLAS ----------

create table if not exists empleados (
  id             bigint generated always as identity primary key,
  nombre         text not null,
  rol_laboral    text not null default 'Limpieza',      -- Limpieza | Mantenimiento | Piscinas y jardines | Lavandería | Coordinación
  telefono       text,
  color          text not null default '#4f8a5c',
  contrato_horas int  not null default 40,
  activo         boolean not null default true,
  codigo_acceso  text unique default substr(md5(random()::text), 1, 8),
  created_at     timestamptz not null default now()
);

-- datos sensibles del trabajador (contrato, fiscales) · SOLO dirección puede leerlos
create table if not exists empleados_datos (
  empleado_id   bigint primary key references empleados(id) on delete cascade,
  dni           text,
  nass          text,          -- nº afiliación seguridad social
  email         text,
  direccion     text,
  iban          text,
  fecha_alta    date,
  tipo_relacion text not null default 'contrato' check (tipo_relacion in ('contrato','autonomo')),
  tarifa_hora   numeric(8,2) default 0,
  notas         text
);

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text,
  rol         text check (rol in ('direccion','equipo')),
  empleado_id bigint references empleados(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists propietarios (
  id       bigint generated always as identity primary key,
  nombre   text not null,
  pais     text,
  email    text,
  telefono text,
  idioma   text default 'es',
  created_at timestamptz not null default now()
);

create table if not exists propiedades (
  id              bigint generated always as identity primary key,
  nombre          text not null,
  zona            text,
  tipo            text,
  direccion       text,
  propietario_id  bigint references propietarios(id) on delete set null,
  licencia        text,
  habs            int default 0,
  banos           int default 0,
  plazas          int default 0,
  piscina         boolean not null default false,
  llave           text,
  canales         text[] not null default '{}',
  foto_path       text,
  dotacion_ropa   int default 0,
  tarifa_gestion  numeric(10,2) default 0,   -- € / mes (interno)
  tarifa_limpieza numeric(10,2) default 0,   -- € / limpieza (interno)
  notas           text,
  activa          boolean not null default true,
  lat             numeric(9,6),
  lng             numeric(9,6),
  created_at      timestamptz not null default now()
);

create table if not exists reservas (
  id           bigint generated always as identity primary key,
  propiedad_id bigint not null references propiedades(id) on delete cascade,
  entrada      date not null,
  salida       date not null,
  hora_entrada time default '16:00',
  hora_salida  time default '10:00',
  canal        text default 'Directa',
  huesped      text,
  plazas       int,
  importe      numeric(10,2),
  estado       text not null default 'confirmada' check (estado in ('confirmada','bloqueo')),
  notas        text,
  created_at   timestamptz not null default now(),
  check (salida > entrada)
);

create table if not exists tareas (
  id           bigint generated always as identity primary key,
  propiedad_id bigint not null references propiedades(id) on delete cascade,
  fecha        date not null default current_date,
  tipo         text not null default 'limpieza' check (tipo in ('limpieza','mantenimiento','piscina','otro')),
  descripcion  text,
  hora_inicio  time,
  hora_fin     time,
  estado       text not null default 'pendiente' check (estado in ('pendiente','encurso','hecha')),
  equipo_ids   bigint[] not null default '{}',
  checklist    jsonb not null default '[]',   -- [{t:"texto", ok:false}, ...]
  inicio_real  timestamptz,
  fin_real     timestamptz,
  created_at   timestamptz not null default now()
);

-- ampliaciones v1.1 (requisitos del cliente) — seguras de re-ejecutar
alter table propiedades add column if not exists servicios text[] not null default '{}';
alter table tareas add column if not exists fotos text[] not null default '{}';
alter table tareas add column if not exists notas_equipo text;

-- v1.2 · control de asistencia (absentismo)
create table if not exists ausencias (
  id                bigint generated always as identity primary key,
  empleado_id       bigint not null references empleados(id) on delete cascade,
  fecha             date not null,
  tipo              text not null default 'injustificada' check (tipo in ('injustificada','justificada')),
  motivo            text,
  origen            text not null default 'manual' check (origen in ('auto','manual')),
  justificante_path text,
  creado_por        text,
  created_at        timestamptz not null default now(),
  unique (empleado_id, fecha)
);

-- lista de compras / materiales pendientes por propiedad
create table if not exists compras (
  id           bigint generated always as identity primary key,
  propiedad_id bigint not null references propiedades(id) on delete cascade,
  texto        text not null,
  creado_por   text,
  estado       text not null default 'pendiente' check (estado in ('pendiente','comprado')),
  created_at   timestamptz not null default now(),
  comprado_at  timestamptz
);

create table if not exists fichajes (
  id          bigint generated always as identity primary key,
  empleado_id bigint not null references empleados(id) on delete cascade,
  fecha       date not null default current_date,
  entrada     timestamptz not null default now(),
  salida      timestamptz,
  lat         numeric(9,6),
  lng         numeric(9,6),
  lat_salida  numeric(9,6),
  lng_salida  numeric(9,6),
  lugar       text
);

-- v1.2 · prueba gráfica del fichaje (foto de entrada y de salida)
alter table fichajes add column if not exists foto_entrada_path text;
alter table fichajes add column if not exists foto_salida_path text;

create table if not exists fichaje_pausas (
  id         bigint generated always as identity primary key,
  fichaje_id bigint not null references fichajes(id) on delete cascade,
  inicio     timestamptz not null default now(),
  fin        timestamptz
);

create table if not exists posiciones (
  empleado_id bigint primary key references empleados(id) on delete cascade,
  lat         numeric(9,6) not null,
  lng         numeric(9,6) not null,
  updated_at  timestamptz not null default now()
);

create table if not exists incidencias (
  id            bigint generated always as identity primary key,
  propiedad_id  bigint not null references propiedades(id) on delete cascade,
  titulo        text not null,
  descripcion   text,
  prioridad     text not null default 'media' check (prioridad in ('baja','media','alta')),
  estado        text not null default 'abierta' check (estado in ('abierta','resuelta')),
  reportada_por bigint references empleados(id) on delete set null,
  creador_uid   uuid references auth.users(id) on delete set null,
  coste         numeric(10,2),
  fotos         text[] not null default '{}',
  created_at    timestamptz not null default now(),
  resuelta_at   timestamptz
);

create table if not exists incidencia_eventos (
  id            bigint generated always as identity primary key,
  incidencia_id bigint not null references incidencias(id) on delete cascade,
  texto         text not null,
  autor         text,
  created_at    timestamptz not null default now()
);

create table if not exists facturas (
  id             bigint generated always as identity primary key,
  numero         text unique,
  cliente        text not null,
  propietario_id bigint references propietarios(id) on delete set null,
  tipo           text not null default 'Propietario',
  concepto       text,
  lineas         jsonb not null default '[]',   -- [{c:"concepto", importe:0}]
  base           numeric(12,2) not null default 0,
  fecha          date not null default current_date,
  vencimiento    date,
  estado         text not null default 'borrador' check (estado in ('borrador','emitida','cobrada','vencida')),
  created_at     timestamptz not null default now()
);

create table if not exists ajustes (
  clave text primary key,
  valor jsonb not null default '{}'
);

-- valores iniciales
insert into ajustes (clave, valor) values
  ('empresa', '{"nombre":"Hygge Services Mallorca S.L.","cif":"","direccion":"Costa i Llobera 53, Artà · Illes Balears 07570","telefono":"+34 655 958 897","email":"info@hyggeservicesmallorca.com","iban":""}'),
  ('servicios_catalogo', '["Alquiler vacacional","Consigna de llaves","Limpieza","Mantenimiento de piscina","Mantenimiento de jardín"]'),
  ('fichaje', '{"foto_obligatoria": true}'),
  ('checklist_base', '["Ventilar y revisar desperfectos (fotos si hay daños)","Retirar ropa usada y contar juegos para lavandería","Cocina: electrodomésticos, vajilla y superficies","Baños: sanitarios, mampara, espejos y reposición","Dormitorios: hacer camas con juego limpio","Suelos de toda la vivienda y terrazas","Reponer kit de bienvenida","Foto final de cada estancia"]'),
  ('factura_serie', '{"prefijo":"HSM","n":0}'),
  ('tarifas', '{"iva":21}')
on conflict (clave) do nothing;

-- índices
create index if not exists idx_reservas_prop_fechas on reservas (propiedad_id, entrada, salida);
create index if not exists idx_reservas_entrada on reservas (entrada);
create index if not exists idx_reservas_salida on reservas (salida);
create index if not exists idx_tareas_fecha on tareas (fecha);
create index if not exists idx_tareas_prop on tareas (propiedad_id);
create index if not exists idx_fichajes_fecha on fichajes (fecha);
create index if not exists idx_fichajes_emp on fichajes (empleado_id, fecha);
create index if not exists idx_incidencias_estado on incidencias (estado);
create index if not exists idx_facturas_fecha on facturas (fecha);
create index if not exists idx_compras_prop on compras (propiedad_id, estado);
create index if not exists idx_ausencias_emp on ausencias (empleado_id, fecha);

-- ---------- FUNCIONES AUXILIARES ----------

create or replace function is_direccion() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and rol = 'direccion');
$$;

create or replace function my_emp() returns bigint
language sql stable security definer set search_path = public as $$
  select empleado_id from profiles where id = auth.uid();
$$;

-- perfil automático al registrarse
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- reclamar rol tras registrarse:
--  · con código de empleado → rol equipo vinculado a su ficha
--  · sin código y sin ninguna dirección aún → primera cuenta = dirección
create or replace function reclamar_acceso(p_codigo text default null) returns text
language plpgsql security definer set search_path = public as $$
declare v_rol text; v_emp bigint;
begin
  select rol into v_rol from profiles where id = auth.uid();
  if v_rol is not null then return v_rol; end if;

  if p_codigo is not null and length(trim(p_codigo)) > 0 then
    select e.id into v_emp from empleados e
      where e.codigo_acceso = lower(trim(p_codigo)) and e.activo
        and not exists (select 1 from profiles p where p.empleado_id = e.id)
      limit 1;
    if v_emp is null then
      raise exception 'Código no válido o ya utilizado';
    end if;
    update profiles set rol = 'equipo', empleado_id = v_emp,
      nombre = coalesce(nombre, (select nombre from empleados where id = v_emp))
      where id = auth.uid();
    return 'equipo';
  end if;

  if not exists (select 1 from profiles where rol = 'direccion') then
    update profiles set rol = 'direccion' where id = auth.uid();
    return 'direccion';
  end if;

  raise exception 'Cuenta creada pero pendiente de activar: usa un código de equipo o pide a Dirección que te active.';
end $$;

-- dirección promociona una cuenta pendiente
create or replace function activar_direccion(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_direccion() then raise exception 'Solo dirección'; end if;
  update profiles set rol = 'direccion' where id = p_uid;
end $$;

-- numeración de factura atómica (HSM-2026-001)
create or replace function emitir_factura(p_id bigint) returns text
language plpgsql security definer set search_path = public as $$
declare v_n int; v_pref text; v_num text;
begin
  if not is_direccion() then raise exception 'Solo dirección'; end if;
  update ajustes set valor = jsonb_set(valor, '{n}', to_jsonb((valor->>'n')::int + 1))
    where clave = 'factura_serie'
    returning (valor->>'n')::int, valor->>'prefijo' into v_n, v_pref;
  v_num := v_pref || '-' || to_char(current_date, 'YYYY') || '-' || lpad(v_n::text, 3, '0');
  update facturas set numero = v_num, estado = 'emitida',
    vencimiento = coalesce(vencimiento, current_date + 30)
    where id = p_id and estado = 'borrador';
  return v_num;
end $$;

-- ---------- RLS ----------

alter table profiles           enable row level security;
alter table empleados          enable row level security;
alter table propietarios       enable row level security;
alter table propiedades        enable row level security;
alter table reservas           enable row level security;
alter table tareas             enable row level security;
alter table fichajes           enable row level security;
alter table fichaje_pausas     enable row level security;
alter table posiciones         enable row level security;
alter table incidencias        enable row level security;
alter table incidencia_eventos enable row level security;
alter table facturas           enable row level security;
alter table ajustes            enable row level security;

-- profiles
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select to authenticated
  using (id = auth.uid() or is_direccion());
drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles for update to authenticated
  using (is_direccion()) with check (is_direccion());

-- empleados: lectura para todo el equipo autenticado, escritura dirección
drop policy if exists empleados_select on empleados;
create policy empleados_select on empleados for select to authenticated using (true);
drop policy if exists empleados_write on empleados;
create policy empleados_write on empleados for all to authenticated
  using (is_direccion()) with check (is_direccion());

-- datos sensibles de trabajadores: solo dirección
alter table empleados_datos enable row level security;
drop policy if exists empdatos_all on empleados_datos;
create policy empdatos_all on empleados_datos for all to authenticated
  using (is_direccion()) with check (is_direccion());

-- propietarios: solo dirección
drop policy if exists propietarios_all on propietarios;
create policy propietarios_all on propietarios for all to authenticated
  using (is_direccion()) with check (is_direccion());

-- propiedades: lectura autenticados, escritura dirección
drop policy if exists propiedades_select on propiedades;
create policy propiedades_select on propiedades for select to authenticated using (true);
drop policy if exists propiedades_write on propiedades;
create policy propiedades_write on propiedades for all to authenticated
  using (is_direccion()) with check (is_direccion());

-- reservas: lectura autenticados (el equipo ve entradas/salidas), escritura dirección
drop policy if exists reservas_select on reservas;
create policy reservas_select on reservas for select to authenticated using (true);
drop policy if exists reservas_write on reservas;
create policy reservas_write on reservas for all to authenticated
  using (is_direccion()) with check (is_direccion());

-- tareas: lectura autenticados; crear/borrar dirección; actualizar dirección o asignados
drop policy if exists tareas_select on tareas;
create policy tareas_select on tareas for select to authenticated using (true);
drop policy if exists tareas_insert on tareas;
create policy tareas_insert on tareas for insert to authenticated
  with check (is_direccion() or my_emp() = any(equipo_ids));  -- el equipo puede abrirse una tarea ad-hoc en una propiedad
drop policy if exists tareas_delete on tareas;
create policy tareas_delete on tareas for delete to authenticated using (is_direccion());
drop policy if exists tareas_update on tareas;
create policy tareas_update on tareas for update to authenticated
  using (is_direccion() or my_emp() = any(equipo_ids))
  with check (is_direccion() or my_emp() = any(equipo_ids));

-- fichajes: cada cual el suyo, dirección todo
drop policy if exists fichajes_select on fichajes;
create policy fichajes_select on fichajes for select to authenticated
  using (is_direccion() or empleado_id = my_emp());
drop policy if exists fichajes_insert on fichajes;
create policy fichajes_insert on fichajes for insert to authenticated
  with check (is_direccion() or empleado_id = my_emp());
drop policy if exists fichajes_update on fichajes;
create policy fichajes_update on fichajes for update to authenticated
  using (is_direccion() or empleado_id = my_emp())
  with check (is_direccion() or empleado_id = my_emp());

-- pausas: a través del fichaje
drop policy if exists pausas_all on fichaje_pausas;
create policy pausas_all on fichaje_pausas for all to authenticated
  using (exists (select 1 from fichajes f where f.id = fichaje_id and (is_direccion() or f.empleado_id = my_emp())))
  with check (exists (select 1 from fichajes f where f.id = fichaje_id and (is_direccion() or f.empleado_id = my_emp())));

-- posiciones: cada cual la suya, dirección lee todas
drop policy if exists posiciones_select on posiciones;
create policy posiciones_select on posiciones for select to authenticated
  using (is_direccion() or empleado_id = my_emp());
drop policy if exists posiciones_upsert on posiciones;
create policy posiciones_upsert on posiciones for insert to authenticated
  with check (empleado_id = my_emp() or is_direccion());
drop policy if exists posiciones_update on posiciones;
create policy posiciones_update on posiciones for update to authenticated
  using (empleado_id = my_emp() or is_direccion())
  with check (empleado_id = my_emp() or is_direccion());

-- incidencias: leer y crear autenticados; resolver/editar dirección
drop policy if exists incidencias_select on incidencias;
create policy incidencias_select on incidencias for select to authenticated using (true);
drop policy if exists incidencias_insert on incidencias;
create policy incidencias_insert on incidencias for insert to authenticated with check (true);
drop policy if exists incidencias_update on incidencias;
create policy incidencias_update on incidencias for update to authenticated
  using (is_direccion()) with check (is_direccion());
drop policy if exists inc_eventos_select on incidencia_eventos;
create policy inc_eventos_select on incidencia_eventos for select to authenticated using (true);
drop policy if exists inc_eventos_insert on incidencia_eventos;
create policy inc_eventos_insert on incidencia_eventos for insert to authenticated with check (true);

-- ausencias: dirección gestiona; cada trabajador puede ver las suyas
alter table ausencias enable row level security;
drop policy if exists ausencias_select on ausencias;
create policy ausencias_select on ausencias for select to authenticated
  using (is_direccion() or empleado_id = my_emp());
drop policy if exists ausencias_write on ausencias;
create policy ausencias_write on ausencias for all to authenticated
  using (is_direccion()) with check (is_direccion());

-- compras: el equipo añade y marca compradas; borrar, dirección
alter table compras enable row level security;
drop policy if exists compras_select on compras;
create policy compras_select on compras for select to authenticated using (true);
drop policy if exists compras_insert on compras;
create policy compras_insert on compras for insert to authenticated with check (true);
drop policy if exists compras_update on compras;
create policy compras_update on compras for update to authenticated using (true) with check (true);
drop policy if exists compras_delete on compras;
create policy compras_delete on compras for delete to authenticated using (is_direccion());

-- facturas y ajustes
drop policy if exists facturas_all on facturas;
create policy facturas_all on facturas for all to authenticated
  using (is_direccion()) with check (is_direccion());
drop policy if exists ajustes_select on ajustes;
create policy ajustes_select on ajustes for select to authenticated using (true);
drop policy if exists ajustes_write on ajustes;
create policy ajustes_write on ajustes for update to authenticated
  using (is_direccion()) with check (is_direccion());
drop policy if exists ajustes_insert on ajustes;
create policy ajustes_insert on ajustes for insert to authenticated with check (is_direccion());

-- ---------- STORAGE (bucket privado 'fotos') ----------

insert into storage.buckets (id, name, public) values ('fotos','fotos', false)
on conflict (id) do nothing;

drop policy if exists fotos_insert on storage.objects;
create policy fotos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos');
drop policy if exists fotos_select on storage.objects;
create policy fotos_select on storage.objects for select to authenticated
  using (bucket_id = 'fotos'
         and (is_direccion() or (storage.foldername(name))[1] not in ('documentos','empleados','fichajes','ausencias')));
drop policy if exists fotos_delete on storage.objects;
create policy fotos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and is_direccion());

-- ---------- REALTIME ----------

do $$ begin alter publication supabase_realtime add table fichajes;        exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table fichaje_pausas;  exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table posiciones;      exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table tareas;          exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table incidencias;     exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table compras;         exception when duplicate_object then null; end $$;

-- listo ✔
select 'Schema Hygge instalado correctamente' as resultado;
