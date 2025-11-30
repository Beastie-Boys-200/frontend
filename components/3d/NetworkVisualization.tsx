'use client';

import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface NetworkVisualizationProps {
  inputActivity?: 'name' | 'email' | 'password' | 'submit' | null;
}

// Element types
type ElementMode = 'packets' | 'snow' | 'blocks' | 'dna' | 'graph' | 'stars';

// Hook for element mode
const useElementMode = () => {
  const [mode, setMode] = useState<ElementMode>('packets');
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const modes: ElementMode[] = ['packets', 'snow', 'blocks', 'dna', 'graph', 'stars'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % modes.length;
      setMode(modes[currentIndex]);
      // Random speed from 0.5 to 2
      setSpeed(0.5 + Math.random() * 1.5);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return { mode, speed };
};

// Tunnel variants (circles only, different colors)
const tunnelVariants = [
  { segments: 64, color: '#ec4899' }, // pink
  { segments: 64, color: '#a855f7' }, // purple
  { segments: 64, color: '#d946ef' }, // fuchsia
  { segments: 64, color: '#c026d3' }, // magenta
  { segments: 64, color: '#9333ea' }, // indigo
  { segments: 64, color: '#7c3aed' }, // light purple
  { segments: 64, color: '#db2777' }, // dark pink
  { segments: 64, color: '#8b5cf6' }, // lavender
];

// Current line color (global ref for access from TunnelLines)
let currentLineColor = '#a855f7';

// Neon tunnel - waves of identical rings
function NeonTunnel() {
  const ringsRef = useRef<THREE.Group>(null);
  const [currentVariant, setCurrentVariant] = useState(0);
  const variantIndexRef = useRef(0);

  // Change variant every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      variantIndexRef.current = (variantIndexRef.current + 1) % tunnelVariants.length;
      setCurrentVariant(variantIndexRef.current);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const rings = useMemo(() => {
    const count = 50;
    const rings = [];
    for (let i = 0; i < count; i++) {
      rings.push({
        z: -i * 2.5,
        scale: 1 + (i * 0.04),
        variantIndex: 0, // will be updated on respawn
      });
    }
    return rings;
  }, []);

  // Store current variant for each ring
  const ringVariantsRef = useRef<number[]>(new Array(50).fill(0));

  useFrame((state) => {
    if (!ringsRef.current) return;
    const time = state.clock.getElapsedTime();

    ringsRef.current.children.forEach((ring, i) => {
      ring.position.z += 0.15;

      // On respawn - new ring gets current variant
      if (ring.position.z > 5) {
        ring.position.z = -120;
        ringVariantsRef.current[i] = variantIndexRef.current;

        // Update geometry and material
        const variant = tunnelVariants[ringVariantsRef.current[i]];
        const mesh = ring as THREE.Mesh;
        mesh.geometry.dispose();
        mesh.geometry = new THREE.TorusGeometry(12, 0.06, 16, variant.segments);
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.color.set(variant.color);
        material.emissive.set(variant.color);

        // Update line color
        currentLineColor = variant.color;
      }

      const pulse = Math.sin(time * 2 + i * 0.3) * 0.1 + 1;
      ring.scale.setScalar(rings[i].scale * pulse);
      ring.rotation.z += 0.002;
    });
  });

  const initialVariant = tunnelVariants[0];

  return (
    <group ref={ringsRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, ring.z]} rotation={[0, 0, Math.PI / 4 * (i % 2)]}>
          <torusGeometry args={[12, 0.06, 16, initialVariant.segments]} />
          <meshStandardMaterial
            color={initialVariant.color}
            emissive={initialVariant.color}
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// Tunnel lines
function TunnelLines() {
  const linesRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const count = 12;
    const lines = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      lines.push({
        angle,
        x: Math.cos(angle) * 11,
        y: Math.sin(angle) * 11,
      });
    }
    return lines;
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.getElapsedTime();

    linesRef.current.children.forEach((line, i) => {
      const material = (line as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity = Math.sin(time * 3 + i * 0.5) * 0.3 + 0.5;
      // Update line color
      material.color.set(currentLineColor);
    });
  });

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, -60]}>
          <boxGeometry args={[0.05, 0.05, 120]} />
          <meshBasicMaterial color="#ec4899" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Dynamic flying elements
