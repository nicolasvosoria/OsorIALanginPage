# Portafolio de servicios OsorIA.tech
### Guía para la alianza con SM BUSINESS SOLUTIONS S.A.S.

> **Cómo usar este documento.** Las secciones 1 a 9 son el catálogo completo:
> cada línea de servicio dice qué incluye, qué se entrega y sobre qué
> experiencia real se apoya. La sección 10 explica cómo trabajamos y la 11
> propone el esquema de la alianza. Al final está un correo listo para
> copiar y enviar.

---

## Resumen en una frase

**OsorIA.tech construye, integra y sostiene software con inteligencia
artificial: desde el modelo predictivo y la automatización que elimina el
trabajo manual, hasta la página web, la app móvil y el soporte del sistema
que queda funcionando después.**

Nuestra promesa pública es *"No debes ser experto en IA, nosotros hacemos lo
difícil por ti"*. Para SM Business Solutions eso se traduce en un aliado
técnico que puede tomar un requerimiento de negocio y devolverlo como
producto en operación, con soporte.

---

## 1. Desarrollo de soluciones con inteligencia artificial

Herramientas a la medida del negocio, con IA integrada donde realmente
cambia el resultado — no IA por moda.

**Qué incluye**
- Diagnóstico del proceso y definición del caso de uso con retorno medible.
- Asistentes conversacionales y agentes que consultan las bases de datos
  reales del cliente y responden con información viva, no con un guion fijo.
- Extracción automática de información desde documentos: facturas, órdenes,
  contratos, tickets, confirmaciones y PDFs escaneados; salen datos
  estructurados listos para el sistema.
- Clasificación y enrutamiento automático de correos, PYQR y solicitudes.
- Generación asistida de documentos: minutas, informes, respuestas,
  cotizaciones.
- Selección del modelo adecuado por caso (costo/latencia/calidad) y
  reemplazo cuando aparece uno mejor, sin reescribir la solución.

**Qué se entrega**
Solución desplegada, documentación funcional y técnica, capacitación al
equipo del cliente y métricas de uso.

**Sobre qué se apoya**
Chatbot en producción sobre la web de OsorIA con base de conocimiento propia
de más de 60 intenciones, con fallback a modelo de lenguaje avanzado y
registro de cada conversación en base de datos para mejorar la atención.
Backend de IA propio en FastAPI. Generación de minutas de reunión a partir
de transcripciones, con extracción automática de tareas y responsables
(operando hoy en nuestro dashboard interno).

---

## 2. Automatización de procesos operativos (RPA + integraciones)

Eliminar el trabajo repetitivo que hoy hace una persona a mano.

**Qué incluye**
- Robots que operan portales y sistemas que **no tienen API**: entran con
  credenciales, navegan, descargan el reporte y lo dejan donde se necesita.
- Programación de tareas recurrentes (diarias, semanales, por evento) con
  reintentos, alertas y trazabilidad de cada corrida.
- Carga y validación automática de archivos Excel/CSV hacia la base de datos.
- Flujos de aprobación y notificaciones automáticas por WhatsApp o correo.
- Sincronización de inventarios y catálogos entre sistemas.

**Qué se entrega**
Automatización productiva, panel o log de ejecuciones, alertas de falla y
manual de operación.

**Sobre qué se apoya**
Automatización real en producción para un cliente distribuidor: un robot
entra al portal de su ERP comercial, descarga el cubo de ventas mensual y lo
sube al almacenamiento en la nube, disparando el pipeline de datos. Lo que
antes era una descarga manual mes a mes hoy no lo toca nadie.

---

## 3. Datos, analítica e inteligencia predictiva

Convertir los datos que la empresa ya tiene en decisiones.

**Qué incluye**
- **Ingeniería de datos**: pipelines por capas (bronce → plata → oro),
  normalización, control de reprocesos y trazabilidad archivo por archivo.
- **Modelo de indicadores**: definición de las reglas de negocio junto con el
  cliente y validación cifra por cifra contra sus reportes oficiales.
