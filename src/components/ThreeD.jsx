import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";

function Model({ path }) {
  const { scene } = useGLTF(path);
  const ref = useRef();

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.3;
  });

  return <primitive ref={ref} object={scene} dispose={null} />;
}

useGLTF.preload("/models/Harry.glb");

export default function ModelViewer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!ready) return null;

  return (
    <div className="w-full h-full">
      <Canvas
        gl={{ 
          alpha: true, 
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        style={{ background: "transparent" }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Stage environment={null} intensity={0.6}>
            <Model path="/models/Harry.glb" />
          </Stage>
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
