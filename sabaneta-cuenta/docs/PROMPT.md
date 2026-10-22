# Sabaneta Cuenta — Prompt maestro para Claude Code

> Pega este documento completo como primer mensaje en Claude Code, dentro de una carpeta vacía. Guárdalo también en la raíz del repositorio como `docs/PROMPT.md` y resume sus reglas en un `CLAUDE.md`.

---

## 0. Tu rol y cómo vas a trabajar

Eres el equipo técnico completo de **Sabaneta Cuenta**: arquitecto, desarrollador full-stack, diseñador de base de datos, especialista en seguridad y QA. Vas a construir una aplicación web **totalmente funcional, desplegada en Vercel, con base de datos real en Supabase**, lista para usar con vecinos reales.

Reglas de trabajo:

1. **Trabaja por fases** (sección 12). Al terminar cada fase: corre pruebas, haz commit, y dame un resumen corto de qué quedó y qué falta. No avances a la siguiente fase si la anterior tiene pruebas en rojo.
2. **Antes de escribir código**, muéstrame un plan corto de la fase (archivos, tablas, rutas) y espera mi visto bueno solo en la Fase 0. En las demás, avanza directo.
3. **Nunca inventes datos reales** de Sabaneta (barrios, veredas, cifras, nombres). Donde falten, deja datos de prueba claramente marcados (`[DEMO]`) y un script para cargar los reales.
4. **Todo lo que ve el usuario va en español de Colombia, en lenguaje simple y básico** (sección 3). El código, nombres de tablas y comentarios pueden ir en español o inglés, pero sé consistente: tablas y columnas en español sin tildes ni ñ (`aportes`, `cuadra_h3`, `pequeno`).
5. **Seguridad primero**: Row Level Security en todas las tablas, secretos solo en variables de entorno, ninguna llave de servicio en el cliente.
6. Si una decisión no está en este documento, toma la opción más simple, segura y barata, y anótala en `docs/DECISIONES.md`.
7. Si necesitas algo que solo yo puedo hacer (crear cuentas, pegar llaves, comprar un número), detente y dímelo en una lista clara de pasos.

---

## 1. Qué es Sabaneta Cuenta

Una plataforma cívica de **co-creación ciudadana** en Sabaneta (Antioquia, Colombia). Los vecinos:

- **Cuentan** lo que vive su cuadra: **dolores** (problemas), **deseos** (lo que quisieran tener) y **proyectos** (lo que ya hacen o quieren liderar), ubicados en un mapa.
- **Reparten los 100**: un presupuesto imaginario de 100 pesos entre 12 rubros.
- **Suman**: apoyan las cuentas de otros («Me suma»), invitan vecinos y van a las **Mesas de cuentas claras** (reuniones presenciales).
- **Ven en vivo** lo que construye la comunidad: mapa de proyectos y presupuesto ciudadano por rubro.
- **Reciben respuesta**: cada barrio tiene un **Estado de cuenta** que dice qué entró al programa, qué no y por qué.

Lo que se recoge alimenta el programa de gobierno de **Juan Carlos Jaramillo Jara**, candidato a la Alcaldía de Sabaneta (elecciones del 31 de octubre de 2027). **La marca es cívica**: Sabaneta Cuenta va adelante y el candidato aparece como quien escucha y responde.

### Reglas de oro del producto (no negociables)

- **No se pide el voto** en ninguna pantalla, texto, notificación ni mensaje. La plataforma invita a contar y a construir el programa.
- **No hay premios.** La gamificación es solo de **puntos, insignias y niveles**. No se promete ni se entrega dinero, mercados, bonos, rifas, sorteos, regalos en especie, reuniones privadas ni cupos como premio. Las palabras «premio», «gana», «ganador», «sorteo», «regalo» y «rifa» están prohibidas en la interfaz (crea una prueba automática que las busque en los textos).
- **Único reconocimiento permitido:** saludos personalizados, videos e imágenes inéditas de Juan Carlos Jaramillo Jara, **grabados por él**. Nunca voz, cara o imagen generadas o clonadas con IA.
- **No se muestra la distribución real del presupuesto municipal.** Solo la de los vecinos.
- **Datos sensibles (Ley 1581 de 2012):** participar puede revelar opinión política, que es dato sensible. Consentimiento explícito, política de tratamiento visible, finalidad única y mínimo dato posible (sección 9).

---

## 2. Stack técnico

| Capa               | Tecnología                                                                                                                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App                | **Next.js** (última versión estable, App Router, Server Components, Server Actions) + **TypeScript** estricto                                                                                                                                                                 |
| Estilos            | **Tailwind CSS** con los tokens de la sección 4                                                                                                                                                                                                                               |
| Instalable         | **PWA**: manifest, íconos, service worker (usa `@serwist/next` o equivalente mantenido), pantalla offline simple                                                                                                                                                              |
| Base de datos      | **Supabase**: Postgres + **PostGIS** + Auth + Storage + Realtime + Edge Functions si hacen falta                                                                                                                                                                              |
| Mapa               | **Leaflet** con `react-leaflet`, mapa base OpenStreetMap o Carto con su atribución; cuadras con **H3** (`h3-js`)                                                                                                                                                              |
| IA                 | **API de Claude** (Anthropic SDK oficial), solo en el servidor                                                                                                                                                                                                                |
| Voz a texto        | Dictado del navegador (Web Speech API, `es-CO`) como primera opción; respaldo: subir el audio a Storage y transcribirlo con un proveedor de voz a texto configurable por variable de entorno (deja la interfaz `transcribir(audio)` lista y un adaptador; yo elijo proveedor) |
| Login              | **Celular + código de verificación por WhatsApp** con Supabase Auth (Phone) usando Twilio Verify con canal WhatsApp. Respaldo por SMS. Configurable                                                                                                                           |
| Validación         | **Zod** en todas las entradas (cliente y servidor)                                                                                                                                                                                                                            |
| Pruebas            | **Vitest** (unidad), **Playwright** (extremo a extremo, en celular), pruebas de RLS contra Supabase local                                                                                                                                                                     |
| Calidad            | ESLint, Prettier, `tsc --noEmit`, GitHub Actions                                                                                                                                                                                                                              |
| Despliegue         | **Vercel** (región `gru1`, São Paulo) + Supabase (región `sa-east-1`, São Paulo); entornos **staging** y **producción**                                                                                                                                                       |
| Tareas programadas | **Vercel Cron** que llama rutas protegidas con `CRON_SECRET`                                                                                                                                                                                                                  |
| Errores y uso      | Sentry (opcional por variable de entorno) y Vercel Analytics, sin datos personales                                                                                                                                                                                            |