- **Tableros y dashboards** conectados a los datos en tiempo real, con
  segmentación por zona, línea de negocio, responsable y periodo.
- **Análisis predictivo**: proyección de demanda, comportamiento de compra,
  riesgo de fuga de clientes, detección de anomalías.
- **Comparación presupuesto vs. real** y seguimiento de cumplimiento.
- Herramientas: Python, SQL/PostgreSQL, FastAPI, Power BI, Tableau y modelos
  de IA.

**Qué se entrega**
Pipeline automatizado, base de datos modelada con migraciones versionadas,
API de disparo del proceso, tableros y un documento de definiciones de
negocio que deja por escrito qué significa cada indicador.

**Sobre qué se apoya**
Pipeline de ventas en producción para un distribuidor de consumo masivo:
procesa el cubo mensual, construye siete tablas de indicadores (mensuales,
diarios, por zona y por línea de negocio) y alimenta un tablero web con
control de acceso por usuario. La validación se hizo celda por celda contra
el indicador oficial del cliente — 46 de 46 zonas-mes cuadradas al peso, en
dos meses independientes. Ese nivel de rigor es el estándar, no la excepción:
en el proceso detectamos y corregimos definiciones erradas que inflaban
indicadores entre 18 % y 190 %.

---

## 4. Desarrollo web

**Qué incluye**
- Landing pages, sitios corporativos y micrositios de campaña.
- Tiendas en línea y e-commerce con carrito y pasarelas de pago
  (PayU, MercadoPago, Wompi, Stripe).
- Rediseño total o parcial de sitios existentes.
- Portales con área privada, registro, inicio de sesión y roles.
- Optimización SEO básica y avanzada, sitios 100 % responsivos y optimizados
  en velocidad.
- Redacción de contenido y diseño gráfico / branding como servicios
  complementarios.

**Qué se entrega**
Sitio desplegado con dominio y certificado, panel de administración, acceso
y capacitación al cliente para que administre su propio contenido.

**Stack**: Next.js, React, TypeScript, Tailwind, Supabase, despliegue en
Vercel. Tiempo promedio de 7 a 15 días hábiles según alcance.

**Sobre qué se apoya**
Sitios en producción propios y de clientes (landing corporativa OsorIA con
chatbot y métricas en vivo, e-commerce, landings de clientes del sector
distribución).

---

## 5. Aplicaciones móviles

**Qué incluye**
- Apps Android y multiplataforma con una sola base de código (Flutter).
- **Arquitectura offline-first**: la app funciona completa sin señal y
  sincroniza sola cuando vuelve la conexión — crítico para fuerza de ventas,
  técnicos en campo y operación en zonas sin cobertura.
- Captura de fotos y evidencias en campo, con carga automática a la nube al
  reconectar.
- Almacenamiento seguro cifrado en el dispositivo.
- Compilación firmada y publicación en Google Play (APK/AAB).

**Qué se entrega**
App publicada o distribuida, backend, panel administrativo y manual de uso.

**Sobre qué se apoya**
App móvil de operación en campo con sincronización offline-first sobre base
local que replica contra la nube, incluida la carga diferida de imágenes.
Segunda app multiplataforma (web + Android) con gestión de roles,
invitaciones, calendario compartido, control de gastos y extracción
automática de datos desde documentos cargados por el usuario.

---

## 6. Sistemas de gestión y plataformas a la medida

Cuando ningún software del mercado se ajusta a la operación del cliente.

**Qué incluye**
- CRM y plataformas comerciales a la medida.
- Sistemas administrativos y de gestión operativa por sector (ya construidos
  para control de servicios en campo, gestión de clientes y programación de
  visitas).
- Gestión de proyectos: tableros Kanban, historias de usuario, seguimiento de
  tareas y métricas de equipo.
- Sistemas de reservas y agenda digital.
- Multiempresa y multiusuario con seguridad a nivel de fila: cada empresa y
  cada rol ve exactamente lo que le corresponde.
