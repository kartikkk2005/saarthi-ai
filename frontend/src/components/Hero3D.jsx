"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Environment, Float, OrbitControls, Stars, RoundedBox } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";

// Interactive particle field that reacts to mouse
function InteractiveParticles({ count = 500 }) {
  const mesh = useRef();
  const mouse = useRef(new THREE.Vector2(0, 0));

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color("#2E7D32"), // finance green
      new THREE.Color("#43A047"),
      new THREE.Color("#F2D0A9"), // gold
      new THREE.Color("#D6A99D"),
      new THREE.Color("#1B5E20"),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random() * 0.5 + 0.1;
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, scales, colors };
  }, [count]);

  useFrame(({ pointer }) => {
    mouse.current.set(pointer.x, pointer.y);
    if (mesh.current) {
      const positions = mesh.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        positions[iy] += Math.sin(Date.now() * 0.001 + i * 0.5) * 0.001;
        const dx = positions[ix] - mouse.current.x * 8;
        const dy = positions[iy] - mouse.current.y * 5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3) {
          const force = (3 - dist) * 0.003;
          positions[ix] += dx * force;
          positions[iy] += dy * force;
        }
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={particles.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.7} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Network connection lines
function ConnectionLines({ count = 100 }) {
  const linesRef = useRef();

  const linePositions = useMemo(() => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      pts.push(new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6
      ));
    }
    const positions = [];
    const maxDist = 3;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < maxDist) {
          positions.push(pts[i].x, pts[i].y, pts[i].z);
          positions.push(pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }
    return new Float32Array(positions);
  }, [count]);

  useFrame(() => {
    if (linesRef.current) linesRef.current.rotation.y += 0.0003;
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#43A047" transparent opacity={0.25} />
    </lineSegments>
  );
}

// Floating flat coin (cylinder)
function FloatingCoin() {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    ref.current.rotation.z += 0.01;
  });
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={ref} position={[0, 0, 0]} scale={1.1}>
        <cylinderGeometry args={[1, 1, 0.12, 64]} />
        <meshStandardMaterial
          color="#F2D0A9"
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.45}
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  );
}

// Rising bar chart pillars
function BarChart() {
  const groupRef = useRef();
  const bars = useMemo(() => {
    return [
      { height: 0.8, x: -1.2, color: "#2E7D32" },
      { height: 1.4, x: -0.6, color: "#43A047" },
      { height: 1.0, x: 0.0, color: "#66BB6A" },
      { height: 1.8, x: 0.6, color: "#2E7D32" },
      { height: 1.3, x: 1.2, color: "#43A047" },
    ];
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <group ref={groupRef} position={[-3, -1.5, -2]} scale={0.6}>
        {bars.map((bar, i) => (
          <mesh key={i} position={[bar.x, bar.height / 2, 0]}>
            <boxGeometry args={[0.4, bar.height, 0.4]} />
            <meshStandardMaterial
              color={bar.color}
              metalness={0.3}
              roughness={0.4}
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
        {/* Base line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 0.03, 0.5]} />
          <meshStandardMaterial color="#9F8772" transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

// Diamond shape representing value/premium
function Diamond() {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y += 0.008;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.1;
  });
  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
      <mesh ref={ref} position={[3, 1, -1]} scale={0.5}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#D6A99D"
          metalness={0.9}
          roughness={0.05}
          transparent
          opacity={0.4}
          envMapIntensity={3}
        />
      </mesh>
    </Float>
  );
}

// Upward trending line
function TrendLine() {
  const ref = useRef();

  const lineGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(-2, -0.5, 0),
      new THREE.Vector3(-1.2, 0.2, 0),
      new THREE.Vector3(-0.5, -0.1, 0),
      new THREE.Vector3(0.3, 0.8, 0),
      new THREE.Vector3(1.0, 0.5, 0),
      new THREE.Vector3(1.8, 1.4, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 64, 0.03, 8, false);
    return geometry;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={ref} geometry={lineGeometry} position={[2.5, -1.5, -1.5]} scale={0.8}>
        <meshStandardMaterial
          color="#43A047"
          metalness={0.6}
          roughness={0.2}
          transparent
          opacity={0.6}
          emissive="#2E7D32"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#F2D0A9" />
        <spotLight position={[10, -10, -10]} angle={0.15} penumbra={1} intensity={1.5} color="#43A047" />

        <Suspense fallback={null}>
          <InteractiveParticles count={600} />
          <ConnectionLines count={80} />

          {/* Finance-themed 3D elements */}
          <FloatingCoin />
          <BarChart />
          <Diamond />
          <TrendLine />

          <Stars radius={50} depth={50} count={2000} factor={3} saturation={0} fade speed={1} />
          <Environment preset="studio" />
        </Suspense>
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 2 - 0.1} />
      </Canvas>
    </div>
  );
}
