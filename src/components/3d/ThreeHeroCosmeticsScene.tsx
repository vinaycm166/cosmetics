import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeHeroCosmeticsSceneProps {
  className?: string;
  onSceneReady?: () => void;
}

export const ThreeHeroCosmeticsScene: React.FC<ThreeHeroCosmeticsSceneProps> = ({ 
  className = '', 
  onSceneReady 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGLError(true);
        return;
      }
    } catch {
      setHasWebGLError(true);
      return;
    }

    let animationFrameId: number;
    let isVisible = true;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFFF9F4, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.6);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    // 2. Lighting System: Luxury Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xFFF0F5, 1.4);
    scene.add(ambientLight);

    const mainSpot = new THREE.DirectionalLight(0xFFFFFF, 2.8);
    mainSpot.position.set(4, 6, 5);
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    mainSpot.shadow.bias = -0.0005;
    scene.add(mainSpot);

    const rimLight = new THREE.DirectionalLight(0xE84F87, 2.2); // Rose tint rim
    rimLight.position.set(-5, 3, -3);
    scene.add(rimLight);

    const goldAccentLight = new THREE.PointLight(0xD4AF37, 2.0, 10); // Champagne reflection
    goldAccentLight.position.set(2, -2, 2.5);
    scene.add(goldAccentLight);

    // 3. 3D Object Group with Hierarchy
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- Object A: Luxury Serum Dropper Bottle (Glass + Rose Fluid + Gold Collar) ---
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(-0.7, -0.3, 0.2);
    bottleGroup.rotation.y = 0.35;
    bottleGroup.rotation.z = -0.06;

    // Outer Glass Body
    const glassGeo = new THREE.CylinderGeometry(0.55, 0.58, 1.6, 48, 1, false);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFF0F5,
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      ior: 1.52,
      thickness: 0.6,
      specularIntensity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.castShadow = true;
    glassMesh.receiveShadow = true;
    bottleGroup.add(glassMesh);

    // Inner Serum Formulation (Rich Rose Fluid Core)
    const serumGeo = new THREE.CylinderGeometry(0.48, 0.50, 1.35, 32);
    const serumMat = new THREE.MeshStandardMaterial({
      color: 0xE84F87,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88
    });
    const serumMesh = new THREE.Mesh(serumGeo, serumMat);
    serumMesh.position.y = -0.08;
    bottleGroup.add(serumMesh);

    // Gold Neck Ring
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.88,
      roughness: 0.18,
      envMapIntensity: 1.5
    });
    const neckGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.22, 32);
    const neckMesh = new THREE.Mesh(neckGeo, goldMat);
    neckMesh.position.y = 0.9;
    bottleGroup.add(neckMesh);

    // Rubber Pipette Squeeze Bulb
    const bulbGeo = new THREE.SphereGeometry(0.24, 32, 16);
    bulbGeo.scale(1, 1.4, 1);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0x29242A,
      roughness: 0.55,
      metalness: 0.05
    });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.y = 1.25;
    bottleGroup.add(bulbMesh);

    // Minimal Editorial Product Label Strip
    const labelGeo = new THREE.CylinderGeometry(0.56, 0.59, 0.75, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0xFFFCFA,
      roughness: 0.35,
      side: THREE.DoubleSide
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    bottleGroup.add(labelMesh);

    mainGroup.add(bottleGroup);

    // --- Object B: Luxury Peptide Cream Jar ---
    const jarGroup = new THREE.Group();
    jarGroup.position.set(0.9, -0.65, 0.6);
    jarGroup.rotation.y = -0.4;
    jarGroup.rotation.z = 0.04;

    // Ceramic Cream Body
    const jarBodyGeo = new THREE.CylinderGeometry(0.72, 0.70, 0.78, 48);
    const jarBodyMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFF9F4,
      roughness: 0.12,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      metalness: 0.05
    });
    const jarBodyMesh = new THREE.Mesh(jarBodyGeo, jarBodyMat);
    jarBodyMesh.castShadow = true;
    jarBodyMesh.receiveShadow = true;
    jarGroup.add(jarBodyMesh);

    // Champagne Metallic Lid
    const jarLidGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.32, 48);
    const jarLidMesh = new THREE.Mesh(jarLidGeo, goldMat);
    jarLidMesh.position.y = 0.48;
    jarLidMesh.castShadow = true;
    jarGroup.add(jarLidMesh);

    // Subtle Berry Emboss Accent Ring
    const lidAccentGeo = new THREE.TorusGeometry(0.68, 0.02, 16, 64);
    const lidAccentMat = new THREE.MeshStandardMaterial({
      color: 0x721C46,
      metalness: 0.4,
      roughness: 0.2
    });
    const lidAccentMesh = new THREE.Mesh(lidAccentGeo, lidAccentMat);
    lidAccentMesh.rotation.x = Math.PI / 2;
    lidAccentMesh.position.y = 0.64;
    jarGroup.add(lidAccentMesh);

    mainGroup.add(jarGroup);

    // --- Object C: Floating Dewy Serum Droplets & Spheres ---
    const pearlGroup = new THREE.Group();
    const pearlGeo = new THREE.SphereGeometry(0.08, 24, 24);
    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      transmission: 0.9,
      transparent: true,
      roughness: 0.05,
      ior: 1.45,
      thickness: 0.4,
      specularIntensity: 1.0
    });

    const pearls: { mesh: THREE.Mesh; initialY: number; speed: number; orbitRadius: number; angle: number }[] = [];
    const pearlConfigs = [
      { radius: 1.5, y: 0.6, speed: 0.008, scale: 1.2 },
      { radius: 1.2, y: -0.2, speed: -0.011, scale: 0.8 },
      { radius: 1.8, y: -0.8, speed: 0.006, scale: 1.0 },
      { radius: 1.4, y: 1.1, speed: -0.009, scale: 0.65 },
      { radius: 2.1, y: 0.1, speed: 0.007, scale: 1.4 }
    ];

    pearlConfigs.forEach((cfg, i) => {
      const mesh = new THREE.Mesh(pearlGeo, pearlMat);
      mesh.scale.setScalar(cfg.scale);
      mesh.castShadow = true;
      pearlGroup.add(mesh);
      pearls.push({
        mesh,
        initialY: cfg.y,
        speed: cfg.speed,
        orbitRadius: cfg.radius,
        angle: (i * Math.PI * 2) / pearlConfigs.length
      });
    });

    mainGroup.add(pearlGroup);

    // --- Floor Reflection Shadow Plane ---
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.08 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.05;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 4. Mouse / Touch Pointer Interaction with Smooth Damping
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

      mouse.targetX = Math.max(-1, Math.min(1, x));
      mouse.targetY = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // 5. Intersection Observer: Stop loop when off-screen for maximum performance
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    // 6. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Render Loop with Smooth Physics
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Group orientation responding to mouse
      mainGroup.rotation.y = mouse.x * 0.35 + Math.sin(elapsedTime * 0.4) * 0.04;
      mainGroup.rotation.x = -mouse.y * 0.25;

      // Subtle breathing float for each product
      bottleGroup.position.y = -0.3 + Math.sin(elapsedTime * 1.2) * 0.05;
      bottleGroup.rotation.z = -0.06 + Math.cos(elapsedTime * 0.8) * 0.02;

      jarGroup.position.y = -0.65 + Math.cos(elapsedTime * 1.1) * 0.04;
      jarGroup.rotation.y = -0.4 + Math.sin(elapsedTime * 0.6) * 0.03;

      // Orbiting serum droplets
      pearls.forEach(p => {
        p.angle += p.speed;
        p.mesh.position.x = Math.cos(p.angle) * p.orbitRadius;
        p.mesh.position.z = Math.sin(p.angle) * p.orbitRadius;
        p.mesh.position.y = p.initialY + Math.sin(elapsedTime * 2 + p.angle) * 0.12;
      });

      // Specular highlight follow
      goldAccentLight.position.x = 2 + mouse.x * 1.5;
      goldAccentLight.position.y = -2 + mouse.y * 1.5;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);
    onSceneReady?.();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      // Clean disposal
      glassGeo.dispose();
      glassMat.dispose();
      serumGeo.dispose();
      serumMat.dispose();
      neckGeo.dispose();
      goldMat.dispose();
      bulbGeo.dispose();
      bulbMat.dispose();
      labelGeo.dispose();
      labelMat.dispose();
      jarBodyGeo.dispose();
      jarBodyMat.dispose();
      jarLidGeo.dispose();
      lidAccentGeo.dispose();
      lidAccentMat.dispose();
      pearlGeo.dispose();
      pearlMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [onSceneReady]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      {/* Three.js Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[380px] sm:min-h-[480px] lg:min-h-[560px] cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Cosmetics Display"
      />

      {/* Graceful Fallback if WebGL is disabled or fails */}
      {hasWebGLError && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-3d-float border border-champagne-200/40">
            <img 
              src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80" 
              alt="Dew & Go Botanical Formulation" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent flex items-end p-6">
              <span className="font-editorial text-xl text-white italic">Pure Botanical Formulations</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating 3D Badge Overlay */}
      <div className="absolute bottom-4 right-4 pointer-events-none select-none">
        <span className="glass-pill px-3 py-1 rounded-full text-[10px] font-semibold text-charcoal/70 tracking-wider uppercase border border-border shadow-subtle flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose animate-ping" />
          Interactive 3D Stage • Drag to Orbit
        </span>
      </div>
    </div>
  );
};