Usa **Supabase CLI** para migraciones versionadas (`supabase/migrations`), `seed.sql` y desarrollo local con Docker. Genera los tipos de TypeScript desde la base (`supabase gen types`).

---

## 3. Lenguaje: simple y básico

**Regla de oro: si un adulto mayor no lo entiende a la primera, se reescribe.**

- Frases cortas (menos de 15 palabras). Una idea por pantalla.
- Palabras de todos los días: «plata», no «recursos»; «arreglar la calle», no «intervención vial».
- Se habla de **tú**, con calidez y sin regaño.
- Cada botón dice lo que pasa: «Contar algo de mi cuadra», no «Enviar».
- Nada de siglas ni de términos técnicos del presupuesto.
- Errores en palabras simples: «No pudimos guardar. Revisa tu internet e intenta otra vez».
- Centraliza todos los textos en `src/textos/es.ts` para poder revisarlos de una vez.

### Sistema verbal (úsalo tal cual)

| Elemento                       | Nombre en la app                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| Aporte en el mapa              | **Una cuenta** («Cuéntanos qué pasa en tu cuadra»)                                        |
| Tipos de aporte                | **Dolor**, **Deseo**, **Proyecto**                                                        |
| Botón de apoyo                 | **Me suma**                                                                               |
| Presupuesto ciudadano          | **Reparte los 100**                                                                       |
| Tablero público                | **Cuentas en vivo**                                                                       |
| Síntesis semanal               | **Balance de la semana**                                                                  |
| Ficha de devolución por barrio | **Estado de cuenta del barrio**                                                           |
| Reunión presencial             | **Mesa de cuentas claras**                                                                |
| Mesa de redacción del programa | **La mesa grande**                                                                        |
| Muro por barrio                | **La cartelera del barrio**                                                               |
| Invitar                        | **Sumar un vecino**                                                                       |
| Ranking entre barrios          | **Barrios que más cuentan**                                                               |
| Estados de una cuenta          | Recibida · En revisión · Publicada · Costeada · Entra al programa · No entra (con motivo) |

Frase de marca: **«Cuéntale a Sabaneta. Aquí tu barrio cuenta.»**

---

## 4. Marca y diseño

### Tokens de color (tema claro / oscuro)

| Token            | Claro     | Oscuro    | Uso                                                                                        |
| ---------------- | --------- | --------- | ------------------------------------------------------------------------------------------ |
| `naranja`        | `#F28C1E` | `#F28C1E` | Rellenos, acento del logo, botón secundario con texto `tinta`. **Nunca texto sobre crema** |
| `naranja-texto`  | `#B45309` | `#F5A04A` | Texto naranja legible, cifras, enlaces                                                     |
| `verde`          | `#1E7A3C` | `#4CB872` | Botón principal (claro: texto blanco; oscuro: texto `crema` oscuro)                        |
| `verde-profundo` | `#14532D` | `#0B1D13` | Títulos de marca, fondos oscuros                                                           |
| `crema`          | `#FBF6EC` | `#11251A` | Fondo de página                                                                            |
| `tarjeta`        | `#FFFFFF` | `#183223` | Tarjetas, hojas inferiores, modales                                                        |
| `tinta`          | `#1C2B22` | `#F3EFE6` | Texto principal                                                                            |
| `tinta-suave`    | `#4A5A50` | `#B9C2BA` | Texto secundario; borde de campos                                                          |
| `borde`          | `#E3DBCB` | `#2C4A37` | Bordes y separadores                                                                       |
| `dolor`          | `#C2410C` | `#FB8B4E` | Marcador de Dolor                                                                          |
| `deseo`          | `#1D6FB8` | `#6AA8E8` | Marcador de Deseo                                                                          |
| `proyecto`       | `#1E7A3C` | `#4CB872` | Marcador de Proyecto                                                                       |
| `aviso`          | `#A16207` | `#E8B04A` | En revisión                                                                                |
| `error`          | `#B91C1C` | `#F87171` | Errores                                                                                    |

Proporción por pantalla: 70 % crema, 20 % verde, 10 % naranja. Los marcadores del mapa **siempre** llevan ícono y palabra, nunca solo color.

### Tipografía (Google Fonts, con `next/font`)

- **Nunito** 700–900: títulos, cifras, logo.
- **Atkinson Hyperlegible Next** 400 y 700: todo el texto.

| Estilo        | Fuente   | Tamaño / interlineado | Peso |
| ------------- | -------- | --------------------- | ---- |
| display       | Nunito   | 40 / 44               | 900  |
| titulo-1      | Nunito   | 32 / 38               | 800  |
| titulo-2      | Nunito   | 24 / 30               | 800  |
| cifra         | Nunito   | 48 / 52               | 900  |
| cuerpo-grande | Atkinson | 20 / 30               | 400  |
| cuerpo        | Atkinson | 18 / 28               | 400  |
| etiqueta      | Atkinson | 16 / 22               | 700  |
| pequeno       | Atkinson | 16 / 22               | 400  |

**Ningún texto por debajo de 16 px.**

### Espaciado y formas

