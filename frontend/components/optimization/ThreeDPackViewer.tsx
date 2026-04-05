"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface Box3D {
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
}

interface Item3D {
  product_name: string;
  position_x: number;
  position_y: number;
  position_z: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  is_fragile: boolean;
  quantity: number;
}

interface ThreeDPackViewerProps {
  box: Box3D;
  items: Item3D[];
}

const itemColors = [
  "#22c55e", "#3b82f6", "#a78bfa", "#f59e0b", "#ef4444",
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1",
  "#14b8a6", "#eab308", "#8b5cf6", "#0ea5e9", "#d946ef",
];

function BoxContainer({ box }: { box: Box3D }) {
  const { length_cm: L, width_cm: W, height_cm: H } = box;
  const halfL = L / 2, halfW = W / 2, halfH = H / 2;

  const panelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#3b82f6",
    transparent: true,
    opacity: 0.08,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide,
  }), []);

  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({
    color: "#60a5fa",
    transparent: true,
    opacity: 0.4,
  }), []);

  const edges = useMemo(() => {
    const points: [number, number, number][] = [
      [-halfL, -halfH, -halfW], [halfL, -halfH, -halfW],
      [halfL, -halfH, halfW], [-halfL, -halfH, halfW],
      [-halfL, -halfH, -halfW],
      [-halfL, halfH, -halfW], [halfL, halfH, -halfW],
      [halfL, halfH, halfW], [-halfL, halfH, halfW],
      [-halfL, halfH, -halfW],
      [halfL, -halfH, -halfW], [halfL, halfH, -halfW],
      [halfL, -halfH, halfW], [halfL, halfH, halfW],
      [-halfL, -halfH, halfW], [-halfL, halfH, halfW],
    ];
    return new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  }, [halfL, halfW, halfH]);

  const panelGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const panels = useMemo(() => {
    const t = 0.3;
    return [
      { pos: [0, halfH, 0] as [number, number, number], scale: [L, t, W] as [number, number, number] },
      { pos: [0, -halfH, 0] as [number, number, number], scale: [L, t, W] as [number, number, number] },
      { pos: [-halfL, 0, 0] as [number, number, number], scale: [t, H, W] as [number, number, number] },
      { pos: [halfL, 0, 0] as [number, number, number], scale: [t, H, W] as [number, number, number] },
      { pos: [0, 0, -halfW] as [number, number, number], scale: [L, H, t] as [number, number, number] },
      { pos: [0, 0, halfW] as [number, number, number], scale: [L, H, t] as [number, number, number] },
    ];
  }, [L, W, H, halfL, halfW, halfH]);

  return (
    <group>
      {panels.map((p, i) => (
        <mesh key={i} geometry={panelGeo} material={panelMat} position={p.pos} scale={p.scale} />
      ))}
      <lineSegments geometry={edges} material={edgeMat} />
    </group>
  );
}

