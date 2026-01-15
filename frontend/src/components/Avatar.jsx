/* src/components/Avatar.jsx */
import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const visemeMapping = {
  0: "viseme_sil",
  1: "viseme_aa",
  2: "viseme_aa",
  3: "viseme_O",
  4: "viseme_E",
  5: "viseme_RR",
  6: "viseme_I",
  7: "viseme_U",
  8: "viseme_O",
  9: "viseme_aa",
  10: "viseme_O",
  11: "viseme_I",
  12: "viseme_aa",
  13: "viseme_RR",
  14: "viseme_nn",
  15: "viseme_SS",
  16: "viseme_CH",
  17: "viseme_TH",
  18: "viseme_FF",
  19: "viseme_DD",
  20: "viseme_kk",
  21: "viseme_PP",
};

export default function Avatar({ visemeID }) {
  const { scene } = useGLTF("/rpm-avatar-vr-1.glb");
  // ✅ FIX: Use an array to store ALL animated parts (Head, Teeth, Beard)
  const morphMeshesRef = useRef([]);

  useEffect(() => {
    const meshes = [];
    scene.traverse((child) => {
      // Find ANY mesh that has morph targets (Head, Teeth, etc.)
      if (child.isMesh && child.morphTargetDictionary) {
        meshes.push(child);

        // Optimize material (optional)
        if (child.material) {
          child.material.roughness = Math.max(
            0.1,
            child.material.roughness || 0.5
          );
        }
      }
    });
    morphMeshesRef.current = meshes;
  }, [scene]);

  useFrame(() => {
    const meshes = morphMeshesRef.current;
    if (meshes.length === 0) return;

    // Loop through EVERY mesh (Head, Teeth, etc.)
    meshes.forEach((mesh) => {
      Object.keys(visemeMapping).forEach((key) => {
        const targetName = visemeMapping[key];
        const index = mesh.morphTargetDictionary[targetName];

        if (index === undefined) return;

        let newValue = mesh.morphTargetInfluences[index];

        if (visemeID !== null && visemeMapping[visemeID] === targetName) {
          // Open fast
          newValue = THREE.MathUtils.lerp(newValue, 1, 0.4);
        } else {
          // Close slow
          newValue = THREE.MathUtils.lerp(newValue, 0, 0.1);
        }

        // Snap to zero to clean up values
        if (newValue < 0.001) newValue = 0;
        if (newValue > 0.999) newValue = 1;

        mesh.morphTargetInfluences[index] = newValue;
      });
    });
  });

  return (
    <group dispose={null} position={[0, -1.6, 0]} scale={1.4}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/rpm-avatar-vr-1.glb");