Espacios: 4, 8, 16, 24, 32, 48 px. **Alto mínimo de botones y filas tocables: 56 px.** Radios: 8 (campos, chips), 16 (tarjetas, botones), 24 (hojas, modales, insignias), 999 (pastillas, avatares).

### Logo

Cuatro arcos de punta redonda que suben como una cuenta; el último naranja con un punto encima (el «+1», el vecino que cuenta); una raya naranja debajo (la raya de la suma). Sin mapas ni símbolos religiosos. Crea estos archivos en `public/marca/` con este código exacto:

`public/marca/simbolo.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 156 V135 A11 11 0 0 1 42 135 V156 M64 156 V111 A11 11 0 0 1 86 111 V156 M108 156 V87 A11 11 0 0 1 130 87 V156" stroke="#14532D" stroke-width="8"/><path d="M152 156 V63 A11 11 0 0 1 174 63 V156" stroke="#F28C1E" stroke-width="8"/><path d="M16 176 H178" stroke="#F28C1E" stroke-width="4.4"/></g><circle cx="163" cy="26" r="6.8" fill="#F28C1E"/></svg>
```

`public/marca/icono-app.svg` (favicon, PWA, avatar de WhatsApp)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="44" fill="#14532D"/><g transform="translate(26 22) scale(0.74)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 156 V135 A11 11 0 0 1 42 135 V156 M64 156 V111 A11 11 0 0 1 86 111 V156 M108 156 V87 A11 11 0 0 1 130 87 V156" stroke="#FBF6EC" stroke-width="14"/><path d="M152 156 V63 A11 11 0 0 1 174 63 V156" stroke="#F28C1E" stroke-width="14"/><path d="M16 176 H178" stroke="#F28C1E" stroke-width="7.7"/></g><circle cx="163" cy="26" r="11.9" fill="#F28C1E"/></g></svg>
```

Crea un componente `<Logo variante="horizontal|simbolo" tema="claro|oscuro" />` que arme el logo horizontal con el símbolo + «Sabaneta» (`verde-profundo`, o `crema` en oscuro) y «Cuenta» (`naranja-texto`, o `naranja` en oscuro) en Nunito 700, en dos líneas. Genera los PNG de la PWA (192, 512, maskable) desde `icono-app.svg` con un script.

### Estilo de interfaz

Cálido, limpio, de barrio; nada de gradientes azul-morado, tarjetas con emoji ni bordes de color a la izquierda. Íconos de línea (Lucide) con trazo redondeado, en armonía con el logo. Las insignias se dibujan en líneas: un arco o un círculo con ícono `verde` y punto `naranja`.

---

## 5. Accesibilidad (público: adultos mayores incluidos)

- Diseño **mobile first** para celulares Android de gama baja (360 px de ancho, 3G). Todo se hace con una mano.
- Botones de 56 px de alto, áreas táctiles amplias, contraste AA en ambos temas.
- **Leer en voz alta** (Web Speech API) en cada cuenta y en el Estado de cuenta.
- **Contar con la voz**: botón grande de micrófono como opción principal junto al texto.
- Navegación con teclado, `aria-*` correctos, foco visible, respeta `prefers-reduced-motion`.
- Rendimiento: LCP < 2,5 s en 4G lento; el mapa carga después del contenido principal.
- Tamaño de letra ajustable (normal / grande) guardado en el perfil.

---

## 6. Funcionalidades

### 6.1 Entrada y registro

1. **Inicio público** (sin login): logo, frase de marca, botón «Contar algo de mi cuadra», botón «Ver Cuentas en vivo», breve «¿Qué es esto?» en tres frases.
2. **Ingreso con celular**: el usuario escribe su número (+57 por defecto) y recibe un código por WhatsApp. Si llega por un enlace de invitación, se guarda el código del vecino que lo invitó.
3. **Consentimiento** (pantalla propia, obligatoria, antes de guardar cualquier dato personal):
   - Explica en lenguaje simple qué se guarda, para qué (construir el programa de gobierno de Sabaneta con los vecinos), quién lo maneja y cómo pedir que se borre.
   - Casillas separadas y **no premarcadas**: (a) acepto el tratamiento de mis datos para esta finalidad, incluido que mi participación puede mostrar mi opinión política; (b) acepto que mi nombre aparezca junto a lo que cuento (opcional; si no, se muestra «Un vecino de [barrio]»); (c) acepto recibir mensajes por WhatsApp sobre Sabaneta Cuenta (opcional).
   - Enlace a la **Política de tratamiento de datos** (`/privacidad`, texto de plantilla marcado «PENDIENTE DE REVISIÓN DEL ABOGADO»).
   - Guarda versión de la política, fecha, hora y las casillas marcadas.
4. **Perfil mínimo**: nombre (como quiere que lo llamen), barrio o vereda (lista + «ubícame en el mapa»), y su cuadra (punto en el mapa, opcional). Rango de edad opcional («Menos de 30», «30 a 59», «60 o más») solo para estadística. **No pedir cédula, dirección exacta ni correo.**
5. Al terminar: pantalla de bienvenida con su nivel **Vecino**, su primera insignia pendiente y el enlace a su comunidad de WhatsApp del barrio.

### 6.2 Contar: Mi cuadra (dolores, deseos y proyectos)

- Flujo de 4 pasos, una idea por pantalla:
  1. ¿Qué quieres contar? → tres botones grandes: **Dolor** («algo que nos afecta»), **Deseo** («algo que nos falta»), **Proyecto** («algo que hacemos o queremos hacer»).
  2. ¿Dónde? → mapa centrado en su cuadra; arrastra el marcador o «usar mi ubicación». El sistema calcula barrio/vereda (PostGIS) y la cuadra (celda H3 resolución 10).
  3. Cuéntanos → texto (máx. 500 caracteres), **nota de voz** (máx. 2 minutos, se transcribe) y **foto** opcional (se comprime en el cliente a ~1600 px, se borran metadatos EXIF y GPS).
  4. Revisa y envía → resumen en palabras simples; botón «Contar».
- Tras enviar: estado **«Recibida»** y mensaje «Gracias. La revisamos y la publicamos pronto».
- **Moderación** (sección 7): la IA sugiere, un moderador humano aprueba. Solo las cuentas **Publicadas** son visibles para otros.
- Cada cuenta publicada muestra: tipo, texto (o transcripción), foto, barrio, «hace X días», autor según su consentimiento, **Me suma** (contador), comentarios y su **estado** con motivo si «No entra».
- **Me suma**: uno por persona por cuenta; se puede quitar. **Comentarios**: texto corto, también moderados (la IA aprueba los evidentes, los dudosos van a revisión).
- La IA agrupa cuentas parecidas de la misma zona: si al contar algo ya existe una cuenta similar a menos de 300 m, sugiere «¿Es lo mismo que esto? Súmate» antes de crear una nueva.

### 6.3 Reparte los 100

- Pregunta fija: **«Si Sabaneta tuviera 100 pesos, ¿cuántos le pondrías a cada cosa?»**
- 12 rubros (tabla `rubros`, editable por admin; ícono Lucide + nombre corto + una línea de ejemplo):
  Educación · Salud · Deporte y recreación · Arte y cultura · Seguridad y convivencia · Agua y servicios públicos · Movilidad y vías · Ambiente y animales · Vivienda y espacio público · Empleo y emprendimiento · Niñez y juventud · Adulto mayor y familia.
- Interfaz: contador grande «Te quedan **X** pesos» (estilo `cifra`); por rubro, botones grandes **−** y **+** (pasos de 5, con mantener presionado para pasos de 1) y el valor. Barra que se llena hasta 100.
- Solo se puede guardar si la suma es **exactamente 100** (validado en cliente, servidor y con `CHECK`/trigger en la base).
- **Un reparto vigente por persona**; puede cambiarlo cuando quiera (se guarda historial, cuenta el último).
- Al guardar: «Así lo repartiste tú» vs. «Así lo reparte tu barrio» vs. «Así lo reparte Sabaneta», en barras horizontales simples.
- **Nunca** mostrar ni mencionar la distribución real del presupuesto municipal.

### 6.4 Cuentas en vivo (tablero público, sin login, en tiempo real)

- **Mapa** con las cuentas publicadas, filtros por tipo, barrio y rubro, agrupación de marcadores (cluster), y estado de cada una.
- **El presupuesto de los vecinos**: promedio de los 100 pesos por rubro, para todo Sabaneta y filtrable por barrio, con «X vecinos han repartido».
- **Contadores**: cuentas publicadas, vecinos que han sumado, barrios activos, cuentas que entraron al programa.
- **Barrios que más cuentan**: ranking colectivo por barrio (participación por habitante si hay dato de población; si no, absoluta).
- Actualización en tiempo real con **Supabase Realtime** (suscripción a cambios de vistas/tablas públicas o a un canal de difusión que actualiza el servidor). Si no hay conexión, refresca cada 60 s.
- **Privacidad**: el tablero nunca muestra teléfonos, ubicación exacta de personas ni datos de perfil. Las cuentas muestran su punto; los repartos solo como agregados con mínimo **5 personas** por barrio (si hay menos, se muestra «Aún pocos vecinos»).

### 6.5 Estado de cuenta del barrio

Página pública por barrio/vereda (`/barrio/[slug]`):

- **Balance de la semana** (síntesis de IA aprobada por el equipo).
- Lo que el barrio contó, agrupado por tema, con sus «Me suma».
- **Lo que entró al programa** (con costo aproximado si el equipo lo cargó y el nombre de quien lo propuso, según consentimiento).
- **Lo que no entra y por qué** (motivo en una frase).
- Cómo repartió el barrio los 100.
- Próximas **Mesas de cuentas claras** del barrio.
- Enlace a la comunidad de WhatsApp del barrio y a la cartelera.

### 6.6 Puntos, insignias y niveles

**Libro de puntos** (`puntos_movimientos`, solo inserción, nunca se edita): cada movimiento con usuario, acción, puntos, referencia y fecha. El total del usuario es la suma. Los puntos se otorgan **en el servidor** (triggers o funciones `security definer`), nunca desde el cliente.

| Acción                              | Puntos | Regla                                                          |
| ----------------------------------- | ------ | -------------------------------------------------------------- |
| Cuenta publicada                    | 10     | Al pasar a Publicada                                           |
| Cuenta que entra al programa        | 50     | Al marcarse «Entra al programa»                                |
| Reparte los 100 completado          | 20     | **Una sola vez** por persona                                   |
| Vecino sumado y verificado          | 15     | Cuando el invitado verifica su celular y acepta consentimiento |
| Registro que llega por tu enlace    | 5      | Al registrarse (antes de verificar no cuenta)                  |
| Asistencia a Mesa de cuentas claras | 30     | Con QR válido en la mesa                                       |
| Me suma o comentario publicado      | 1      | **Tope 10 puntos por día**                                     |

Si una cuenta se despublica por moderación, se registra un movimiento negativo que revierte sus puntos.

**Niveles** (tabla `niveles`, umbrales editables; valores iniciales provisionales):

| Nivel                   | Desde | Reconocimiento que desbloquea                   |
| ----------------------- | ----- | ----------------------------------------------- |
| Vecino                  | 0     | Insignias y aparecer en el ranking de su barrio |
| Vocero de cuadra        | 100   | Saludo personalizado en audio de Juan           |
| Líder de barrio         | 400   | Video personalizado de Juan                     |
| Constructor de Sabaneta | 1000  | Imágenes y videos inéditos de Juan              |

**Insignias** (tabla `insignias`, reglas evaluadas en el servidor):

| Insignia        | Se gana al…                                                                             |
| --------------- | --------------------------------------------------------------------------------------- |
| Primera cuenta  | Tener la primera cuenta publicada                                                       |
| Repartí los 100 | Completar Reparte los 100                                                               |
| Ojo de cuadra   | Tener 5 cuentas publicadas en la misma cuadra                                           |
| Suma vecinos    | Sumar 10 vecinos verificados                                                            |
| Cuentas claras  | Asistir a 3 Mesas de cuentas claras                                                     |
| Mi idea cuenta  | Tener una cuenta que entra al programa                                                  |
| Cuadra completa | Que su cuadra tenga dolor, deseo y proyecto publicados por al menos 5 vecinos distintos |

**Reconocimientos (contenido de Juan):** tabla `reconocimientos` (tipo: saludo_audio, video, imagen; nivel requerido; archivo en Storage privado; activo). Al subir de nivel, el usuario ve «Juan te dejó un mensaje» en su perfil y lo reproduce con URL firmada de corta duración. Los saludos **personalizados** se gestionan como una cola: el admin ve quién subió de nivel, Juan graba y el admin sube el archivo asignado a esa persona. Nada de esto se genera con IA.

**Ranking**: por defecto se muestra el **ranking de barrios**. El ranking individual solo dentro de su barrio, solo con quienes aceptaron mostrar su nombre, y mostrando los 10 primeros + la posición propia.

**Antifraude**: límites de frecuencia (máx. 10 cuentas por día por persona, 60 Me suma por hora), un celular = una persona, referidos solo cuentan tras verificación, bloqueo de autorreferidos, detección de muchas cuentas desde el mismo dispositivo/IP (marca para revisión, no bloqueo automático), y bandera de «revisar» en el panel.

### 6.7 Sumar un vecino (referidos)

- Cada usuario tiene un código corto y un enlace `https://<dominio>/s/<codigo>`.
- Botón «Sumar un vecino por WhatsApp» que abre `https://wa.me/?text=<mensaje>` con un mensaje ya escrito y su enlace. El usuario lo envía él mismo. **La app nunca envía mensajes automáticos a contactos.**
- Mensaje sugerido (editable por admin): «Hola, estoy contando lo que necesita nuestra cuadra en Sabaneta Cuenta. Súmate aquí: <enlace>».
- Se ve «Has sumado X vecinos» y la lista con nombre corto y estado (registrado / verificado).