function DynamicElements({ inputActivity }: { inputActivity?: string | null }) {
  const { mode, speed } = useElementMode();
  const groupRef = useRef<THREE.Group>(null);

  // Base data for elements
  const elements = useMemo(() => {
    const count = 40;
    return Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 5;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: -Math.random() * 100,
        baseSpeed: 0.2 + Math.random() * 0.3,
        size: 0.1 + Math.random() * 0.15,
        offset: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const submitBoost = inputActivity === 'submit' ? 2 : 1;

    groupRef.current.children.forEach((el, i) => {
      const data = elements[i];

      // Move forward
      el.position.z += data.baseSpeed * speed * submitBoost;

      // Reset position
      if (el.position.z > 5) {
        el.position.z = -100;
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 5;
        el.position.x = Math.cos(angle) * radius;
        el.position.y = Math.sin(angle) * radius;
      }

      // Different animations depending on mode
      switch (mode) {
        case 'packets':
          el.rotation.x += 0.05 * speed;
          el.rotation.y += 0.03 * speed;
          break;
        case 'snow':
          el.position.x += Math.sin(time * 2 + data.offset) * 0.02;
          el.position.y += Math.cos(time * 2 + data.offset) * 0.02;
          el.rotation.z += 0.01;
          break;
        case 'blocks':
          el.rotation.x += 0.08 * speed;
          el.rotation.y += 0.06 * speed;
          el.rotation.z += 0.04 * speed;
          break;
        case 'dna':
          const dnaAngle = time * 2 + i * 0.3;
          el.position.x = Math.cos(dnaAngle) * (3 + Math.sin(i * 0.5) * 2);
          el.position.y = Math.sin(dnaAngle) * (3 + Math.sin(i * 0.5) * 2);
          break;
        case 'graph':
          el.rotation.x += 0.02;
          el.rotation.y += 0.02;
          // Connection pulsation
          const pulse = Math.sin(time * 3 + i) * 0.3 + 1;
          el.scale.setScalar(pulse);
          break;
        case 'stars':
          // Twinkling
          const twinkle = Math.sin(time * 5 + data.offset) * 0.5 + 0.5;
          el.scale.setScalar(twinkle);
          break;
      }

      // Pulsation on input
      const material = (el as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (inputActivity) {
        material.emissiveIntensity = Math.sin(time * 10 + i) > 0.7 ? 3 : 1.5;
      } else {
        material.emissiveIntensity = 1.5;
      }
    });
  });

  // Render elements depending on mode
  const renderElement = (i: number, data: typeof elements[0]) => {
    const color = i % 2 === 0 ? "#ec4899" : "#a855f7";

    switch (mode) {
      case 'packets':
        return (
          <mesh key={i} position={[data.x, data.y, data.z]}>
            <boxGeometry args={[data.size, data.size, data.size * 2]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
          </mesh>
        );
      case 'snow':
        return (
          <mesh key={i} position={[data.x, data.y, data.z]}>
            <sphereGeometry args={[data.size * 0.5, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ec4899" emissiveIntensity={0.8} transparent opacity={0.8} />
          </mesh>
        );
      case 'blocks':
        return (
          <mesh key={i} position={[data.x, data.y, data.z]}>
            <boxGeometry args={[data.size * 1.5, data.size * 1.5, data.size * 1.5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} wireframe={i % 3 === 0} />
          </mesh>
        );
      case 'dna':
        return (
          <mesh key={i} position={[data.x, data.y, data.z]}>
            <sphereGeometry args={[data.size * 0.8, 12, 12]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#ec4899" : "#00ff88"} emissive={i % 2 === 0 ? "#ec4899" : "#00ff88"} emissiveIntensity={2} />
          </mesh>
        );
      case 'graph':
        return (
          <mesh key={i} position={[data.x, data.y, data.z]}>
            <octahedronGeometry args={[data.size]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
          </mesh>
        );
      case 'stars':
        return (
          <mesh key={i} position={[data.x, data.y, data.z]}>
            <dodecahedronGeometry args={[data.size * 0.6]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffff00" emissiveIntensity={2} />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <group ref={groupRef}>
      {elements.map((data, i) => renderElement(i, data))}
    </group>
  );
}

// Particles in tunnel
function TunnelParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 6;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = -Math.random() * 100;

      if (Math.random() > 0.5) {
        colors[i * 3] = 0.925;
        colors[i * 3 + 1] = 0.282;
        colors[i * 3 + 2] = 0.6;
      } else {
        colors[i * 3] = 0.659;
        colors[i * 3 + 1] = 0.333;
        colors[i * 3 + 2] = 0.969;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      let z = positions.getZ(i);
      z += 0.2;
      if (z > 5) z = -100;
      positions.setZ(i, z);
    }
    positions.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// City with buildings and antennas at the bottom of tunnel
function CityScape() {
  const buildings = useMemo(() => {
    const count = 40; // reduced for performance
    return Array.from({ length: count }, () => {
      const x = (Math.random() - 0.5) * 50;
      const z = -Math.random() * 100;
      const height = 2 + Math.random() * 6;
      const width = 0.8 + Math.random() * 1.2;
      const depth = 0.8 + Math.random() * 1.2;
      const hasAntenna = Math.random() > 0.6;
      const antennaHeight = 0.5 + Math.random() * 1;

      return {
        x,
        y: -15 - height / 2,
        z,
        height,
        width,
        depth,
        hasAntenna,
        antennaHeight,
        color: Math.random() > 0.7 ? '#1a1a2e' : '#0f0f1a',
        windowColor: Math.random() > 0.5 ? '#ec4899' : '#a855f7',
      };
    });
  }, []);

  return (
    <group>
      {buildings.map((building, i) => (
        <group key={i} position={[building.x, building.y, building.z]}>
          {/* Building */}
          <mesh>
            <boxGeometry args={[building.width, building.height, building.depth]} />
            <meshBasicMaterial color={building.color} />
          </mesh>

          {/* Windows - one strip instead of individual */}
          <mesh position={[0, 0, building.depth / 2 + 0.01]}>
            <planeGeometry args={[building.width * 0.3, building.height * 0.8]} />
            <meshBasicMaterial
              color={building.windowColor}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Antenna */}
          {building.hasAntenna && (
            <group position={[0, building.height / 2, 0]}>
              <mesh position={[0, building.antennaHeight / 2, 0]}>
                <boxGeometry args={[0.03, building.antennaHeight, 0.03]} />
                <meshBasicMaterial color="#444444" />
              </mesh>

              {/* Emitter */}
              <mesh position={[0, building.antennaHeight, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial color="#ec4899" />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

// Constellations/graphs outside the tunnel
function ConstellationGraphs() {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const count = 60;
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 10; // outside tunnel (radius 12)
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: -Math.random() * 120,
        size: 0.1 + Math.random() * 0.2,
        speed: 0.1 + Math.random() * 0.15,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      };
    });
  }, []);

  // Connections between nearby nodes
  const connections = useMemo(() => {
    const conns: { from: number; to: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 8 && conns.length < 40) {
          conns.push({ from: i, to: j });
        }
      }
    }
    return conns;
  }, [nodes]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Update node positions
    groupRef.current.children.forEach((child, i) => {
      if (i < nodes.length) {
        const node = nodes[i];
        child.position.z += node.speed;
        if (child.position.z > 5) {
          child.position.z = -120;
        }
        child.rotation.x += node.rotSpeed;
        child.rotation.y += node.rotSpeed * 0.7;

        // Twinkling
        const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 0.8 + Math.sin(time * 2 + i) * 0.4;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((node, i) => (
        <mesh key={`node-${i}`} position={[node.x, node.y, node.z]}>
          <octahedronGeometry args={[node.size]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#ec4899" : i % 3 === 1 ? "#a855f7" : "#7c3aed"}
            emissive={i % 3 === 0 ? "#ec4899" : i % 3 === 1 ? "#a855f7" : "#7c3aed"}
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Connections between nodes */}
      {connections.map((conn, i) => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const midZ = (from.z + to.z) / 2;
        const length = Math.sqrt(
          Math.pow(to.x - from.x, 2) +
          Math.pow(to.y - from.y, 2) +
          Math.pow(to.z - from.z, 2)
        );

        return (
          <mesh
            key={`conn-${i}`}
            position={[midX, midY, midZ]}
            lookAt={new THREE.Vector3(to.x, to.y, to.z)}
          >
            <cylinderGeometry args={[0.01, 0.01, length, 4]} />
            <meshBasicMaterial
              color="#a855f7"
              transparent
              opacity={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Rotating cube with logo
function TelekomLogo() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/telekom-logo.png');
  const { camera, gl } = useThree();

  // State for manual rotation
  const isDragging = useRef(false);
  const manualRotation = useRef({ x: 0, y: 0 });
  const lastMouse = useRef({ x: 0, y: 0 });
  const autoRotationOffset = useRef(0);


    // Mouse handlers for manual rotation
  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      // Check if clicked on cube (center of screen approximately)
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // If click in central area (where cube is)
      if (Math.abs(x) < 0.3 && Math.abs(y) < 0.3) {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - lastMouse.current.x;
      const deltaY = e.clientY - lastMouse.current.y;

      manualRotation.current.y += deltaX * 0.01;
      manualRotation.current.x += deltaY * 0.01;

      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        // Reset rotation - will return to initial position
        manualRotation.current = { x: 0, y: 0 };
        autoRotationOffset.current = 0;
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gl]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    if (isDragging.current) {
      // Manual rotation
      meshRef.current.rotation.y = manualRotation.current.y;
      meshRef.current.rotation.x = manualRotation.current.x;
      meshRef.current.rotation.z = 0;
    } else {
      // Automatic rotation
      // Every 5 seconds - 90° rotation, every 30 seconds - 360°
      const cycle5s = Math.floor(time / 5);
      const progress5s = (time % 5) / 5;

      // Check if this is 30-second cycle (6th in each 30 seconds)
      const isFullRotation = cycle5s % 6 === 5;

      // Base rotation from previous cycles
      const fullRotations = Math.floor(cycle5s / 6);
      const partialRotations = cycle5s % 6;

      let baseRotation = fullRotations * Math.PI * 2 + partialRotations * (Math.PI / 2);

      // Smooth rotation at the beginning of cycle
      let eased = 0;
      if (progress5s < 0.2) {
        eased = Math.pow(progress5s / 0.2, 0.5);
      } else {
        eased = 1;
      }

      // Add current rotation + offset from manual
      if (isFullRotation) {
        meshRef.current.rotation.y = baseRotation + eased * Math.PI * 2 + autoRotationOffset.current;
      } else {
        meshRef.current.rotation.y = baseRotation + eased * (Math.PI / 2) + autoRotationOffset.current;
      }

      // Smoothly return X to tilt from camera
      const targetX = camera.position.y * 0.05;
      manualRotation.current.x += (targetX - manualRotation.current.x) * 0.05;
      meshRef.current.rotation.x = manualRotation.current.x;
      meshRef.current.rotation.z = -camera.position.x * 0.03;
    }
  });

  return (
    <group position={[0, 0, -15]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveIntensity={0.8}
          emissiveMap={texture}
        />
      </mesh>

      {/* Strong glow around cube */}
      <pointLight color="#ec4899" intensity={10} distance={20} decay={2} />
      <pointLight position={[0, 0, 3]} color="#ffffff" intensity={5} distance={15} />
      <pointLight position={[3, 0, 0]} color="#ec4899" intensity={4} distance={12} />
      <pointLight position={[-3, 0, 0]} color="#ec4899" intensity={4} distance={12} />
      <pointLight position={[0, 3, 0]} color="#a855f7" intensity={3} distance={12} />
      <pointLight position={[0, -3, 0]} color="#a855f7" intensity={3} distance={12} />
    </group>
  );
}

// Camera movement with mouse
function CameraMovement() {
  const { camera, gl } = useThree();
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const isInside = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isInside.current) return;

      const rect = canvas.getBoundingClientRect();
      // Normalize mouse position relative to canvas from -1 to 1
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      // Limit movement
      targetX.current = x * 2; // maximum ±2
      targetY.current = -y * 1; // maximum ±1
    };

    const handleMouseEnter = () => {
      isInside.current = true;
    };

    const handleMouseLeave = () => {
      isInside.current = false;
      // Return camera to center
      targetX.current = 0;
      targetY.current = 0;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gl]);

  useFrame(() => {
    // Smooth interpolation to target position
    currentX.current += (targetX.current - currentX.current) * 0.05;
    currentY.current += (targetY.current - currentY.current) * 0.05;

    camera.position.x = currentX.current;
    camera.position.y = currentY.current;

    // Camera always looks at center (at T)
    camera.lookAt(0, 0, -15);
  });

  return null;
}

// Main component
export function NetworkVisualization({ inputActivity }: NetworkVisualizationProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: '#0a0a0a' }}
      >
        <ambientLight intensity={0.2} />

        <CameraMovement />
        <NeonTunnel />
        <TunnelLines />
        <TunnelParticles />
        <DynamicElements inputActivity={inputActivity} />
        <Suspense fallback={null}>
          <TelekomLogo />
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}