- Integración con facturación electrónica a través de proveedores
  autorizados.

**Qué se entrega**
Plataforma en producción, esquema de base de datos documentado, matriz de
roles y permisos, y capacitación.

**Sobre qué se apoya**
Dashboard interno de OsorIA en operación (proyectos, historias de usuario,
minutas, tareas, métricas por repositorio, base multiempresa). Sistema de
gestión de servicios y clientes en producción para un cliente del sector de
control de plagas.

---

## 7. Canales conversacionales y WhatsApp Business API

**Qué incluye**
- Acompañamiento completo en la **validación y verificación del número en
  Meta** para acceder a WhatsApp Business API oficial.
- Beneficios que se desbloquean: mayor capacidad de envío, plantillas
  masivas aprobadas y sello de verificación.
- Chatbots para WhatsApp y web, con flujos de venta, agendamiento y soporte.
- Automatización de la conversación de ventas y conexión con el CRM.
- Botones y enlaces directos de WhatsApp integrados al sitio.
- Acompañamiento en casos de números bloqueados o restringidos.

**Nota honesta para el cliente final**: la API oficial exige una cuenta
empresarial verificada; no hay atajo. Nosotros guiamos todo el proceso.

**Sobre qué se apoya**
Servicio activo hoy y publicado en nuestra web; integración de WhatsApp +
chatbot operando en nuestra propia landing.

---

## 8. Integración e interoperabilidad de sistemas

Que los sistemas que ya existen trabajen como un conjunto, sin islas de
información ni doble digitación.

**Qué incluye**
- Integración vía API REST con ERP, CRM, POS, nómina y sistemas contables.
- Conexión con transportadoras y operadores logísticos (Servientrega,
  Coordinadora, Envía y otros).
- Integración con pasarelas de pago y facturación electrónica.
- Puentes hacia sistemas legados sin API, mediante automatización controlada.
- Migración de datos entre plataformas, con validación y conciliación.
- Diseño y exposición de APIs propias del cliente para que terceros consuman
  su información de forma segura.

**Qué se entrega**
Integración funcionando, documentación de la interfaz, manejo de errores y
monitoreo.

---

## 9. Soporte de sistemas de información

Servicio continuo. No es solo "arreglar lo que se dañó": es mantener el
sistema vivo, seguro y evolucionando.

### 9.1 Mesa de ayuda y atención a usuarios
- Canal único de reporte (correo, WhatsApp o portal de tickets).
- Atención escalonada:
  - **Nivel 1** — atención al usuario, dudas de uso, restablecimiento de
    accesos, incidentes conocidos.
  - **Nivel 2** — diagnóstico técnico, revisión de logs, corrección de datos,
    reproceso de cargas.
  - **Nivel 3** — corrección en el código, cambios de arquitectura,
    intervención en base de datos.
- Acuerdos de nivel de servicio (SLA) por severidad, definidos y firmados
  antes de arrancar.

### 9.2 Mantenimiento
- **Correctivo**: corrección de fallas y defectos en producción.
- **Preventivo**: actualización de dependencias y parches de seguridad,
  revisión de rendimiento, limpieza de datos, verificación de respaldos.
- **Evolutivo**: nuevos requerimientos y mejoras funcionales, mediante bolsa
  de horas o alcances cerrados.
- **Adaptativo**: ajustes por cambios normativos, tributarios o de
  proveedores externos.

### 9.3 Administración de la plataforma
- Administración de bases de datos: respaldos, restauración probada,
  optimización de consultas, migraciones versionadas.
- Gestión de usuarios, roles y permisos; altas, bajas y revisión periódica de
  accesos.
- Monitoreo de disponibilidad, alertas ante caídas y reporte de
  disponibilidad mensual.
- Administración de hosting, dominios, certificados SSL y despliegues.
- Continuidad: plan de respaldo y recuperación con tiempos objetivo
  acordados.