### 6.8 Comunidades por barrio

- **Comunidades de WhatsApp por barrio** (creadas a mano por coordinadores): tabla `comunidades_whatsapp` con barrio y enlace de invitación. Al registrarse, la app muestra el enlace correcto según su barrio.
- **La cartelera del barrio**: muro dentro de la app, por barrio, con publicaciones cortas de vecinos y del equipo (moderadas), avisos de mesas y el Balance de la semana. Solo pueden publicar quienes tienen ese barrio en su perfil.
- **Fase posterior (no construir ahora, dejar interfaz preparada):** células de 8 por cuadra con la API oficial de WhatsApp Business a través de un proveedor (Gupshup o YCloud). **Prohibido** usar librerías no oficiales de automatización de WhatsApp.

### 6.9 Mesas de cuentas claras

- El equipo crea mesas: barrio, lugar, fecha, hora de inicio y fin, cupo opcional.
- Página pública de la mesa y aparición en el Estado de cuenta del barrio.
- **Asistencia con QR**: en la mesa se proyecta un QR que cambia cada 60 segundos (token firmado con la mesa y una ventana de tiempo). El vecino lo escanea con la app (sesión iniciada) y queda registrado; solo vale durante la mesa (con 30 min de margen). Una asistencia por persona por mesa.
- El coordinador también puede registrar asistentes manualmente buscando por celular.

