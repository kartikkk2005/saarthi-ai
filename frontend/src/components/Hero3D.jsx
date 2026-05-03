"use client";

import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, Environment, Float, Sparkles, OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#D6A99D" />
        <spotLight position={[10, -10, -10]} angle={0.15} penumbra={1} intensity={2} color="#F2D0A9" />

        <Suspense fallback={null}>
          <Float
            speed={2}
            rotationIntensity={1}
            floatIntensity={1.5}
          >
            <mesh scale={1.2}>
              <sphereGeometry args={[1, 100, 100]} />
              <MeshDistortMaterial
                color="#FAFAFA"
                attach="material"
                distort={0.5}
                speed={2}
                roughness={0.1}
                metalness={0.9}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
          </Float>

          <Float speed={1.5} rotationIntensity={2} floatIntensity={2}>
            <mesh position={[-2, -1, -2]} scale={0.5}>
              <sphereGeometry args={[1, 64, 64]} />
              <MeshDistortMaterial color="#F2D0A9" distort={0.6} speed={3} roughness={0.2} metalness={0.8} />
            </mesh>
          </Float>
          
          <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
            <mesh position={[2, 1, -1]} scale={0.6}>
              <sphereGeometry args={[1, 64, 64]} />
              <MeshDistortMaterial color="#D6A99D" distort={0.4} speed={2.5} roughness={0.1} metalness={0.9} />
            </mesh>
          </Float>

          <Sparkles count={150} scale={12} size={3} speed={0.4} opacity={0.4} color="#9F8772" />
          
          <Environment preset="studio" />
        </Suspense>
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 2 - 0.1} />
      </Canvas>
    </div>
  );
}