function PackedItem3D({ item, index }: { item: Item3D; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const baseColor = item.is_fragile ? "#f59e0b" : itemColors[index % itemColors.length];
  const [animationComplete, setAnimationComplete] = useState(false);
  const [hovered, setHovered] = useState(false);

  const targetPosition: [number, number, number] = [
    item.position_x + item.length_cm / 2,
    item.position_y + item.height_cm / 2,
    item.position_z + item.width_cm / 2,
  ];

  const startPosition: [number, number, number] = [
    targetPosition[0],
    80 + index * 15,
    targetPosition[2],
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 800 + index * 400);
    return () => clearTimeout(timer);
  }, [index]);

  useFrame((state, delta) => {
    if (groupRef.current && !animationComplete) {
      const elapsed = state.clock.elapsedTime;
      const delay = index * 0.4;
      const animTime = Math.max(0, elapsed - delay - 0.8);
      const progress = Math.min(1, animTime / 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      groupRef.current.position.y = THREE.MathUtils.lerp(
        startPosition[1],
        targetPosition[1],
        eased
      );

      if (progress < 1) {
        groupRef.current.rotation.y += delta * 2;
      }
    }

    if (meshRef.current && animationComplete) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: baseColor,
    transparent: true,
    opacity: hovered ? 0.95 : 0.75,
    roughness: 0.4,
    metalness: 0.1,
    emissive: hovered ? baseColor : "#000000",
    emissiveIntensity: hovered ? 0.4 : 0,
  }), [baseColor, hovered]);

  return (
    <group
      ref={groupRef}
      position={animationComplete ? targetPosition : startPosition}
    >
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[Math.max(0.5, item.length_cm - 0.2), Math.max(0.5, item.height_cm - 0.2), Math.max(0.5, item.width_cm - 0.2)]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

function FloorGrid({ box }: { box: Box3D }) {
  const maxDim = Math.max(box.length_cm, box.width_cm, box.height_cm);
  return (
    <group position={[0, -box.height_cm / 2 - 0.5, 0]}>
      <gridHelper args={[maxDim * 2.5, 20, "#2a2a3a", "#1a1a28"]} />
    </group>
  );
}

function Scene({ box, items }: ThreeDPackViewerProps) {
  const maxDim = Math.max(box.length_cm, box.width_cm, box.height_cm);
  const cameraDistance = maxDim * 2.2;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[15, 20, 10]} intensity={1} />
      <directionalLight position={[-10, 10, -10]} intensity={0.3} />
      <pointLight position={[0, 25, 0]} intensity={0.4} color="#c8ff00" />

      <BoxContainer box={box} />

      {items.map((item, i) => (
        <PackedItem3D key={i} item={item} index={i} />
      ))}

      <FloorGrid box={box} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={cameraDistance * 0.4}
        maxDistance={cameraDistance * 3.5}
        autoRotate
        autoRotateSpeed={1.2}
        maxPolarAngle={Math.PI * 0.85}
      />
    </>
  );
}

export default function ThreeDPackViewer({ box, items }: ThreeDPackViewerProps) {
  const maxDim = Math.max(box.length_cm, box.width_cm, box.height_cm);
  const cameraDistance = maxDim * 2.2;
  const totalVolume = box.length_cm * box.width_cm * box.height_cm;
  const itemsVolume = items.reduce((sum, item) => sum + (item.length_cm * item.width_cm * item.height_cm * item.quantity), 0);
  const fillRate = totalVolume > 0 ? ((itemsVolume / totalVolume) * 100).toFixed(1) : "0";

  return (
    <div className="w-full h-[500px] bg-gradient-to-b from-[#0a0a14] to-[#0e0e1a] rounded-xl overflow-hidden relative border border-border">
      <Canvas
        camera={{
          position: [cameraDistance, cameraDistance * 0.65, cameraDistance],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene box={box} items={items} />
      </Canvas>

      <div className="absolute top-4 left-4 bg-ink2/90 border border-border rounded-xl px-4 py-2.5 backdrop-blur-sm">
        <div className="text-[12px] font-bold text-foreground">{box.name}</div>
        <div className="text-[10px] text-muted mt-0.5">{items.length} items &middot; {fillRate}% fill</div>
      </div>

      <div className="absolute bottom-4 left-4 flex gap-3 text-[11px]">
        <div className="flex items-center gap-2 bg-ink2/90 border border-border rounded-lg px-3 py-1.5 backdrop-blur-sm">
          <div className="w-2.5 h-2.5 rounded bg-green-500" />
          <span className="text-gray-300">Non-fragile</span>
        </div>
        <div className="flex items-center gap-2 bg-ink2/90 border border-border rounded-lg px-3 py-1.5 backdrop-blur-sm">
          <div className="w-2.5 h-2.5 rounded bg-amber-500" />
          <span className="text-gray-300">Fragile</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-ink2/90 border border-border rounded-lg px-3 py-1.5 backdrop-blur-sm text-[10px] text-gray-400">
        Drag to rotate 360&deg; &middot; Scroll to zoom
      </div>

      <div className="absolute bottom-4 right-4 bg-ink2/90 border border-border rounded-xl px-4 py-2.5 backdrop-blur-sm">
        <div className="text-[10px] text-lime uppercase tracking-wider font-bold">Box Dimensions</div>
        <div className="text-[11px] text-foreground font-mono mt-0.5">
          {box.length_cm} &times; {box.width_cm} &times; {box.height_cm} cm
        </div>
      </div>
    </div>
  );
}