### 6.10 Panel del equipo (`/equipo`)

Roles: **admin**, **moderador**, **coordinador** (de uno o más barrios), **analista** (solo lectura). Todo el panel protegido por rol en el servidor y en RLS.

- **Moderación**: cola de cuentas, comentarios y publicaciones de cartelera con la sugerencia de la IA (tipo, rubro, eje, resumen, posibles duplicados, alertas: insulto, datos personales de terceros, acusaciones a personas con nombre, contenido violento, spam). Acciones: publicar, editar texto (con rastro), unir con otra cuenta, rechazar con motivo, marcar para revisar. Atajos de teclado.
- **Programa**: tablero de cuentas publicadas por eje/rubro/barrio; marcar «Costeada» (con costo aproximado y fuente), «Entra al programa» o «No entra» (motivo obligatorio en lenguaje simple).
- **Mapa de calor** de dolores, deseos y proyectos por barrio, rubro y tipo.
- **Balances semanales**: borradores generados por IA por barrio; el equipo los edita y aprueba antes de publicarlos.
- **Mesas**: crear, mostrar QR a pantalla completa, ver asistentes.
- **Comunidades**: cargar enlaces de WhatsApp por barrio.
- **Reconocimientos**: subir contenido de Juan, cola de saludos personalizados pendientes.
- **Personas**: búsqueda por celular o nombre, ver puntos e historial, ajustar puntos con motivo (queda en auditoría), bloquear.
- **Territorio**: cargar polígonos de barrios y veredas (GeoJSON), ver cobertura.
- **Exportar** CSV de cuentas y agregados (sin teléfonos). Toda exportación queda en auditoría.
- **Métricas**: registros por día, verificados, cuentas por estado, repartos, asistencia, crecimiento por barrio y aritmética de nodos (meta configurable).

### 6.11 Derechos del titular (Ley 1581)

En el perfil, sección «Mis datos»:

- **Ver mis datos**: descarga en JSON de todo lo suyo.
- **Corregir** nombre, barrio y preferencias.
- **Revocar** permisos opcionales (mostrar nombre, mensajes por WhatsApp).
- **Borrar mi cuenta**: elimina perfil y datos personales; sus cuentas publicadas quedan anónimas («Un vecino de [barrio]») y sus repartos se mantienen solo como agregado sin vínculo. Confirmación en dos pasos.
- Correo o canal de contacto para reclamos (variable de entorno).

