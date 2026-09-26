"use client";

import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

export type ShaderVariant = "hero" | "band";

/**
 * Pearl "light through enamel" field. Camera and mesh follow the library's
 * pastel `cottonCandy` preset; colors are porcelain, pearl and ice.
 * Loaded lazily by ShaderSlot only.
 */
export default function AmbientShader({ variant }: { variant: ShaderVariant }) {
  return (
    <ShaderGradientCanvas
      pixelDensity={variant === "hero" ? 1 : 0.75}
      fov={45}
      pointerEvents="none"
      style={{ position: "absolute", inset: 0 }}
    >
      <ShaderGradient
        control="props"
        type="waterPlane"
        animate="on"
        uTime={0.2}
        uSpeed={0.12}
        uStrength={3}
        uDensity={1}
        uFrequency={5.5}
        uAmplitude={0}
        color1="#ece7de"
        color2="#f7f6f2"
        color3="#cfdfe8"
        reflection={0.1}
        brightness={1.2}
        lightType="3d"
        grain="off"
        cDistance={2.9}
        cPolarAngle={120}
        cAzimuthAngle={180}
        cameraZoom={1}
        positionX={0}
        positionY={1.8}
        positionZ={0}
        rotationX={0}
        rotationY={0}
        rotationZ={-90}
      />
    </ShaderGradientCanvas>
  );
}