### 9.4 Gobierno y acompañamiento
- Informe mensual: tickets atendidos, tiempos de respuesta, disponibilidad,
  cambios aplicados y riesgos abiertos.
- Documentación viva del sistema (funcional, técnica y de operación).
- Capacitación y reinducción a usuarios nuevos.
- Comité periódico de seguimiento con el cliente.
- Traspaso ordenado de conocimiento: el cliente es dueño de su código, sus
  datos y su documentación. Sin secuestro tecnológico.

### 9.5 Modalidades
| Modalidad | Para quién | Qué incluye |
|---|---|---|
| **Bolsa de horas** | Sistemas estables con necesidades puntuales | Horas prepagadas, consumo mensual reportado |
| **Soporte mensual por niveles** | Operación crítica | SLA definido, mesa de ayuda, mantenimiento preventivo y correctivo |
| **Soporte + evolutivo** | Producto en crecimiento | Todo lo anterior más cupo mensual de desarrollo de nuevas funciones |
| **Soporte de sistemas de terceros** | Software heredado de otro proveedor | Levantamiento, documentación y asunción del mantenimiento |

> Recibimos sistemas construidos por otros proveedores. El primer paso es
> siempre un levantamiento técnico y una documentación del estado real antes
> de asumir cualquier compromiso de servicio.

---

## 10. Cómo trabajamos (nuestro diferencial)

Esto es lo que nos separa de un proveedor que solo entrega código:

1. **Modelos de lenguaje de punta.** Trabajamos con los modelos más capaces
   disponibles hoy y los cambiamos cuando aparece uno mejor. La herramienta
   no es el diferencial: lo que hacemos con ella, sí.
2. **Las decisiones son del cliente.** Antes de escribir una línea mapeamos
   la superficie del cambio y llevamos las decisiones reales con sus
   alternativas. Nada de arquitectura elegida a espaldas del cliente.
3. **Verificación independiente.** Quien escribe el código nunca es quien lo
   aprueba. Un revisor aparte, sin el contexto de quien lo construyó, valida
   cada cambio contra criterios definidos de antemano. Así cazamos las
   alucinaciones antes de que lleguen a producción.
4. **Seguridad antes del despliegue.** Todo cambio que toque autenticación,
   pagos o datos pasa por una revisión de seguridad dedicada, y los hallazgos
   se corrigen y se vuelven a revisar hasta quedar limpios.
5. **Validación contra la realidad del cliente.** No damos por bueno un
   indicador porque el código corrió: lo cuadramos contra el reporte oficial
   del cliente antes de decir que está listo.

**Contexto de mercado que sustenta la alianza**: en Colombia hay 3,24
millones de empresas. El 98 % valora la transformación digital, pero solo el
58 % actúa y apenas el 5 % usa inteligencia artificial. Ahí está el espacio
que la alianza puede ocupar.

---

## 11. Esquema propuesto para la alianza

Tres formas de trabajar juntos, no excluyentes:

| Modelo | Cómo funciona | Cuándo conviene |
|---|---|---|
| **Referenciación** | SM Business identifica la oportunidad, OsorIA cotiza y ejecuta; se acuerda una comisión sobre el negocio cerrado | Cliente de SM que necesita algo fuera del alcance actual de SM |
| **Marca blanca / subcontratación** | OsorIA ejecuta como fábrica técnica detrás de SM; el cliente ve a SM | SM quiere ampliar su portafolio sin montar equipo técnico |
| **Coejecución** | Ambas firmas ante el cliente, cada una con su alcance y su responsabilidad | Proyectos grandes o licitaciones donde suman las dos hojas de vida |

**Lo que necesitamos definir juntos**
1. Qué modelo (o combinación) aplica.
2. Tabla de tarifas y comisiones.
3. Acuerdo de confidencialidad y de no competencia sobre clientes referidos.
4. Un canal único de entrada de oportunidades y un tiempo de respuesta de
   cotización comprometido.
5. Un piloto: un cliente real, alcance pequeño, para probar la mecánica antes
   de escalar.

