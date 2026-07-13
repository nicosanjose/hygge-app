# Puesta en marcha · Portal Hygge (producto funcional)

La app es 100 % estática (GitHub Pages / Vercel) y habla directamente con **Supabase** (base de datos Postgres, usuarios, fotos y tiempo real). Todo el backend se instala pegando **un solo archivo SQL**.

## 1 · Crear el proyecto de Supabase (~3 min)

1. Entra en [supabase.com](https://supabase.com) → **New project** (el plan Free sobra para empezar).
2. Nombre: `hygge-portal` · Región: **Central EU (Frankfurt)** · guarda la contraseña de la base de datos donde quieras (no se usa en la app).

## 2 · Instalar el backend (1 pegado)

1. En el proyecto: **SQL Editor → New query**.
2. Pega el contenido completo de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
3. Debe terminar con: `Schema Hygge instalado correctamente`. (Es seguro re-ejecutarlo.)

Esto crea: tablas (propiedades con servicios contratados, reservas, tareas con fotos de estado, fichajes con GPS, incidencias con fotos, lista de compras, facturas, propietarios, empleados con datos de contrato, ajustes), **seguridad por roles** (dirección ve todo; el equipo solo lo suyo), numeración de facturas correlativa, bucket privado de fotos y el tiempo real.

## 3 · Ajustes de autenticación (1 min)

- **Authentication → Sign In / Providers → Email** → desactiva **"Confirm email"** (herramienta interna: así las cuentas entran a la primera, sin correo de confirmación).

## 4 · Conectar la app

1. **Project Settings → API** → copia **Project URL** y **anon public key**.
2. Pégalas en [`js/config.js`](js/config.js):
   ```js
   SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
   SUPABASE_ANON_KEY: "eyJ...",
   ```
   (La anon key está pensada para ir en el navegador; la seguridad la ponen las políticas RLS.)
3. Sube el cambio al repositorio (`git push`) y GitHub Pages redespliega solo.

## 5 · Primera cuenta = Dirección

1. Abre la app → pestaña **Crear cuenta** → nombre, email y contraseña, **sin código**.
2. La primera cuenta sin código se convierte automáticamente en **Dirección**. Las siguientes sin código quedan pendientes (se activan desde Ajustes → Usuarios).

## 6 · Alta del equipo

1. Como Dirección: **Equipo en vivo → Añadir persona** → al guardar sale su **código de un solo uso**.
2. Cada persona abre la app en su móvil → **Crear cuenta** → pone el código → entra como **Equipo** (fichar, tareas, incidencias con foto).
3. Consejo: en el móvil, "Añadir a pantalla de inicio" deja la app como una app más.

> **¿Ya tenías el proyecto creado de antes?** El schema es seguro de re-ejecutar: cuando la app se actualice con módulos nuevos (p. ej. la ficha de Trabajadores con datos de contrato), vuelve a pegar `supabase/schema.sql` completo en el SQL Editor y listo. No borra nada.

## 7 · Rellenar datos reales (orden recomendado)

1. **Ajustes** → datos de empresa (salen en informes y facturas) y checklist de limpieza.
2. **Trabajadores** → cada persona con sus datos de contrato; su pestaña **Asistencia** registra el absentismo (detección automática de días con trabajo y sin fichaje, justificantes adjuntos) y en Informes está el **informe de absentismo** con gráficas y análisis automático. El fichaje exige **foto de entrada y salida** (se puede desactivar en Ajustes) (DNI, IBAN, relación laboral, tarifa €/h) y sus documentos; desde su ficha se genera su factura (autónomos) o recibo de horas (contrato) de cada mes. Los datos personales solo los ve dirección.
3. **Propietarios** → los dueños.
4. **Propiedades** → cada casa con su propietario, licencia, **tarifa de gestión €/mes** y **tarifa por limpieza €** (alimentan las facturas y liquidaciones), foto y documentos.
5. **Calendario de cada propiedad** → reservas (con importe si quieres liquidaciones automáticas).
6. **Planificación** → los servicios del día y su equipo.

## Dónde está desplegado

- **App funcional**: https://nicosanjose.github.io/hygge-app/ (GitHub Pages, repo `nicosanjose/hygge-app`).
- **Mockup de demostración** (datos ficticios, para enseñar): https://nicosanjose.github.io/hygge-portal/.
- Para dominio propio (p. ej. `portal.hyggeservicesmallorca.com`): añade un CNAME en GitHub Pages **o** importa el repo en Vercel (framework: "Other", sin build). La app no necesita servidor.

## Qué queda para una fase 2 (no incluido en v1)

- Sincronización automática iCal con Airbnb/Booking (v1: reservas a mano en 20 segundos).
- Envío de emails desde la app (v1: los informes se descargan en PDF y se envían con tu correo).
- VeriFactu real contra la AEAT (v1: numeración correlativa e inalterable, lista para conectar).
- Portal del propietario (cuentas de solo lectura para los dueños).
- Gestión de vacaciones del equipo.
