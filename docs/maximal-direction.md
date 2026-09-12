# Creative Systems — alternativa maximalista

Rama: opciones/maximalista-color. La opción editorial-3d permanece independiente.

Diseño desde cero sobre el entorno Astro existente. No se reinstala el framework ni se cambia el contenido profesional verificado. La portada no importa componentes, estilos o scripts del diseño anterior.

## Diseño y recorrido

Naranja, azul ultramar, lima y crema. Tipografía display condensada, serif expresiva y sans de lectura. Composición de póster, collage y módulos de color plano. Encabezado persistente con Trabajo, Experiencia, Capacidades, Contacto y CV; menú móvil completo.

Hero profesional + escultura procedural transformable; trabajo identificado antes de la ilustración; capacidades legibles sin interacción; simulación explícitamente ilustrativa; trayectoria; perfil; contacto. Los ámbitos profesionales no se presentan como proyectos inventados.

## Tres interacciones

1. Escultura radial que se abre/cierra con Remezcla y responde al puntero. Alternativa CSS, activación por teclado y touch.
2. Composiciones de trabajo con inclinación por puntero y coreografía de entrada ligada al scroll. Todos los enlaces permanecen convencionales.
3. Enviar una idea: secuencia finita interfaz/API/datos, con infraestructura como entorno que las sostiene, estado textual accesible y sin peticiones remotas.

CSS y GSAP para movimiento; Three.js diferido para una sola escena, sin modelos externos. Sin secuestrar scroll. Pausa global, reduced motion, suspensión del render fuera del viewport. Comprobar build, tipos, controles, navegación y anchos 320–2560 antes de guardar la versión.

## Revisión realizada

Firefox: escena WebGL activa, remezcla, simulación hasta su respuesta final, pausa global, menú móvil, cierre con Escape y activación de remezcla por Enter. Ningún error de consola en el recorrido. Anchos 320, 375, 768, 1440, 1920 y 2560 sin desbordamiento horizontal. Se revisaron capturas de escritorio, móvil, trabajo y capacidades. Build estático y chequeo TypeScript correctos.

Pendiente para publicación: dominio/metadata social, fuentes autoalojadas, evidencia publicable de proyectos y mediciones de rendimiento/accesibilidad en dispositivos físicos. Vite avisa que el chunk diferido de Three.js supera 500 KB minificados; no se ha ocultado la advertencia. No se ha desplegado ni subido la rama al remoto.