---

## 7. Inteligencia artificial (API de Claude)

Usa el SDK oficial de Anthropic **solo en el servidor** (Server Actions, Route Handlers o Edge Functions). Verifica en la documentación oficial (docs.claude.com) los nombres de modelo vigentes; propuesta inicial:

- **`claude-haiku-5-5`** para clasificar y moderar cada cuenta y comentario (rápido y barato).
- **`claude-sonnet-5-5`** para el Balance de la semana y la agrupación de duplicados.

Modelos en variables de entorno (`CLAUDE_MODELO_RAPIDO`, `CLAUDE_MODELO_SINTESIS`).

Tareas:

1. **Clasificar y moderar** (al crear una cuenta o comentario): respuesta en JSON estructurado (usa _tool use_ con esquema) con: `tipo_sugerido`, `rubro_sugerido` (uno de los 12), `eje_programa`, `resumen_simple` (máx. 20 palabras, lenguaje simple), `alertas[]`, `contiene_datos_personales`, `recomendacion` (`publicar` | `revisar` | `rechazar`) y `motivo`. **La IA nunca publica ni rechaza sola las cuentas**; solo prioriza la cola. Para comentarios, `publicar` con confianza alta puede publicarse automáticamente.
2. **Duplicados**: con candidatos cercanos (PostGIS, < 300 m, mismo rubro), la IA dice si son el mismo asunto.
3. **Balance de la semana** (Vercel Cron, lunes 6:00 a. m. hora Colombia): por barrio, resume en lenguaje simple qué se contó, qué suma más y qué cambió. Queda como **borrador** para aprobación humana.
4. **Transcripción** de notas de voz: con el proveedor de voz a texto; luego la IA limpia muletillas sin cambiar el sentido.

Reglas de IA:

- Prompts del sistema en `src/ia/prompts/` en español, con ejemplos.
- No enviar teléfonos ni datos de perfil a la IA: solo texto de la cuenta, tipo, barrio y rubros.
- Registrar cada llamada (tarea, modelo, tokens, latencia, resultado) en `ia_registros`, sin datos personales.
- Reintentos con espera exponencial y cola; si la IA falla, la cuenta queda en revisión manual.
- Presupuesto de gasto: tope diario de llamadas configurable; al superarlo, todo pasa a revisión manual.

---

## 8. Base de datos (Supabase / Postgres + PostGIS)

Diseña las migraciones con estas tablas como mínimo (ajusta tipos e índices con criterio; documenta en `docs/BASE_DE_DATOS.md` con un diagrama Mermaid):

- `territorios` — barrios y veredas: `id`, `nombre`, `slug`, `tipo` (barrio/vereda), `geom` (MultiPolygon, SRID 4326), `poblacion` (nullable). Índice GiST.
- `perfiles` — `id` (= `auth.users.id`), `nombre_mostrar`, `territorio_id`, `cuadra_h3`, `punto_cuadra` (Point, nullable), `rango_edad`, `codigo_referido` (único), `referido_por`, `rol` (vecino/moderador/coordinador/analista/admin), `tamano_letra`, `bloqueado`, fechas.
- `consentimientos` — `perfil_id`, `version_politica`, `acepta_tratamiento`, `acepta_mostrar_nombre`, `acepta_whatsapp`, `fecha`, `ip_hash`, `user_agent`. Historial: nueva fila en cada cambio.
- `aportes` (las cuentas) — `id`, `autor_id`, `tipo` (dolor/deseo/proyecto), `texto`, `transcripcion`, `foto_path`, `audio_path`, `geom` (Point), `territorio_id`, `cuadra_h3`, `rubro_id`, `eje`, `estado` (recibida/en_revision/publicada/costeada/entra/no_entra/rechazada), `motivo_estado`, `costo_aproximado`, `fuente_financiacion`, `unido_a` (FK a aportes), `ia_sugerencia` (jsonb), `contador_suma` (desnormalizado con trigger), fechas, `publicada_en`.
- `apoyos` (Me suma) — `aporte_id`, `perfil_id`, PK compuesta.
- `comentarios` — `aporte_id`, `autor_id`, `texto`, `estado`, fechas.
- `rubros` — 12 filas semilla: `id`, `nombre`, `icono`, `ejemplo`, `orden`, `activo`.
- `repartos` — `id`, `perfil_id`, `vigente` (bool; índice único parcial: un vigente por perfil), `creado_en`.
- `reparto_items` — `reparto_id`, `rubro_id`, `pesos` (0–100). Trigger/constraint: suma = 100 por reparto.
- Vistas o vistas materializadas: `v_reparto_sabaneta`, `v_reparto_por_territorio` (con umbral mínimo de 5 personas), `v_contadores_publicos`, `v_ranking_territorios`, `v_aportes_publicos` (sin autor si no hay consentimiento). Refresco por trigger o cada minuto con `pg_cron`.
- `puntos_movimientos` — `perfil_id`, `accion`, `puntos`, `ref_tipo`, `ref_id`, `creado_en`. Índice único que impida duplicar acciones únicas (p. ej. `reparto_completado` una vez).
- `niveles`, `insignias`, `perfil_insignias`.
- `reconocimientos`, `reconocimientos_entregados` (incluye personalizados por perfil).
- `referidos` — `invitador_id`, `invitado_id`, `estado` (registrado/verificado), fechas.
- `mesas`, `mesa_asistencias` (único por mesa+perfil).
- `comunidades_whatsapp` — `territorio_id`, `nombre`, `enlace`, `activa`.
- `cartelera_publicaciones` — `territorio_id`, `autor_id`, `texto`, `estado`, `fijada`, fechas.
- `balances_semanales` — `territorio_id`, `semana`, `borrador`, `texto_publicado`, `estado` (borrador/aprobado), `aprobado_por`.
- `ia_registros`, `auditoria` (quién, qué, cuándo, antes/después, para acciones del equipo).
- `configuracion` — clave/valor: textos editables, umbrales, topes, meta de nodos.

