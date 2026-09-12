import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export function createSculpture(host: HTMLElement, initialPaused: boolean) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0xfc693b, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.querySelector("#creative-canvas")!.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
  camera.position.z = 7;
  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = generator.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  generator.dispose();
  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const shape = new THREE.Shape();
  shape.moveTo(0.25, -0.17);
  shape.bezierCurveTo(0.65, -0.4, 1.5, -0.44, 1.9, 0);
  shape.bezierCurveTo(1.45, 0.35, 0.65, 0.4, 0.25, 0.17);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.09,
    bevelThickness: 0.08,
    curveSegments: 28,
  });
  const blue = new THREE.MeshPhysicalMaterial({
    color: 0x2625e9,
    metalness: 0.62,
    roughness: 0.25,
    clearcoat: 1,
  });
  const violet = new THREE.MeshPhysicalMaterial({
    color: 0x6056ff,
    metalness: 0.6,
    roughness: 0.22,
    clearcoat: 1,
  });
  const petals = Array.from({ length: 14 }, (_, i) => {
    const pivot = new THREE.Group();
    pivot.rotation.z = (i / 14) * Math.PI * 2;
    const petal = new THREE.Mesh(geometry, i % 3 === 0 ? violet : blue);
    pivot.add(petal);
    sculpture.add(pivot);
    return { pivot, petal };
  });
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 24, 16),
    new THREE.MeshStandardMaterial({
      color: 0xa9a1ff,
      metalness: 0.82,
      roughness: 0.15,
    }),
  );
  core.position.z = 0.18;
  sculpture.add(core);
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(-2, 4, 5);
  scene.add(light);
  let paused = initialPaused,
    visible = true,
    remixed = host.dataset.remix === "true",
    mix = Number(remixed),
    pointerX = 0,
    pointerY = 0,
    frame = 0;
  const resize = () => {
    const bounds = host.getBoundingClientRect();
    renderer.setSize(bounds.width, bounds.height);
    camera.aspect = bounds.width / bounds.height;
    camera.position.z = bounds.width < 420 ? 7.6 : 6.6;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  function update(time: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    mix += (Number(remixed) - mix) * (paused ? 1 : 0.065);
    petals.forEach(({ pivot, petal }, i) => {
      pivot.rotation.z = (i / 14) * Math.PI * 2 + mix * (i % 2 ? 0.16 : -0.16);
      petal.rotation.x = mix * (i % 2 ? 1.15 : -1.15) + 0.14;
      petal.position.x = mix * 0.24;
      petal.position.z = Math.sin(i * 1.5) * mix * 0.25;
    });
    sculpture.rotation.set(
      0.3 + pointerY * 0.2,
      0.2 + pointerX * 0.3,
      -0.1 + (paused ? 0 : Math.sin(time * 0.0002) * 0.25),
    );
    core.scale.setScalar(1 - mix * 0.3);
    renderer.render(scene, camera);
    if (!paused || Math.abs(Number(remixed) - mix) > 0.001)
      frame = requestAnimationFrame(update);
  }
  function wake() {
    if (!frame && visible && !document.hidden)
      frame = requestAnimationFrame(update);
  }
  host.addEventListener("pointermove", (e) => {
    if (paused || e.pointerType !== "mouse") return;
    const r = host.getBoundingClientRect();
    pointerX = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointerY = ((e.clientY - r.top) / r.height) * 2 - 1;
    wake();
  });
  host.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
  });
  window.addEventListener("creative:motion", ((e: CustomEvent) => {
    paused = e.detail;
    wake();
  }) as EventListener);
  window.addEventListener("creative:remix", ((e: CustomEvent) => {
    remixed = e.detail;
    wake();
  }) as EventListener);
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) wake();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }).observe(host);
  document.addEventListener("visibilitychange", wake);
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    host.dataset.ready = "false";
    visible = false;
    cancelAnimationFrame(frame);
    frame = 0;
  });
  resize();
  host.dataset.ready = "true";
  wake();
}
