// Small floating console for the portfolio section card. Renders only while visible.
import { Component, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import RetroConsole from './RetroConsole.jsx'
import GameCartridge, { poseCartridge } from './GameCartridge.jsx'
import { StudioLights } from './LabScene.jsx'

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function Model() {
  const group = useRef()
  const cart = useRef()
  const state = useRef({ btn: 1, led: 1 })
  const pointer = useRef({ x: 0, y: 0 })
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const on = (e) => { pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1 }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [])

  useFrame((s, dt) => {
    poseCartridge(cart.current, 1)
    const g = group.current
    const t = reduced ? 0 : s.clock.elapsedTime
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 4)
    g.rotation.y += (-0.5 + pointer.current.x * 0.5 + Math.sin(t * 0.4) * 0.12 - g.rotation.y) * k
    g.rotation.x += (0.12 + pointer.current.y * 0.18 - g.rotation.x) * k
    g.position.y = -0.55 + Math.sin(t * 1.1) * 0.08
  })

  return (
    <group ref={group} rotation={[0.12, -0.5, 0]}>
      <RetroConsole stateRef={state} />
      <GameCartridge innerRef={cart} />
    </group>
  )
}

export default function ConsolePreview({ active, fallbackText }) {
  const fallback = <p className="absolute inset-0 grid place-items-center px-6 text-center font-mono text-xs text-[#7F8EA3]">{fallbackText}</p>
  return (
    <Boundary fallback={fallback}>
      <Canvas
        className="!absolute inset-0"
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{ fov: 32, position: [0, 4.2, 10.8] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl, camera }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; camera.lookAt(0, 0.35, 0) }}
        aria-hidden="true"
      >
        <StudioLights />
        <Model />
      </Canvas>
    </Boundary>
  )
}