Funciones y triggers:

- `asignar_territorio()` antes de insertar en `aportes`/`perfiles`: `ST_Contains` del polígono con el punto. Si el punto queda fuera de Sabaneta, rechazar con mensaje simple.
- Cálculo de `cuadra_h3` en el servidor con `h3-js` (o extensión `h3` de Postgres si está disponible en Supabase).
- Otorgamiento de puntos e insignias por triggers sobre cambios de estado, apoyos, repartos, referidos y asistencias.
- Funciones `security definer` con `search_path` fijo y verificación de rol.

**RLS (obligatorio, con pruebas):**

- Público anónimo: solo lectura de vistas públicas, `territorios`, `rubros`, `mesas`, `balances_semanales` aprobados, `comunidades_whatsapp` activas.
- Vecino autenticado: lee y edita su perfil; crea aportes/apoyos/comentarios/repartos propios; ve sus aportes en cualquier estado; ve aportes publicados de otros; no ve teléfonos de nadie.
- Moderador/coordinador/admin: según rol; coordinador limitado a sus territorios.
- `puntos_movimientos`, `perfil_insignias`, `referidos`: el usuario solo lee lo suyo; escritura solo por funciones del servidor.

**Storage:** buckets `fotos` (lectura pública solo de aportes publicados vía URL firmada o ruta pública controlada), `audios` (privado), `reconocimientos` (privado, URLs firmadas de 10 minutos). Límites de tamaño y tipo MIME.

**Semilla (`seed.sql`):** 12 rubros, niveles, insignias, configuración, 3 territorios `[DEMO]` con polígonos aproximados dentro de Sabaneta, 30 aportes `[DEMO]`, 20 perfiles de prueba, repartos de prueba. Script `scripts/importar-territorios.ts` para cargar el GeoJSON oficial de barrios y veredas que entregue Planeación.

---

## 9. Legal y cumplimiento

- **Ley 1581 de 2012 y Decreto 1377 de 2013**: consentimiento previo, expreso e informado; dato sensible (opinión política) con autorización explícita y opcionalidad clara; política de tratamiento visible (`/privacidad`); finalidad única declarada; derechos de consulta, actualización, rectificación y supresión (6.11); registro de autorizaciones.
- **Transferencia internacional**: los servidores en São Paulo (Brasil) y el procesamiento de IA implican transferencia internacional de datos. Muéstralo en la política y déjalo en `docs/PENDIENTES_LEGALES.md` para revisión del abogado.
- **Precampaña**: textos sin llamado al voto; página `/quienes-somos` que diga con claridad que Sabaneta Cuenta es una iniciativa liderada por Juan Carlos Jaramillo Jara para construir su programa con los vecinos (sin ocultar la relación). Marca el texto como pendiente de revisión del abogado electoral.
- **Gastos**: deja en `docs/COSTOS.md` la lista de servicios con costo mensual estimado (Vercel, Supabase, Twilio, voz a texto, Claude) para reportarlos como gasto de campaña.
- **Términos de uso** (`/terminos`) con reglas de convivencia: respeto, nada de datos personales de terceros, nada de acusaciones con nombre propio, nada de contenido violento.
- Cookies: solo las necesarias; sin rastreadores publicitarios.

---

## 10. Rutas de la app

Públicas: `/` · `/en-vivo` · `/barrio/[slug]` · `/cuenta/[id]` · `/mesas` · `/mesas/[id]` · `/s/[codigo]` · `/privacidad` · `/terminos` · `/quienes-somos` · `/ingresar`.

Con sesión: `/bienvenida` (consentimiento + perfil) · `/contar` · `/reparte` · `/mi-cuadra` · `/cartelera` · `/sumar` · `/perfil` (puntos, nivel, insignias, mensajes de Juan, mis cuentas, mis datos) · `/mesa/asistir`.

Equipo: `/equipo` · `/equipo/moderacion` · `/equipo/programa` · `/equipo/mapa` · `/equipo/balances` · `/equipo/mesas` · `/equipo/comunidades` · `/equipo/reconocimientos` · `/equipo/personas` · `/equipo/territorio` · `/equipo/metricas` · `/equipo/configuracion`.

Navegación del vecino: barra inferior fija con 4 botones grandes: **Contar**, **En vivo**, **Mi barrio**, **Yo**.

API internas: `/api/cron/balances`, `/api/cron/refrescar-vistas`, `/api/ia/clasificar`, `/api/mesas/qr`, protegidas con secreto o sesión y rol.

---

## 11. Variables de entorno

