'use client'

import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Sphere, Text, Environment, Stars } from '@react-three/drei'
import { Mesh, TextureLoader } from 'three'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Planet component with rotation and glow effects
function Planet() {
  const meshRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  
  // Create a custom texture for the planet
  const planetTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!
    
    // Create gradient background
    const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512)
    gradient.addColorStop(0, '#8B5CF6') // Purple center
    gradient.addColorStop(0.3, '#A855F7') // Light purple
    gradient.addColorStop(0.6, '#C084FC') // Pink-purple
    gradient.addColorStop(0.8, '#E879F9') // Pink
    gradient.addColorStop(1, '#F472B6') // Light pink
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 1024)
    
    // Add some tech patterns
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.3
    
    // Draw circuit-like patterns
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * 1024, Math.random() * 1024)
      ctx.lineTo(Math.random() * 1024, Math.random() * 1024)
      ctx.stroke()
    }
    
    // Add glowing dots
    ctx.fillStyle = '#FFFFFF'
    ctx.globalAlpha = 0.8
    for (let i = 0; i < 50; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 3 + 1, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return new THREE.CanvasTexture(canvas)
  }, [])
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
      meshRef.current.rotation.x += delta * 0.05
    }
  })
  
  return (
    <group>
      {/* Main planet sphere */}
      <Sphere
        ref={meshRef}
        args={[2, 64, 64]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial
          map={planetTexture}
          emissive="#8B5CF6"
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      {/* Glow effect */}
      <Sphere args={[2.2, 32, 32]}>
        <meshBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Outer glow ring */}
      <Sphere args={[2.5, 16, 16]}>
        <meshBasicMaterial
          color="#E879F9"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  )
}

// Floating particles around the planet
function Particles() {
  const points = useRef<THREE.Points>(null!)
  
  const particles = useMemo(() => {
    const positions = new Float32Array(1000 * 3)
    for (let i = 0; i < 1000; i++) {
      const radius = 3 + Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.cos(phi)
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    return positions
  }, [])
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8B5CF6"
        size={0.02}
        transparent
        opacity={0.6}
      />
    </points>
  )
}

// Main Planet3D component
export function Planet3D() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8B5CF6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#E879F9" />
        
        {/* Environment */}
        <Environment preset="night" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* 3D Objects */}
        <Planet />
        <Particles />
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={12}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central title */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            MOCA NETWORK
          </h1>
          <p className="text-xl text-purple-300 font-light">
            Proof of Dev Portal
          </p>
        </motion.div>
        
        {/* Glow effect overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-purple-900/20 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