**Modalidades de contratación con el cliente final**: proyecto cerrado por
alcance, bolsa de horas, mensualidad de soporte, o mixto. Manejamos pagos por
etapas del proyecto y emitimos factura.

---

## 12. Tabla rápida de servicios (para la propuesta comercial)

| # | Servicio | Modalidad típica |
|---|---|---|
| 1 | Soluciones con IA a la medida | Proyecto cerrado |
| 2 | Automatización de procesos y RPA | Proyecto + soporte |
| 3 | Ingeniería de datos y pipelines ETL | Proyecto + soporte |
| 4 | Tableros de indicadores y analítica | Proyecto + mensualidad |
| 5 | Análisis predictivo | Proyecto |
| 6 | Landing pages y sitios corporativos | Proyecto cerrado |
| 7 | E-commerce y tiendas en línea | Proyecto + soporte |
| 8 | Aplicaciones móviles (incl. offline-first) | Proyecto + soporte |
| 9 | CRM y sistemas de gestión a la medida | Proyecto + evolutivo |
| 10 | Chatbots web y WhatsApp | Proyecto + mensualidad |
| 11 | Validación WhatsApp Business API en Meta | Servicio puntual |
| 12 | Integración de sistemas y APIs | Proyecto |
| 13 | Migración de datos entre plataformas | Proyecto |
| 14 | Facturación electrónica y pasarelas de pago | Complemento |
| 15 | Integración con transportadoras y logística | Complemento |
| 16 | **Soporte de sistemas de información** | **Mensualidad / bolsa de horas** |
| 17 | Administración de bases de datos y respaldos | Mensualidad |
| 18 | Hosting, dominios, SSL y despliegues | Mensualidad |
| 19 | SEO y marketing digital (Meta Ads, Google Ads) | Mensualidad |
| 20 | Diseño gráfico, branding y redacción de contenido | Complemento |
| 21 | Capacitación y transferencia de conocimiento | Complemento |

---

## Nota interna antes de enviar

Tres cosas que conviene revisar y que **no** dejamos escritas en el correo:

1. **Los "casos de éxito" del carrusel de la web no están verificados.** Las
   cifras que aparecen ahí (87 % de precisión en predicción médica, 96 % de
   detección de fraude, $4,5M ahorrados) son texto de mercadeo genérico, no
   proyectos ejecutados por OsorIA. **No las uses ante un partner**: si SM las
   repite ante un cliente y pide el respaldo, quedamos expuestos. Todo lo que
   está en este documento sí corresponde a trabajo real y verificable en los
   repositorios.
2. **Los precios están sin definir.** La base de conocimiento del chatbot dice
   "desde $X" en varias respuestas. Antes de la reunión con SM conviene tener
   una lista de precios base, aunque sea de rango, para no improvisar.
3. **Vale la pena actualizar la web.** El portafolio real hoy es más amplio
   que los seis servicios listados en la sección "Nuestros servicios" del
   sitio — faltan móviles, ETL, WhatsApp API y soporte.

---

# Correo listo para enviar

**Asunto:** Portafolio de servicios OsorIA.tech — propuesta de alianza

---

Estimado equipo de SM BUSINESS SOLUTIONS S.A.S.:

Reciban un cordial saludo.

Con el ánimo de dar forma a la alianza entre nuestras compañías, les comparto
el portafolio completo de servicios que OsorIA.tech puede prestar, ya sea
para clientes que ustedes referencien, para proyectos que ejecutemos como su
equipo técnico, o para propuestas que presentemos en conjunto.

**Quiénes somos.** OsorIA.tech es una compañía colombiana de tecnología
especializada en soluciones con inteligencia artificial. Construimos,
integramos y sostenemos software: desde el modelo predictivo y la
automatización que elimina el trabajo manual, hasta la página web, la
aplicación móvil y el soporte del sistema que queda funcionando después.

**Nuestras líneas de servicio:**

