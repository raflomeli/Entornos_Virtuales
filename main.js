import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.165/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.165/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.jsdelivr.net/npm/three@0.165/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.165/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.165/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.165/examples/jsm/postprocessing/UnrealBloomPass.js";

// Escena
const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 2, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Post-procesado
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.7,
  0.4,
  0.85
);
composer.addPass(bloomPass);

// HDRI
new RGBELoader()
  .setPath("./assets/")
  .load("qwamtani_dusk_2_puresky_4k.hdr", (hdri) => {
    hdri.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdri;
    scene.background = hdri;
  });

// Cargar modelo
let mixer = null;

const loader = new GLTFLoader().setPath("./assets/");
loader.load("3d_t.i.e_fighter_-_star_wars_model.glb", (gltf) => {
  const model = gltf.scene;
  model.scale.set(1, 1, 1);
  scene.add(model);

  // Animaciones (si las trae)
  if (gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
  }
});

// Cámara suave
let targetCameraPos = new THREE.Vector3(3, 2, 3);
window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  targetCameraPos.set(3 + x * 1.2, 2 + y * 0.8, 3);
});

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Loop
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  camera.position.lerp(targetCameraPos, 0.05);

  controls.update();
  composer.render();

  requestAnimationFrame(animate);
}
animate();
