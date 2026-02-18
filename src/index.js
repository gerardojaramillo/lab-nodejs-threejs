/**
 * @author Gerardo Jaramillo
 */

import './css/style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const log = console.log;
const WIDTH = 800, HEIGHT = 600;
const RADIUS = 8;
const AXIAL_TILT = 23.44 * Math.PI / 180;
const DAY_DURATION = 24;
const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
    45,
    WIDTH / HEIGHT,
    0.1,
    1000)
camera.position.set(0, 0, 25);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 1.0));

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(20, 10, 20);
scene.add(sunLight);

const earthGroup = new THREE.Group();
scene.add(earthGroup);
earthGroup.rotation.order = 'ZXY';
earthGroup.rotation.z = AXIAL_TILT;

const geometry = new THREE.SphereGeometry(RADIUS, 32, 32);
const material = new THREE.MeshPhongMaterial({ color: 0xb39ddb, shininess: 5 });
const earth = new THREE.Mesh(geometry, material);
earthGroup.add(earth);

const startTime = performance.now();

function animate() {
    requestAnimationFrame(animate);
    const elapsed = (performance.now() - startTime) / 1000;
    earthGroup.rotation.y = (elapsed / DAY_DURATION) * 2 * Math.PI;
    controls.update();
    renderer.render(scene, camera);
}

async function loadWorld() {
    fetch('/world-5p.geojson')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                const { type, coordinates } = feature.geometry;
                const polygons = type === 'Polygon' ? [coordinates] : coordinates;
                polygons.forEach(polygon => {
                    polygon.forEach(ring => {
                        const points = ring.map(([lon, lat]) =>
                            latlngToVector3(lon, lat, RADIUS + 0.05)
                        );
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
                        const line = new THREE.LineLoop(geometry, material);
                        earthGroup.add(line);
                    });
                });
            });
        })
        .catch(err =>
            console.error("Error cargando el GeoJSON:", err)
        );
}

function latlngToVector3(lon, lat, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

animate();
loadWorld();