**1. Soluciones con inteligencia artificial a la medida.** Asistentes y
agentes conectados a las bases de datos reales del cliente, extracción
automática de información desde facturas, contratos y documentos escaneados,
clasificación automática de solicitudes y generación asistida de informes y
documentos.

**2. Automatización de procesos operativos (RPA).** Robots que operan
portales y sistemas que no tienen API: entran, navegan, descargan el reporte y
lo entregan procesado. Tareas programadas con alertas y trazabilidad. Hoy
tenemos automatizaciones de este tipo corriendo en producción.

**3. Datos, analítica e inteligencia predictiva.** Pipelines de datos por
capas, modelamiento de indicadores validados cifra por cifra contra los
reportes oficiales del cliente, tableros en tiempo real y modelos predictivos
de demanda, comportamiento de compra y detección de anomalías. Trabajamos con
Python, SQL, FastAPI, Power BI y Tableau.

**4. Desarrollo web.** Landing pages, sitios corporativos, e-commerce con
pasarelas de pago, portales con área privada y roles, optimización SEO y
rediseño de sitios existentes. Tiempo promedio de entrega entre 7 y 15 días
hábiles según alcance.

**5. Aplicaciones móviles.** Apps Android y multiplataforma, incluida
arquitectura *offline-first*: la aplicación funciona completa sin señal y
sincroniza sola al reconectar. Es determinante para fuerza de ventas y
personal en campo.

**6. Sistemas de gestión a la medida.** CRM, sistemas administrativos por
sector, gestión de proyectos, agendamiento y reservas, con esquema
multiempresa y seguridad por roles.

**7. WhatsApp Business API y canales conversacionales.** Acompañamiento
completo en la validación y verificación del número ante Meta, chatbots para
WhatsApp y web, y automatización de la conversación de ventas conectada al
CRM.

**8. Integración e interoperabilidad.** Conexión con ERP, CRM, POS,
transportadoras, pasarelas de pago y facturación electrónica; migración de
datos entre plataformas; y puentes hacia sistemas heredados que no tienen
API.

**9. Soporte de sistemas de información.** Servicio continuo con mesa de
ayuda y atención escalonada en tres niveles, acuerdos de nivel de servicio
por severidad, mantenimiento correctivo, preventivo, evolutivo y adaptativo,
administración de bases de datos y respaldos, gestión de usuarios y accesos,
monitoreo de disponibilidad, administración de hosting y dominios, e informe
mensual de gestión. Lo prestamos tanto sobre desarrollos propios como sobre
sistemas construidos por otros proveedores, previo levantamiento técnico.

**10. Servicios complementarios.** SEO y campañas en Meta Ads y Google Ads,
diseño gráfico y branding, redacción de contenido, y capacitación a usuarios.

**Cómo trabajamos.** Trabajamos con los modelos de lenguaje más capaces
disponibles y los cambiamos cuando aparece uno mejor. Las decisiones de
arquitectura las lleva el cliente, con alternativas sobre la mesa. Quien
escribe el código nunca es quien lo aprueba: un revisor independiente valida
cada cambio antes de que llegue a producción, y todo lo que toque
autenticación, pagos o datos pasa además por una revisión de seguridad
dedicada.

**Modalidades de contratación.** Proyecto cerrado por alcance, bolsa de horas,
mensualidad de soporte o esquema mixto. Manejamos pago por etapas del
proyecto y emitimos factura.

**Propuesta de alianza.** Vemos tres formas de trabajar juntos, no
excluyentes entre sí: referenciación con comisión sobre el negocio cerrado,
marca blanca donde operamos como su equipo técnico, o coejecución conjunta
ante el cliente. Nos gustaría acordar cuál se ajusta mejor, definir tarifas y
comisiones, y arrancar con un piloto pequeño para probar la mecánica antes de
escalar.

Quedo atento a coordinar una reunión para revisar el portafolio en detalle y
avanzar en la definición del acuerdo.

Cordial saludo,

**Nicolás Vásquez**
OsorIA.tech
nicolas.vasquez@osoria.tech
https://osoria.tech

---
