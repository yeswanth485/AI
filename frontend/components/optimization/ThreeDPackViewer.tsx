"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html } from "@react-three/drei";
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
  showDimensions?: boolean;
}

const itemColors = [
  "#22c55e", "#3b82f6", "#a78bfa", "#f59e0b", "#ef4444",
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1",
  "#14b8a6", "#eab308", "#8b5cf6", "#0ea5e9", "#d946ef",
];

function BoxContainer({ box, showDimensions }: { box: Box3D; showDimensions?: boolean }) {
  const thickness = 0.3;
  const { length_cm: L, width_cm: W, height_cm: H } = box;
  const halfL = L / 2, halfW = W / 2, halfH = H / 2;
  const t = thickness;

  const panelGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const panelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#3b82f6",
    transparent: true,
    opacity: 0.1,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide,
  }), []);

  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({ color: "#60a5fa", transparent: true, opacity: 0.5 }), []);
  const dimEdgeMat = useMemo(() => new THREE.LineDashedMaterial({
    color: "#c8ff00",
    transparent: true,
    opacity: 0.8,
    dashSize: 1.5,
    gapSize: 0.8,
  }), []);

  const panels = useMemo(() => [
    { pos: [0, halfH, 0] as [number, number, number], scale: [L, t, W] as [number, number, number] },
    { pos: [0, -halfH, 0] as [number, number, number], scale: [L, t, W] as [number, number, number] },
    { pos: [-halfL, 0, 0] as [number, number, number], scale: [t, H, W] as [number, number, number] },
    { pos: [halfL, 0, 0] as [number, number, number], scale: [t, H, W] as [number, number, number] },
    { pos: [0, 0, -halfW] as [number, number, number], scale: [L, H, t] as [number, number, number] },
    { pos: [0, 0, halfW] as [number, number, number], scale: [L, H, t] as [number, number, number] },
  ], []);

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
  }, []);

  const dimLineLength = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfL, -halfH - 4, -halfW),
      new THREE.Vector3(halfL, -halfH - 4, -halfW),
    ]);
    const lineGeo = geo as THREE.BufferGeometry & { computeLineDistances: () => void };
    lineGeo.computeLineDistances();
    return geo;
  }, []);

  const dimLineWidth = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(halfL + 4, -halfH, -halfW),
      new THREE.Vector3(halfL + 4, halfH, -halfW),
    ]);
    const lineGeo = geo as THREE.BufferGeometry & { computeLineDistances: () => void };
    lineGeo.computeLineDistances();
    return geo;
  }, []);

  const dimLineDepth = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfL, -halfH, -halfW - 4),
      new THREE.Vector3(-halfL, -halfH, halfW + 4),
    ]);
    const lineGeo = geo as THREE.BufferGeometry & { computeLineDistances: () => void };
    lineGeo.computeLineDistances();
    return geo;
  }, []);

  return (
    <group>
      {panels.map((p, i) => (
        <mesh key={i} geometry={panelGeo} material={panelMat} position={p.pos} scale={p.scale} />
      ))}
      <lineSegments geometry={edges} material={edgeMat} />

      {showDimensions && (
        <>
          <lineSegments geometry={dimLineLength} material={dimEdgeMat} />
          <lineSegments geometry={dimLineWidth} material={dimEdgeMat} />
          <lineSegments geometry={dimLineDepth} material={dimEdgeMat} />

          <Html position={[0, -halfH - 6, -halfW]} center distanceFactor={1.5}>
            <div className="bg-ink2/90 border border-lime/30 rounded-lg px-3 py-1.5 text-center backdrop-blur-sm shadow-lg">
              <div className="text-[9px] text-lime uppercase tracking-wider font-bold">Length</div>
              <div className="text-[13px] text-white font-bold font-mono">{L} cm</div>
            </div>
          </Html>

          <Html position={[halfL + 6, 0, -halfW]} center distanceFactor={1.5}>
            <div className="bg-ink2/90 border border-teal/30 rounded-lg px-3 py-1.5 text-center backdrop-blur-sm shadow-lg">
              <div className="text-[9px] text-teal uppercase tracking-wider font-bold">Height</div>
              <div className="text-[13px] text-white font-bold font-mono">{H} cm</div>
            </div>
          </Html>

          <Html position={[-halfL, -halfH, -halfW - 6]} center distanceFactor={1.5}>
            <div className="bg-ink2/90 border border-purple/30 rounded-lg px-3 py-1.5 text-center backdrop-blur-sm shadow-lg">
              <div className="text-[9px] text-purple uppercase tracking-wider font-bold">Width</div>
              <div className="text-[13px] text-white font-bold font-mono">{W} cm</div>
            </div>
          </Html>

          <Html position={[0, halfH + 5, 0]} center distanceFactor={1.5}>
            <div className="bg-accent/90 border border-accent rounded-lg px-4 py-2 text-center backdrop-blur-sm shadow-[0_0_20px_rgba(200,255,0,.3)]">
              <div className="text-[10px] text-ink uppercase tracking-wider font-bold">{box.name}</div>
              <div className="text-[11px] text-ink/70 font-mono">{L} × {W} × {H} cm</div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

function PackedItem3D({ item, index }: { item: Item3D; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const baseColor = item.is_fragile ? "#f59e0b" : itemColors[index % itemColors.length];
  const [animationComplete, setAnimationComplete] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
        onPointerOver={(e) => { setHovered(true); setShowTooltip(true); e.stopPropagation(); }}
        onPointerOut={() => { setHovered(false); setShowTooltip(false); }}
      >
        <boxGeometry args={[item.length_cm - 0.2, item.height_cm - 0.2, item.width_cm - 0.2]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {hovered && (
        <mesh>
          <boxGeometry args={[item.length_cm + 0.3, item.height_cm + 0.3, item.width_cm + 0.3]} />
          <meshBasicMaterial color={baseColor} transparent opacity={0.1} wireframe />
        </mesh>
      )}
      {showTooltip && animationComplete && (
        <Html position={[0, item.height_cm / 2 + 2, 0]} center distanceFactor={1.2}>
          <div className="bg-ink2/95 border border-border2 rounded-lg px-3 py-2 backdrop-blur-sm shadow-xl whitespace-nowrap">
            <div className="text-[11px] text-white font-semibold">{item.product_name}</div>
            <div className="text-[9px] text-muted-dark mt-0.5">
              {item.length_cm}×{item.width_cm}×{item.height_cm} cm · {item.is_fragile ? "⚠ Fragile" : "Standard"}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function FloorGrid({ box }: { box: Box3D }) {
  const maxDim = Math.max(box.length_cm, box.width_cm, box.height_cm);
  return (
    <group position={[0, -box.height_cm / 2 - 0.5, 0]}>
      <gridHelper args={[maxDim * 2.5, 20, "#2a2a3a", "#1a1a28"]} />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.3}
        scale={maxDim * 3}
        blur={2}
        far={maxDim * 2}
      />
    </group>
  );
}

function Scene({ box, items, showDimensions }: ThreeDPackViewerProps) {
  const maxDim = Math.max(box.length_cm, box.width_cm, box.height_cm);
  const cameraDistance = maxDim * 2.2;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[15, 20, 10]} intensity={1.2} />
      <directionalLight position={[-10, 10, -10]} intensity={0.4} />
      <pointLight position={[0, 25, 0]} intensity={0.6} color="#c8ff00" />
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#3b82f6" />

      <BoxContainer box={box} showDimensions={showDimensions} />

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
        autoRotate={!showDimensions}
        autoRotateSpeed={1.2}
        maxPolarAngle={Math.PI * 0.85}
      />
    </>
  );
}

export default function ThreeDPackViewer({ box, items, showDimensions = false }: ThreeDPackViewerProps) {
  const maxDim = Math.max(box.length_cm, box.width_cm, box.height_cm);
  const cameraDistance = maxDim * 2.2;
  const totalVolume = box.length_cm * box.width_cm * box.height_cm;
  const itemsVolume = items.reduce((sum, item) => sum + (item.length_cm * item.width_cm * item.height_cm * item.quantity), 0);
  const fillRate = ((itemsVolume / totalVolume) * 100).toFixed(1);

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
        <Scene box={box} items={items} showDimensions={showDimensions} />
      </Canvas>

      {!showDimensions && (
        <>
          <div className="absolute top-4 left-4 glass rounded-xl px-4 py-2.5">
            <div className="text-[12px] font-bold text-foreground">{box.name}</div>
            <div className="text-[10px] text-muted mt-0.5">{items.length} items · {fillRate}% fill</div>
          </div>

          <div className="absolute bottom-4 left-4 flex gap-4 text-[11px]">
            <div className="flex items-center gap-2 glass rounded-lg px-3 py-1.5">
              <div className="w-2.5 h-2.5 rounded bg-green-500" />
              <span className="text-gray-300">Non-fragile</span>
            </div>
            <div className="flex items-center gap-2 glass rounded-lg px-3 py-1.5">
              <div className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span className="text-gray-300">Fragile</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 glass rounded-lg px-3 py-1.5 text-[10px] text-gray-400">
            Drag to rotate 360° · Scroll to zoom
          </div>
        </>
      )}

      {showDimensions && (
        <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-2.5">
          <div className="text-[10px] text-lime uppercase tracking-wider font-bold">3D Pack View — Rotate 360°</div>
          <div className="text-[11px] text-foreground font-mono mt-0.5">
            {box.name} · {box.length_cm}×{box.width_cm}×{box.height_cm} cm · {items.length} items · {fillRate}% fill
          </div>
        </div>
      )}
    </div>
  );
}
