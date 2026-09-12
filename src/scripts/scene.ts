import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// A continuous trefoil, split into three independently explorable ribbons.
class ConnectedRibbon extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const angle = t * Math.PI * 2;
    const radius = 1.08 + 0.48 * Math.cos(3 * angle);
    return target.set(
      radius * Math.cos(2 * angle),
      radius * Math.sin(2 * angle),
      0.65 * Math.sin(3 * angle),
    );
  }
}

function ribbonGeometry(layer: number) {
  const curve = new ConnectedRibbon();
  const steps = 360;
  const sides = 12;
  const frames = curve.computeFrenetFrames(steps, true);
  const positions: number[] = [];
  const indices: number[] = [];
  for (let step = 0; step <= steps / 3; step++) {
    const index = layer * (steps / 3) + step;
    const point = curve.getPoint(index / steps);
    const twist = (index / steps) * Math.PI * 2;
    const normal = frames.normals[index]
      .clone()
      .multiplyScalar(Math.cos(twist))
      .addScaledVector(frames.binormals[index], Math.sin(twist));
    const binormal = new THREE.Vector3().crossVectors(
      frames.tangents[index],
      normal,
    );
    for (let side = 0; side <= sides; side++) {
      const angle = (side / sides) * Math.PI * 2;
      const vertex = point
        .clone()
        .addScaledVector(normal, Math.cos(angle) * 0.31)
        .addScaledVector(binormal, Math.sin(angle) * 0.075);
      positions.push(vertex.x, vertex.y, vertex.z);
      if (step < steps / 3 && side < sides) {
        const a = step * (sides + 1) + side;
        const b = a + sides + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  // Close the cross-sections so separated layers remain solid objects.
  const end = (steps / 3) * (sides + 1);
  for (let side = 1; side < sides - 1; side++) {
    indices.push(0, side + 1, side, end, end + side, end + side + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
export function mountScene(host: HTMLElement, initialPaused: boolean) {
  const target = host.querySelector<HTMLElement>("#scene")!;
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
  renderer.setClearColor(0x101010, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  target.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8.8);
  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = generator.fromScene(room, 0.04);
  scene.environment = env.texture;
  room.dispose();
  generator.dispose();
  const group = new THREE.Group();
  scene.add(group);
  group.rotation.set(0.35, -0.3, -0.35);
  const rings = [0xff794a, 0xd4cfc5, 0x8882ed].map((color, i) => {
    const mesh = new THREE.Mesh(
      ribbonGeometry(i),
      new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.92,
        roughness: 0.19,
        clearcoat: 1,
        clearcoatRoughness: 0.13,
        side: THREE.DoubleSide,
      }),
    );
    group.add(mesh);
    return mesh;
  });
  const light = new THREE.PointLight(0xff8955, 20, 20);
  light.position.set(-3, 3, 4);
  scene.add(light);
  const rim = new THREE.DirectionalLight(0x9bbaff, 3);
  rim.position.set(3, -1, 3);
  scene.add(rim);
  let paused = initialPaused,
    visible = true,
    expanded = host.dataset.expanded === "true",
    expansion = 0,
    drag = false,
    lastX = 0,
    lastY = 0,
    rotationY = 0,
    rotationX = 0,
    frame = 0;
  function render() {
    renderer.render(scene, camera);
  }
  function resize() {
    const rect = host.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.position.z = rect.width < 500 ? 9.5 : 7.6;
    camera.updateProjectionMatrix();
    render();
  }
  function update(time: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    expansion += (Number(expanded) - expansion) * (paused ? 1 : 0.08);
    rings.forEach((ring, i) => {
      ring.position.x = (i - 1) * expansion * 1.05;
      ring.position.y = (i === 1 ? 0.2 : -0.1) * expansion;
    });
    group.rotation.y = rotationY + (paused ? 0 : Math.sin(time * 0.0002) * 0.2);
    group.rotation.x = 0.35 + rotationX;
    group.rotation.z = -0.35 + (paused ? 0 : Math.sin(time * 0.0003) * 0.08);
    render();
    if (!paused || Math.abs(Number(expanded) - expansion) > 0.001)
      frame = requestAnimationFrame(update);
  }
  function wake() {
    if (!frame && visible && !document.hidden)
      frame = requestAnimationFrame(update);
  }
  host.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return;
    drag = true;
    lastX = e.clientX;
    lastY = e.clientY;
    host.setPointerCapture(e.pointerId);
  });
  host.addEventListener("pointermove", (e) => {
    if (!drag) return;
    rotationY += (e.clientX - lastX) * 0.008;
    rotationX += (e.clientY - lastY) * 0.005;
    lastX = e.clientX;
    lastY = e.clientY;
    wake();
  });
  host.addEventListener("pointerup", () => (drag = false));
  host.addEventListener("pointercancel", () => (drag = false));
  window.addEventListener("portfolio:motion", ((e: CustomEvent) => {
    paused = e.detail;
    wake();
  }) as EventListener);
  window.addEventListener("portfolio:explode", ((e: CustomEvent) => {
    expanded = e.detail;
    wake();
  }) as EventListener);
  window.addEventListener("portfolio:rotate", () => {
    rotationY += Math.PI / 4;
    wake();
  });
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) wake();
    else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }).observe(host);
  document.addEventListener("visibilitychange", wake);
  new ResizeObserver(resize).observe(host);
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    host.dataset.ready = "false";
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    visible = false;
  });
  resize();
  host.dataset.ready = "true";
  wake();
}
