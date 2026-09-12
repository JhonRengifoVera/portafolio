import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const media = matchMedia("(prefers-reduced-motion: reduce)");
let paused = media.matches;
const motion = document.querySelector<HTMLButtonElement>("#motion")!;
let animationContext: gsap.Context | undefined;
function animate() {
  animationContext?.revert();
  if (paused) return;
  animationContext = gsap.context(() => {
    gsap.from(".hero h1>span", {
      y: 65,
      opacity: 0,
      duration: 1.2,
      stagger: 0.13,
      ease: "power3.out",
    });
    gsap.utils.toArray<HTMLElement>(".project").forEach((project) => {
      const art = project.querySelector(".system-art, .commerce-art");
      gsap.fromTo(
        art,
        { y: 80, rotation: -9 },
        {
          y: -60,
          rotation: 3,
          ease: "none",
          scrollTrigger: {
            trigger: project,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    });
    gsap.to(".ring-one", {
      rotation: 360,
      duration: 32,
      repeat: -1,
      ease: "none",
    });
    gsap.to(".ring-two", {
      rotation: -360,
      duration: 45,
      repeat: -1,
      ease: "none",
    });
    gsap.to(".satellite", {
      y: -14,
      duration: 3,
      stagger: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  });
}
function setMotion(value: boolean) {
  paused = value;
  document.documentElement.classList.toggle("motion-paused", paused);
  motion.setAttribute("aria-pressed", String(paused));
  motion.textContent = paused ? "Activar ▷" : "Pausar ◫";
  motion.setAttribute(
    "aria-label",
    paused ? "Activar movimiento" : "Pausar movimiento",
  );
  window.dispatchEvent(new CustomEvent("portfolio:motion", { detail: paused }));
  animate();
}
motion.addEventListener("click", () => setMotion(!paused));
media.addEventListener("change", () => setMotion(media.matches));
setMotion(paused);
const sculpture = document.querySelector<HTMLElement>("#sculpture")!;
document.querySelector("#explode")!.addEventListener("click", (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  const expanded = button.getAttribute("aria-pressed") !== "true";
  button.setAttribute("aria-pressed", String(expanded));
  button.textContent = expanded
    ? "Conectar el sistema ↙"
    : "Separar el sistema ↗";
  sculpture.dataset.expanded = String(expanded);
  sculpture
    .querySelector(".scene-legend")!
    .setAttribute("aria-hidden", String(!expanded));
  window.dispatchEvent(
    new CustomEvent("portfolio:explode", { detail: expanded }),
  );
});
let fallbackRotation = 0;
document.querySelector("#rotate")!.addEventListener("click", () => {
  fallbackRotation += 45;
  sculpture.querySelector<HTMLElement>(".sculpture-fallback")!.style.transform =
    `rotate(${fallbackRotation - 20}deg)`;
  window.dispatchEvent(new Event("portfolio:rotate"));
});
const layers = [
  [
    "FRONTEND",
    "La complejidad no tiene que sentirse compleja.",
    "Interfaces responsive y componentes reutilizables, desde aplicaciones Angular hasta experiencias de compra en Adobe Commerce.",
    "Angular · TypeScript · HTML · CSS",
  ],
  [
    "BACKEND",
    "Conectar procesos. Dar sentido a los datos.",
    "APIs REST, servicios e integraciones entre aplicaciones, bases de datos y hardware para auditoría e interoperabilidad.",
    "Node.js · NestJS · Java · PHP · PostgreSQL",
  ],
  [
    "INFRAESTRUCTURA",
    "El software también necesita dónde vivir.",
    "Despliegue y mantenimiento de aplicaciones y bases de datos transaccionales sobre Linux, contenedores y procesos de integración continua.",
    "Linux · Docker · Jenkins · CI/CD",
  ],
];
document.querySelectorAll<HTMLButtonElement>("[data-layer]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-layer]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    const values = layers[Number(button.dataset.layer)];
    ["layer-name", "layer-heading", "layer-description", "layer-tech"].forEach(
      (id, i) => (document.getElementById(id)!.textContent = values[i]),
    );
    if (!paused)
      gsap.fromTo(
        ".layer-content",
        { opacity: 0.2, y: 12 },
        { opacity: 1, y: 0, duration: 0.35 },
      );
  }),
);
const cursor = document.querySelector<HTMLElement>(".pointer-label")!;
document.querySelectorAll<HTMLElement>(".project-stage").forEach((stage) => {
  stage.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || paused) return;
    cursor.classList.add("active");
    cursor.style.transform = `translate(${e.clientX - 50}px,${e.clientY - 50}px)`;
  });
  stage.addEventListener("pointerleave", () =>
    cursor.classList.remove("active"),
  );
  stage.addEventListener("click", () => cursor.classList.remove("active"));
});
const loadScene = () =>
  import("./scene")
    .then((module) => module.mountScene(sculpture, paused))
    .catch(() => {
      sculpture.dataset.ready = "false";
    });
if ("requestIdleCallback" in window)
  window.requestIdleCallback(loadScene, { timeout: 1800 });
else setTimeout(loadScene, 200);
