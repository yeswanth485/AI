"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";

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

function ThreeDPackViewerContent({ box, items }: ThreeDPackViewerProps) {
  const { Canvas } = require("@react-three/fiber");
  const { OrbitControls, Text } = require("@react-three/drei");
  const THREE = require("three");
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);

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
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -10]} intensity={0.3} />

        <mesh>
          <boxGeometry args={[box.length_cm, box.height_cm, box.width_cm]} />
          <meshBasicMaterial
            color="#3b82f6"
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>

        {items.map((item, i) => {
          const color = item.is_fragile ? "#f59e0b" : "#22c55e";
          return (
            <group
              key={i}
              position={[
                item.position_x + item.length_cm / 2,
                item.position_y + item.height_cm / 2,
                item.position_z + item.width_cm / 2,
              ]}
            >
              <mesh
                ref={hovered === i ? meshRef : null}
                onPointerOver={() => setHovered(i)}
                onPointerOut={() => setHovered(null)}
              >
                <boxGeometry
                  args={[item.length_cm, item.height_cm, item.width_cm]}
                />
                <meshStandardMaterial
                  color={color}
                  transparent
                  opacity={hovered === i ? 0.9 : 0.7}
                />
              </mesh>
              {hovered === i && (
                <Text
                  position={[0, item.height_cm / 2 + 2, 0]}
                  fontSize={2}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {item.product_name} (x{item.quantity})
                </Text>
              )}
            </group>
          );
        })}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={cameraDistance * 0.5}
          maxDistance={cameraDistance * 3}
        />

        <gridHelper args={[maxDim * 2, 20, "#333333", "#222222"]} position={[0, -0.1, 0]} />
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

export default function ThreeDPackViewer(props: ThreeDPackViewerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-[500px] bg-[#111111] rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Loading 3D viewer...</span>
      </div>
    );
  }

  return <ThreeDPackViewerContent {...props} />;
}