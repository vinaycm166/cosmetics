import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Sun, Eye } from 'lucide-react';
import { Product } from '../../types';

interface Interactive3DProductViewerProps {
  product: Product;
  className?: string;
}

export const Interactive3DProductViewer: React.FC<Interactive3DProductViewerProps> = ({
  product,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [lightPreset, setLightPreset] = useState<'studio' | 'sunset' | 'crystal'>('studio');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // References for render loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const mainLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Drag coordinates
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    rotX: 0,
    rotY: 0
  });

  const category = (product.category || '').toLowerCase();
  const isCreamOrJar = category.includes('cream') || category.includes('moisturizer') || category.includes('mask');
  const isDropper = category.includes('serum') || category.includes('oil') || category.includes('treatment');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.3, 4.2);
    cameraRef.current = camera;

    // 2. Renderer
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
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xFFF7F2, 1.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xFFFFFF, 3.0);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);
    mainLightRef.current = mainLight;

    const rimLight = new THREE.DirectionalLight(0xE84F87, 2.4);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    const fillLight = new THREE.PointLight(0xD4AF37, 1.8, 8);
    fillLight.position.set(2, -2, 3);
    scene.add(fillLight);

    // 4. Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Materials
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.9,
      roughness: 0.18
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFF5F8,
      transmission: 0.85,
      transparent: true,
      roughness: 0.08,
      ior: 1.5,
      thickness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const fluidColor = isDropper ? 0xE84F87 : 0xFF8A75;
    const fluidMat = new THREE.MeshStandardMaterial({
      color: fluidColor,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85
    });

    const ceramicMat = new THREE.MeshPhysicalMaterial({
      color: 0xFCFAF7,
      roughness: 0.15,
      clearcoat: 0.95,
      clearcoatRoughness: 0.12
    });

    const labelMat = new THREE.MeshStandardMaterial({
      color: 0xFFFCFA,
      roughness: 0.4,
      side: THREE.DoubleSide
    });

    // Build Form based on category
    if (isCreamOrJar) {
      // Luxury Cosmetic Jar
      const jarBodyGeo = new THREE.CylinderGeometry(0.85, 0.82, 0.95, 48);
      const jarBody = new THREE.Mesh(jarBodyGeo, ceramicMat);
      jarBody.castShadow = true;
      jarBody.receiveShadow = true;
      modelGroup.add(jarBody);

      const lidGeo = new THREE.CylinderGeometry(0.89, 0.89, 0.38, 48);
      const lid = new THREE.Mesh(lidGeo, goldMat);
      lid.position.y = 0.58;
      lid.castShadow = true;
      modelGroup.add(lid);

      const labelGeo = new THREE.CylinderGeometry(0.86, 0.83, 0.5, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
      const label = new THREE.Mesh(labelGeo, labelMat);
      modelGroup.add(label);
    } else {
      // Luxury Tall Bottle / Dropper
      const bottleGeo = new THREE.CylinderGeometry(0.65, 0.68, 1.9, 48);
      const bottle = new THREE.Mesh(bottleGeo, glassMat);
      bottle.castShadow = true;
      bottle.receiveShadow = true;
      modelGroup.add(bottle);

      const fluidGeo = new THREE.CylinderGeometry(0.58, 0.60, 1.6, 32);
      const fluid = new THREE.Mesh(fluidGeo, fluidMat);
      fluid.position.y = -0.1;
      modelGroup.add(fluid);

      const neckGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.32, 32);
      const neck = new THREE.Mesh(neckGeo, goldMat);
      neck.position.y = 1.05;
      modelGroup.add(neck);

      const capGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.5, 32);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x29242A, roughness: 0.3 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 1.45;
      modelGroup.add(cap);

      const labelGeo = new THREE.CylinderGeometry(0.66, 0.69, 0.9, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
      const label = new THREE.Mesh(labelGeo, labelMat);
      modelGroup.add(label);
    }

    // Shadow Floor
    const floorGeo = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 5. Pointer Events for 360-degree interactive rotation
    const onMouseDown = (e: MouseEvent) => {
      dragRef.current.isDown = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      setIsDragging(true);
      setIsAutoSpinning(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDown || !modelGroupRef.current) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;

      dragRef.current.rotY += deltaX * 0.008;
      dragRef.current.rotX += deltaY * 0.008;
      dragRef.current.rotX = Math.max(-0.6, Math.min(0.6, dragRef.current.rotX));
    };

    const onMouseUp = () => {
      dragRef.current.isDown = false;
      setIsDragging(false);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragRef.current.isDown = true;
        dragRef.current.startX = e.touches[0].clientX;
        dragRef.current.startY = e.touches[0].clientY;
        setIsAutoSpinning(false);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.isDown || e.touches.length !== 1 || !modelGroupRef.current) return;
      const deltaX = e.touches[0].clientX - dragRef.current.startX;
      const deltaY = e.touches[0].clientY - dragRef.current.startY;
      dragRef.current.startX = e.touches[0].clientX;
      dragRef.current.startY = e.touches[0].clientY;

      dragRef.current.rotY += deltaX * 0.008;
      dragRef.current.rotX += deltaY * 0.008;
      dragRef.current.rotX = Math.max(-0.6, Math.min(0.6, dragRef.current.rotX));
    };

    const onTouchEnd = () => {
      dragRef.current.isDown = false;
    };

    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 6. Resize Handler
    const onResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 7. Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const delta = clock.getDelta();

      if (modelGroupRef.current) {
        if (isAutoSpinning) {
          dragRef.current.rotY += delta * 0.7;
        }

        // Apply rotation with smooth lerp
        modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(modelGroupRef.current.rotation.y, dragRef.current.rotY, 0.1);
        modelGroupRef.current.rotation.x = THREE.MathUtils.lerp(modelGroupRef.current.rotation.x, dragRef.current.rotX, 0.1);
      }

      renderer.render(scene, camera);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);

      renderer.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, [isCreamOrJar, isDropper, isAutoSpinning]);

  // Adjust camera zoom
  const handleZoom = (factor: number) => {
    if (!cameraRef.current) return;
    const newZoom = Math.max(0.7, Math.min(1.4, zoomLevel * factor));
    setZoomLevel(newZoom);
    cameraRef.current.position.z = 4.2 / newZoom;
    cameraRef.current.updateProjectionMatrix();
  };

  // Adjust lighting preset
  const handlePreset = (preset: 'studio' | 'sunset' | 'crystal') => {
    setLightPreset(preset);
    if (!mainLightRef.current || !rimLightRef.current) return;

    if (preset === 'studio') {
      mainLightRef.current.color.setHex(0xFFFFFF);
      mainLightRef.current.intensity = 3.0;
      rimLightRef.current.color.setHex(0xE84F87);
    } else if (preset === 'sunset') {
      mainLightRef.current.color.setHex(0xFFA695);
      mainLightRef.current.intensity = 2.8;
      rimLightRef.current.color.setHex(0x721C46);
    } else if (preset === 'crystal') {
      mainLightRef.current.color.setHex(0xE9E1FF);
      mainLightRef.current.intensity = 3.4;
      rimLightRef.current.color.setHex(0xD4AF37);
    }
  };

  return (
    <div className={`relative w-full aspect-square bg-[#FAF7F4] rounded-3xl overflow-hidden border border-border/80 flex flex-col items-center justify-center ${className}`}>
      {/* 3D WebGL Canvas */}
      <div 
        ref={containerRef} 
        className={`w-full h-full cursor-grab active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : ''}`}
      />

      {/* Floating Controls Bar */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
        <button
          onClick={() => setIsAutoSpinning(!isAutoSpinning)}
          title={isAutoSpinning ? 'Pause Auto-Spin' : 'Start Auto-Spin'}
          className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-subtle ${
            isAutoSpinning ? 'bg-berry text-white' : 'bg-white/85 text-charcoal hover:bg-white'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoSpinning ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={() => handleZoom(1.15)}
          title="Zoom In"
          className="p-2 rounded-xl bg-white/85 text-charcoal hover:bg-white backdrop-blur-md shadow-subtle transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(0.85)}
          title="Zoom Out"
          className="p-2 rounded-xl bg-white/85 text-charcoal hover:bg-white backdrop-blur-md shadow-subtle transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Studio Lighting Presets */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 z-10 glass-pill p-1.5 rounded-full shadow-subtle">
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider pl-2 pr-1 flex items-center gap-1">
          <Sun className="w-3 h-3 text-champagne-500" /> Light:
        </span>
        <button
          onClick={() => handlePreset('studio')}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
            lightPreset === 'studio' ? 'bg-berry text-white' : 'text-charcoal hover:bg-black/5'
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => handlePreset('sunset')}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
            lightPreset === 'sunset' ? 'bg-rose text-white' : 'text-charcoal hover:bg-black/5'
          }`}
        >
          Sunset
        </button>
        <button
          onClick={() => handlePreset('crystal')}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
            lightPreset === 'crystal' ? 'bg-champagne-500 text-white' : 'text-charcoal hover:bg-black/5'
          }`}
        >
          Crystal
        </button>
      </div>

      {/* Drag Hint Pill */}
      <div className="absolute bottom-4 right-4 pointer-events-none select-none z-10">
        <span className="glass-pill px-3 py-1 rounded-full text-[10px] font-semibold text-charcoal/70 tracking-wider uppercase border border-border shadow-subtle flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-champagne-500 animate-pulse" />
          Drag 360° to Inspect
        </span>
      </div>
    </div>
  );
};
