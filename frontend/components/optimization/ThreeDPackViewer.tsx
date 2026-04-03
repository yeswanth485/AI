"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
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

function BoxWireframe({ box }: { box: Box3D }) {
  return (
    <mesh>
      <boxGeometry args={[box.length_cm, box.height_cm, box.width_cm]} />
      <meshBasicMaterial
        color="#3b82f6"
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

function PackedItem3D({ item }: { item: Item3D }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = item.is_fragile ? "#f59e0b" : "#22c55e";

  return (
    <group
      position={[
        item.position_x + item.length_cm / 2,
        item.position_y + item.height_cm / 2,
        item.position_z + item.width_cm / 2,
      ]}
    >
      <mesh
        ref={meshRef}
      >
        <boxGeometry
          args={[item.length_cm, item.height_cm, item.width_cm]}
        />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

function Scene({ box, items }: ThreeDPackViewerProps) {
  const maxDim = Math.max(box.length_cm, box.width_cm, box.height_cm);
  const cameraDistance = maxDim * 2.5;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, -10, -10]} intensity={0.3} />

      <BoxWireframe box={box} />

      {items.map((item, i) => (
        <PackedItem3D key={i} item={item} />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={cameraDistance * 0.5}
        maxDistance={cameraDistance * 3}
      />

      <gridHelper args={[maxDim * 2, 20, "#333333", "#222222"]} position={[0, -0.1, 0]} />
    </>
  );
}

export default function ThreeDPackViewer({ box, items }: ThreeDPackViewerProps) {
  const maxDim = Math.max(box.length_cm, box.width_cm, box.height_cm);
  const cameraDistance = maxDim * 2.5;

  return (
    <div className="w-full h-[500px] bg-[#111111] rounded-lg overflow-hidden relative">
      <Canvas
        camera={{
          position: [cameraDistance, cameraDistance * 0.7, cameraDistance],
          fov: 50,
        }}
      >
        <Scene box={box} items={items} />
      </Canvas>

      <div className="absolute bottom-4 left-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-300">Non-fragile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded" />
          <span className="text-gray-300">Fragile</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 text-xs text-gray-500">
        Drag to rotate • Scroll to zoom • Double-click to reset
      </div>
    </div>
  );
}