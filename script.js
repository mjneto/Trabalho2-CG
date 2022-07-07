import {OrbitControls} from "https://unpkg.com/three@0.142.0/examples/jsm/controls/OrbitControls.js"
import {GLTFLoader} from "https://unpkg.com/three@0.142.0/examples/jsm/loaders/GLTFLoader.js"
import {FBXLoader} from "https://unpkg.com/three@0.142.0/examples/jsm/loaders/FBXLoader.js"
import {Sky} from "https://unpkg.com/three@0.142.0/examples/jsm/objects/Sky.js"
import * as THREE from 'three';

let clock = new THREE.Clock();
let mixer, mixer2;
let sky, sun;

//cena
const scene = new THREE.Scene();
scene.backgroud = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);
camera.lookAt(0, 1, 0);

//renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

//controles
//const controls = new OrbitControls(camera, renderer.domElement);

//luz ambiente
const hemiLight = new THREE.HemisphereLight(0xd4c0aa, 0xb69b95, 0.5);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

//luz direcional
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;

dirLight.position.set(-10, 5, -25);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
scene.add(dirLight);

//shader céu
sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const uniforms = sky.material.uniforms;
uniforms["turbidity"].value = 10;
uniforms["rayleigh"].value = 2;
uniforms["mieCoefficient"].value = 0.005;
uniforms["mieDirectionalG"].value = 0.8;

const parameters = {
    elevation: 3,
    azimuth: 200
};

const pmremGenerator = new THREE.PMREMGenerator( renderer );

const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
const theta = THREE.MathUtils.degToRad(parameters.azimuth);

//"sol"
sun = new THREE.Vector3();
sun.setFromSphericalCoords(1, phi, theta);

uniforms["sunPosition"].value.copy(sun);

scene.environment = pmremGenerator.fromScene(sky).texture;

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

//model_kachujin
const loader3 = new FBXLoader();
loader3.setPath('./models/kachuijin/');
loader3.load('kachujin_g_rosales.fbx', (fbx) => {
    fbx.scale.setScalar(0.01);
    fbx.position.set(-7, 1.81, -5);
    fbx.rotation.set(0, 1, 0);
    fbx.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const anim2 = new FBXLoader();
    anim2.setPath('./models/kachuijin/');
    anim2.load('boxing.fbx', (anim) => {
        mixer2 = new THREE.AnimationMixer(fbx);
        const box = mixer2.clipAction(anim.animations[0]);
        box.play();
    });
    scene.add(fbx);
});

animate();

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  if (mixer && mixer2) {
    mixer.update(delta);
    mixer2.update(delta);
  }

  renderer.render(scene, camera);
}