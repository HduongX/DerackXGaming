import * as THREE from 'three';

export function init3DBackground() {
  const canvas = document.getElementById('webgl-canvas');
  const scene = new THREE.Scene();
  
  // Camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  // Renderer (Tối ưu hiệu năng)
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: window.devicePixelRatio < 2 });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 1. Particles (Sao)
  const particlesGeo = new THREE.BufferGeometry();
  const particlesCount = 1500; // Tối ưu: 1500 hạt là đủ đẹp
  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMat = new THREE.PointsMaterial({
    size: 0.15,
    color: 0x8b5cf6, // Màu tím
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particlesMesh);

  // 2. Hành tinh dây (Wireframe Sphere)
  const sphereGeo = new THREE.IcosahedronGeometry(8, 1);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee, // Màu cyan
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  // Xử lý chuột tương tác nhẹ
  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Xoay particles
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Xoay sphere
    sphere.rotation.y = elapsedTime * 0.1;
    sphere.rotation.x = elapsedTime * 0.05;

    // Parallax theo chuột
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
}
