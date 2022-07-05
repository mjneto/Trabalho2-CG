import {OrbitControls} from "https://unpkg.com/three@0.142.0/examples/jsm/controls/OrbitControls.js"
import {GLTFLoader} from "https://unpkg.com/three@0.142.0/examples/jsm/loaders/GLTFLoader.js"
import {FBXLoader} from "https://unpkg.com/three@0.142.0/examples/jsm/loaders/FBXLoader.js"
import * as THREE from 'three';

let clock = new THREE.Clock();
let mixer;

//cena
const scene = new THREE.Scene();
scene.backgroud = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

//camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2.4763476326420695, 4.9727971392339225, 2.8385318466906226);
camera.lookAt(0, 1, 0);

//renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

//controles
const controls = new OrbitControls(camera, renderer.domElement);

//luz ambiente
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

//luz direcional
const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;

dirLight.position.set(-10, 5, -20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

var helper = new THREE.PointLightHelper(dirLight);
scene.add(helper);

var helper2 = new THREE.CameraHelper(dirLight.shadow.camera);
scene.add(helper2);

//chão
const mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 30),
  new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
);
mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);

//model_warehouse
const loader = new GLTFLoader();
loader.load('./models/destroyed_warehouse/scene.gltf', (gltf1) => {
    gltf1.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    gltf1.scene.scale.set(1, 1, 1);
    gltf1.scene.rotateY(-Math.PI / 2);
    scene.add(gltf1.scene);
}
, (error) => {
    console.error(error);
}
, (progress) => {
    console.log(progress);
})

//model_vanguard
const loader2 = new FBXLoader();
loader2.setPath('./models/vanguard/');
loader2.load('vanguard.fbx', (fbx) => {
    fbx.scale.setScalar(0.01);
    fbx.position.set(0, 2.3, 0);
    fbx.rotation.set(0, -(Math.PI / 2), 0);
    fbx.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    const anim = new FBXLoader();
    anim.setPath('./models/vanguard/');
    anim.load('sitting_idle.fbx', (anim) => {
        mixer = new THREE.AnimationMixer(fbx);
        const idle = mixer.clipAction(anim.animations[0]);
        idle.play();
    });
    scene.add(fbx);
});

animate();

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  if (mixer) {
    mixer.update(delta);
  }

  console.log(camera.position)

  renderer.render(scene, camera);
}