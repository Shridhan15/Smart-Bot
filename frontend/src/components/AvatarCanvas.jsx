import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import Avatar from "./Avatar";

export default function AvatarCanvas({ viseme }) {
  return (
    <div className="w-full h-[500px] bg-gradient-to-b from-indigo-900 to-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <Canvas camera={{ position: [0, 0.5, 5], fov: 25 }}>
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1.5}
        />
        <pointLight position={[-10, -10, -10]} intensity={1} />

        {/* Environment Reflection */}
        <Environment preset="city" />

        {/* The Talking Avatar */}
        <Suspense fallback={null}>
          <Avatar visemeID={viseme} />
        </Suspense>

        {/* Controls (Optional: let user rotate) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
