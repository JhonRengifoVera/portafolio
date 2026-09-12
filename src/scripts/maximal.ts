import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reduced.matches;
const motion = document.querySelector<HTMLButtonElement>("#motion-toggle")!;
let context: gsap.Context | undefined;
let simulation: gsap.core.Timeline | undefined;
function choreography() {
  context?.revert();
  if (paused) return;
  context = gsap.context(() => {
    gsap.from(".title-line", {
      yPercent: 70,
      rotation: 5,
      opacity: 0,
      stagger: 0.14,
      duration: 1.1,
      ease: "expo.out",
    });
    gsap.from(".hero-sticker", {
      scale: 0,
      rotation: 45,
      duration: 1.3,
      delay: 0.5,
      ease: "elastic.out(1,.45)",
    });
    gsap.from(".remix", {
      scale: 0,
      duration: 0.8,
      delay: 0.7,
      ease: "back.out(2)",
    });
    gsap.to(".brand-star", {
      rotation: 360,
      duration: 16,
      repeat: -1,
      ease: "none",
    });
    gsap.utils
      .toArray<HTMLElement>(".work-card")
      .forEach((card, i) =>
        gsap.from(card, {
          y: 90,
          rotation: i ? 6 : -6,
          opacity: 0.2,
          duration: 1,
          scrollTrigger: {
            trigger: card,
            start: "top 94%",
            toggleActions: "play none none none",
          },
          ease: "power3.out",
        }),
      );
    gsap.from(".cap-card", {
      y: 55,
      rotation: 3,
      opacity: 0.3,
      stagger: 0.15,
      duration: 0.8,
      scrollTrigger: { trigger: ".cap-grid", start: "top 88%" },
      ease: "power3.out",
    });
    gsap.fromTo(
      ".about-poster",
      { rotation: -9 },
      {
        rotation: 3,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      },
    );
    gsap.to(".diagram-star", {
      rotation: 180,
      duration: 12,
      repeat: -1,
      ease: "none",
      scrollTrigger: {
        trigger: ".art-system",
        start: "top bottom",
        end: "bottom top",
        toggleActions: "play pause play pause",
      },
    });
  });
}
function setMotion(value: boolean) {
  paused = value;
  document.documentElement.classList.toggle("motion-paused", value);
  motion.setAttribute("aria-pressed", String(value));
  motion.setAttribute(
    "aria-label",
    value ? "Activar animaciones" : "Pausar animaciones",
  );
  motion.innerHTML = value
    ? "▷ <span>Activar</span>"
    : "◫ <span>Movimiento</span>";
  if (value) simulation?.progress(1);
  window.dispatchEvent(new CustomEvent("creative:motion", { detail: value }));
  choreography();
}
motion.addEventListener("click", () => setMotion(!paused));
reduced.addEventListener("change", () => setMotion(reduced.matches));
setMotion(paused);
const menu = document.querySelector<HTMLButtonElement>("#menu-toggle")!;
const nav = document.querySelector<HTMLElement>("#site-nav")!;
function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
  menu.textContent = "Menú +";
  nav.classList.remove("open");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.textContent = open ? "Cerrar −" : "Menú +";
  nav.classList.toggle("open", open);
});
nav
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menu.focus();
  }
});
const navLinks = [...nav.querySelectorAll<HTMLAnchorElement>("a")];
const sections = navLinks.map((link) =>
  document.querySelector<HTMLElement>(link.hash)!,
);
const updateNavigation = () => {
  let active: HTMLElement | undefined;
  for (const section of sections.toSorted(
    (a, b) => a.offsetTop - b.offsetTop,
  )) {
    if (section.getBoundingClientRect().top <= 160) active = section;
  }
  navLinks.forEach((link) => {
    if (active && link.hash === "#" + active.id)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};
let scrollQueued = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      updateNavigation();
      scrollQueued = false;
    });
  },
  { passive: true },
);
document.querySelectorAll<HTMLElement>(".work-art").forEach((art) => {
  const object = art.querySelector<HTMLElement>(".diagram,.shop-window")!;
  art.addEventListener("pointermove", (e) => {
    if (paused || e.pointerType !== "mouse") return;
    const rect = art.getBoundingClientRect();
    gsap.to(object, {
      rotationY: ((e.clientX - rect.left - rect.width / 2) / rect.width) * 22,
      rotationX: (-(e.clientY - rect.top - rect.height / 2) / rect.height) * 16,
      transformPerspective: 700,
      duration: 0.5,
      overwrite: true,
    });
  });
  art.addEventListener("pointerleave", () =>
    gsap.to(object, {
      rotationX: 0,
      rotationY: 0,
      duration: paused ? 0 : 0.65,
      overwrite: true,
    }),
  );
});
const remix = document.querySelector<HTMLButtonElement>("#remix")!;
const object = document.querySelector<HTMLElement>("#creative-object")!;
remix.addEventListener("click", () => {
  const active = remix.getAttribute("aria-pressed") !== "true";
  remix.setAttribute("aria-pressed", String(active));
  object.dataset.remix = String(active);
  window.dispatchEvent(new CustomEvent("creative:remix", { detail: active }));
  if (!paused)
    gsap.fromTo(
      remix,
      { rotation: active ? 8 : -14 },
      { rotation: -8, duration: 0.7, ease: "elastic.out(1,.4)" },
    );
});
const run = document.querySelector<HTMLButtonElement>("#run-system")!;
const status = document.querySelector<HTMLElement>("#system-status")!;
const playground = document.querySelector<HTMLElement>(".system-playground")!;
const stages = [...document.querySelectorAll<HTMLElement>("[data-stage]")];
run.addEventListener("click", () => {
  const finish = () => {
    stages.forEach((stage) => stage.classList.add("active"));
    status.textContent =
      "Respuesta recibida. Interfaz, API y datos trabajando juntos.";
    run.disabled = false;
    run.innerHTML = "Enviar otra idea <span>↗</span>";
    playground.classList.remove("is-running");
  };
  simulation?.kill();
  stages.forEach((stage) => stage.classList.remove("active"));
  if (paused) {
    finish();
    return;
  }
  run.disabled = true;
  playground.classList.add("is-running");
  const messages = [
    "La interfaz recoge una acción del usuario.",
    "La API procesa la solicitud y aplica la lógica.",
    "Los datos se consultan y la respuesta vuelve a la interfaz.",
  ];
  simulation = gsap.timeline({ onComplete: finish });
  stages.forEach((stage, i) => {
    simulation!.call(
      () => {
        stage.classList.add("active");
        status.textContent = messages[i];
      },
      [],
      i * 0.8,
    );
    simulation!.fromTo(
      stage,
      { y: 0 },
      { y: -8, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out" },
      i * 0.8,
    );
  });
  simulation.to({}, { duration: 0.5 });
});
const load = () =>
  import("./maximal-scene")
    .then((module) => module.createSculpture(object, paused))
    .catch(() => (object.dataset.ready = "false"));
if ("requestIdleCallback" in window)
  window.requestIdleCallback(load, { timeout: 1500 });
else setTimeout(load, 150);