Crea `.env.example` documentado con, al menos:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
CLAUDE_MODELO_RAPIDO=claude-haiku-5-5
CLAUDE_MODELO_SINTESIS=claude-sonnet-5-5
IA_TOPE_DIARIO_LLAMADAS=2000
VOZ_A_TEXTO_PROVEEDOR=
VOZ_A_TEXTO_API_KEY=
TWILIO_ACCOUNT_SID=        # configurado en Supabase Auth > Phone
TWILIO_VERIFY_SERVICE_SID=
CRON_SECRET=
MESA_QR_SECRET=
NEXT_PUBLIC_SITIO_URL=
NEXT_PUBLIC_CONTACTO_DATOS=
SENTRY_DSN=
```

Nunca exponer `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` ni secretos con prefijo `NEXT_PUBLIC_`.

---

## 12. Fases de construcción

Cada fase termina con: pruebas en verde, `tsc` sin errores, lint limpio, commit con mensaje claro y un resumen para mí.

**Fase 0 — Cimientos.** Repositorio, Next.js + TS + Tailwind con tokens, fuentes, logo y PWA; Supabase local con PostGIS; estructura de carpetas; CI en GitHub Actions; `CLAUDE.md`; `docs/`. Página de inicio con la marca. _Hecho cuando:_ corre local, pasa CI, y se ve la portada en celular.

**Fase 1 — Ingreso, consentimiento y perfil.** Login por celular con código (en local, usa los números de prueba de Supabase Auth), consentimiento con registro, perfil mínimo, territorios demo, RLS de perfiles. _Hecho cuando:_ un usuario nuevo entra, acepta, elige barrio y ve su bienvenida; pruebas de RLS pasan.

**Fase 2 — Contar.** Flujo de 4 pasos, mapa, H3, foto comprimida sin EXIF, nota de voz con dictado y respaldo de transcripción, estados, Me suma, comentarios, sugerencia de duplicados. _Hecho cuando:_ se cuenta con texto, foto y voz desde un celular y aparece en «Mis cuentas» como Recibida.

**Fase 3 — Moderación e IA.** Panel de moderación con roles, clasificación con Claude, registro de IA, topes. _Hecho cuando:_ una cuenta llega a la cola con sugerencia, un moderador la publica y se ve en el mapa.

**Fase 4 — Reparte los 100.** Interfaz, validaciones en las tres capas, historial, comparación tú/barrio/Sabaneta. _Hecho cuando:_ no se puede guardar algo distinto de 100 por ninguna vía (incluida la API directa).

**Fase 5 — Cuentas en vivo.** Tablero público, vistas agregadas con umbral de 5, Realtime, ranking de barrios. _Hecho cuando:_ al publicar una cuenta o guardar un reparto en otra ventana, el tablero cambia en menos de 5 segundos.

**Fase 6 — Puntos, insignias, niveles y referidos.** Libro de puntos, triggers, topes diarios, insignias, niveles, enlaces de referido, botón de WhatsApp, antifraude, perfil con mensajes de Juan, cola de saludos personalizados. _Hecho cuando:_ pruebas cubren cada regla de la tabla de puntos, incluidos topes y reversos.

**Fase 7 — Barrio, cartelera y comunidades.** Estado de cuenta del barrio, cartelera moderada, enlaces de WhatsApp por barrio, Programa en el panel (costeada / entra / no entra). _Hecho cuando:_ el Estado de cuenta muestra lo que entró y lo que no con motivo.

**Fase 8 — Mesas con QR.** Crear mesas, QR rotativo firmado, asistencia, puntos. _Hecho cuando:_ un QR vencido o fuera de la ventana es rechazado y uno válido suma 30 puntos una sola vez.

**Fase 9 — Balance de la semana y métricas.** Cron, borradores de IA, aprobación, panel de métricas, exportaciones con auditoría. _Hecho cuando:_ el cron genera borradores en staging y un admin publica uno.

**Fase 10 — Datos, legal y endurecimiento.** Mis datos (descargar, corregir, revocar, borrar), páginas legales, encabezados de seguridad (CSP, HSTS), límites de frecuencia, revisión de RLS completa, accesibilidad (axe sin errores), Lighthouse móvil ≥ 90 en rendimiento y accesibilidad. _Hecho cuando:_ checklist de la sección 14 completo.

**Fase 11 — Despliegue.** Proyectos de Supabase staging y producción, migraciones aplicadas, Vercel con dominios, variables, cron, Twilio Verify en Supabase Auth; guía `docs/DESPLIEGUE.md` paso a paso para mí; `docs/OPERACION.md` para el equipo (moderar, crear mesas, subir contenido de Juan, cargar barrios). _Hecho cuando:_ staging funciona de punta a punta con mi celular.

---

## 13. Pruebas obligatorias

- **Unidad (Vitest):** reglas de puntos, validación del reparto, cálculo de nivel, textos prohibidos, generación y validación del QR, adaptador de IA (con mocks).
- **Base de datos:** pruebas de RLS para cada rol (anónimo, vecino, otro vecino, moderador, coordinador de otro barrio, admin); constraint de 100; un reparto vigente; puntos únicos.
- **Extremo a extremo (Playwright, viewport 360×740):** registro completo; contar con foto; moderar y publicar; repartir 100; ver en vivo; sumar un vecino; asistir a una mesa; borrar mi cuenta.
- **Contenido:** prueba que falle si aparece en la interfaz «vota», «voto», «premio», «gana», «ganador», «sorteo», «rifa» o «regalo».
- **Accesibilidad:** axe en todas las páginas públicas y del vecino.

---

## 14. Checklist de salida a producción

- [ ] RLS activo en todas las tablas y probado.
- [ ] Ningún secreto en el cliente ni en el repositorio.
- [ ] Consentimiento obligatorio antes de guardar datos; política visible.
- [ ] Borrar mi cuenta funciona y anonimiza.
- [ ] Ningún texto pide el voto ni promete premios.
- [ ] Reparto solo guarda con suma 100.
- [ ] El tablero no muestra datos personales ni agregados de menos de 5 personas.
- [ ] Fotos sin metadatos de ubicación.
- [ ] Cron con secreto; endpoints del equipo con rol.
- [ ] Copias de seguridad de Supabase activas (PITR si el plan lo permite).
- [ ] Lighthouse móvil ≥ 90 (rendimiento y accesibilidad).
- [ ] `docs/DESPLIEGUE.md`, `docs/OPERACION.md`, `docs/PENDIENTES_LEGALES.md` y `docs/COSTOS.md` completos.

---

## 15. Lo que necesito que me digas al final

1. El enlace de staging y cómo probarlo desde mi celular.
2. La lista de cuentas y llaves que debo crear o pegar (Supabase, Vercel, Twilio, Anthropic, voz a texto, dominio).
3. Lo que quedó pendiente o con datos `[DEMO]` (barrios reales, textos legales, umbrales de niveles, contenido de Juan).
4. El costo mensual estimado con 2.000 y con 20.000 usuarios.

Empieza por la **Fase 0**: muéstrame el plan y espera mi visto bueno.
