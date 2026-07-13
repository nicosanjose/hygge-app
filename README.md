# Portal Hygge Services Mallorca · producto funcional

Portal operativo real para Hygge Services Mallorca: propiedades y reservas, planificación de limpiezas, **fichajes con GPS** (RD-ley 8/2019), equipo en vivo sobre el mapa del Llevant, incidencias con fotos, informes mensuales y facturación con numeración correlativa.

- **Frontend**: HTML/CSS/JS estático (este repo) → GitHub Pages / Vercel.
- **Backend**: Supabase (Postgres + Auth + Storage + Realtime) con seguridad por roles (RLS): Dirección ve todo, el Equipo solo lo suyo.
- **Puesta en marcha**: ver [SETUP.md](SETUP.md) — un pegado de SQL y dos claves en `js/config.js`.

La versión **mockup con datos ficticios** (para demos comerciales) vive aparte: [hygge-portal](https://github.com/nicosanjose/hygge-portal).

Empieza vacío a propósito: se rellena con los datos reales de la empresa desde la propia interfaz.
