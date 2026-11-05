
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// --------------------------------------------------
// 1. ESCENA
// --------------------------------------------------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x20252b);

// --------------------------------------------------
// 2. CÁMARA
// --------------------------------------------------

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);

camera.position.set(200, 150, 200);

// --------------------------------------------------
// 3. RENDERIZADOR
// --------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

document.body.appendChild(renderer.domElement);

// --------------------------------------------------
// 4. ILUMINACIÓN
// --------------------------------------------------

// Luz ambiental
const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambientLight);

// Luz direccional
const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

directionalLight.position.set(100, 200, 100);

scene.add(directionalLight);

// Segunda luz para iluminar otras zonas
const secondaryLight = new THREE.DirectionalLight(
    0xffffff,
    1
);

secondaryLight.position.set(-100, 100, -100);

scene.add(secondaryLight);

// --------------------------------------------------
// 5. CONTROLES DEL RATÓN
// --------------------------------------------------

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

controls.dampingFactor = 0.05;

controls.enableZoom = true;

controls.enablePan = true;

// --------------------------------------------------
// 6. CARGAR MODELO 3D
// --------------------------------------------------

const mtlLoader = new MTLLoader();

mtlLoader.setPath(import.meta.env.BASE_URL + '/model/');

mtlLoader.load(
    'QuickMapleOptimized.mtl',

    function (materials) {

        // Preparar materiales y texturas
        materials.preload();

        // Crear cargador OBJ
        const objLoader = new OBJLoader();

        objLoader.setMaterials(materials);

        objLoader.setPath(import.meta.env.BASE_URL + '/model/');

        // Cargar modelo
        objLoader.load(
            'QuickMapleOptimized.obj',

            function (object) {

                // Calcular dimensiones del modelo
                const box = new THREE.Box3().setFromObject(object);

                // Obtener centro del modelo
                const center = box.getCenter(
                    new THREE.Vector3()
                );

                // Centrar el modelo en la escena
                object.position.sub(center);

                // Calcular tamaño del modelo
                const size = box.getSize(
                    new THREE.Vector3()
                );

                const maxDimension = Math.max(
                    size.x,
                    size.y,
                    size.z
                );

                // Ajustar cámara según el tamaño
                const distance = maxDimension * 1.8;

                camera.position.set(
                    distance,
                    distance * 0.7,
                    distance
                );

                camera.near = maxDimension / 1000;
                camera.far = maxDimension * 100;

                camera.updateProjectionMatrix();

                // Configurar controles
                controls.target.set(0, 0, 0);

                controls.minDistance = maxDimension * 0.2;
                controls.maxDistance = maxDimension * 10;

                controls.update();

                // Añadir modelo a la escena
                scene.add(object);

                console.log('Modelo 3D cargado correctamente');

            },

            function (xhr) {

                if (xhr.total > 0) {
                    console.log(
                        'Cargando modelo:',
                        (xhr.loaded / xhr.total * 100).toFixed(2) + '%'
                    );
                }

            },

            function (error) {

                console.error('Error al cargar el modelo OBJ:', error);

            }
        );

    },

    undefined,

    function (error) {

        console.error('Error al cargar los materiales MTL:', error);

    }
);

// --------------------------------------------------
// 7. REDIMENSIONAR VENTANA
// --------------------------------------------------

window.addEventListener('resize', function () {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});

// --------------------------------------------------
// 8. ANIMACIÓN Y RENDERIZADO
// --------------------------------------------------

function animate() {

    requestAnimationFrame(animate);

    // Actualizar controles del ratón
    controls.update();

    // Renderizar escena
    renderer.render(scene, camera);

}

animate();
