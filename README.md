# TrucoPro AR - Proyecto completo base

Este paquete incluye una base seria para la plataforma TrucoPro AR.

## Contenido

- `public/index.html`: web principal.
- `public/css/styles.css`: interfaz gamer argentina.
- `public/js/card-renderer.js`: render SVG de cartas españolas.
- `public/js/truco-engine.js`: motor de truco 1v1 contra CPU.
- `public/js/sounds.js`: sonidos generados en navegador.
- `public/js/app.js`: conexión entre UI y motor.
- `server.js`: servidor Express + Socket.IO listo para evolucionar a online.
- `database/supabase_schema.sql`: SQL base para Supabase/PostgreSQL.
- `docs/roadmap.md`: pasos para convertirlo en producto real.

## Probar sin instalar nada

Abrí:

`public/index.html`

Funciona en modo offline contra CPU.

## Probar con servidor local

Necesitás Node.js instalado.

```bash
npm install
npm start
```

Luego abrí:

`http://localhost:3000`

## Qué ya funciona

- Interfaz profesional.
- Mesa visual de truco.
- Cartas españolas renderizadas con SVG.
- Mazo de 40 cartas sin 8 ni 9.
- Jerarquía de truco argentino.
- Juego 1v1 contra CPU.
- Cartas quedan en Mano 1, Mano 2 y Mano 3.
- Envido, Real Envido, Falta Envido.
- Truco.
- Mazo.
- Marcador a 15.
- Sonidos.
- Ranking demo.
- Lobby demo.
- Panel admin demo.
- SQL base.
- Servidor preparado para multijugador.

## Qué falta para producción real

Para que sea una plataforma completa online real:

1. Autenticación real con Supabase Auth.
2. Persistencia de partidas en base de datos.
3. Validación de jugadas 100% en servidor.
4. WebSockets por sala.
5. Reconexion de usuario.
6. Anti-trampas.
7. Torneos reales.
8. Ranking real.
9. Moderación y reportes.
10. Si hay dinero real: legalidad, KYC, términos, auditoría y cumplimiento regulatorio.
