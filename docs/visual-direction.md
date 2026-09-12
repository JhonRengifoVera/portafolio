# Dirección visual — Jhon Rengifo

## Referencia y decisión

El usuario seleccionó https://www.thenoomo.com/ como referencia. Se inspeccionó en navegador: base negra, tipografía editorial de gran escala, asimetría, espacio negativo y proyectos casi a pantalla completa. La implementación adopta estos principios sin reutilizar marca, código, fotografías, renders, testimonios ni textos de Noomo.

La ruta `/` muestra directamente esta versión. `/diseno/index.html` conserva el explorador anterior, no es la entrada actual.

## Experiencia

- Hero: «Software que conecta todo». Escultura procedural de tres capas en Three.js, arrastre con mouse y controles equivalentes de giro y separación para teclado/táctil.
- Trabajo: dos composiciones originales CSS, profundidad y movimiento ligado al scroll con GSAP. Son interpretaciones conceptuales, no capturas ni proyectos ficticios atribuidos a Jhon.
- Enfoque: selector de frontend, backend e infraestructura, con contenido del CV.
- Páginas profesionales: resumen de participación en FTSTecnología y Omni.pro; no se inventan resultados, métricas ni decisiones arquitectónicas específicas.

## Tecnología y accesibilidad

Astro genera HTML estático. CSS para estados y composiciones, GSAP + ScrollTrigger para coreografía, Three.js por importación dinámica para una única escena. No React, R3F, Lenis, Theatre ni otra librería de animación redundante.

El contenido existe antes del JavaScript. La escena se carga en tiempo ocioso y tiene una alternativa CSS sin WebGL. DPR máximo 1.5, geometría procedural sin modelos o texturas remotas, sin postprocesamiento en cada frame. El renderizado 3D se detiene fuera del viewport y al ocultar la pestaña. Se respeta `prefers-reduced-motion` y existe un botón global de movimiento. Mouse nativo conservado; el indicador de proyectos es adicional. No scroll secuestrado.

La tipografía es fluida, los proyectos se recomponen y hay ajustes específicos para pantallas pequeñas y ultrawide. Las fuentes todavía se sirven desde Google Fonts con `display=swap`: pendiente alojamiento local antes del despliegue público.

## Pendiente antes de publicación

Dominio definitivo, URLs canónicas, Open Graph, sitemap, fotografías/capturas publicables y validación de contenido con Jhon. Medición de Core Web Vitals en producción y en hardware móvil real; las pruebas locales no sustituyen estas mediciones. El chunk de Three.js es diferido pero debe incluirse en la auditoría de transferencia final.

## Validación local realizada

- Build de producción: tres rutas generadas correctamente. TypeScript de los dos módulos interactivos: sin errores.
- Firefox: WebGL activo y escultura visible; capturas antes/después de un arrastre real confirmaron cambio en la imagen renderizada.
- Controles: separación, giro, pausa y cambio de capacidad; activación de separación mediante Enter.
- Pérdida de contexto WebGL simulada: aparece la alternativa CSS.
- Anchos 320, 375, 768, 1440, 1920 y 2560: `scrollWidth` igual a `clientWidth`, sin desbordamiento horizontal.
- Página de experiencia accesible desde la nueva portada y con el mismo sistema visual.
- JavaScript de producción: aproximadamente 45 KiB gzip iniciales y 131 KiB gzip diferidos para Three.js/escena. Vite advierte que el chunk diferido supera 500 KiB sin compresión; no se ha ocultado la advertencia.

No se han medido todavía Core Web Vitals de campo ni validado en teléfonos físicos. El botón de pausa fue probado; falta verificación de la preferencia nativa de movimiento reducido en una matriz de navegadores.
