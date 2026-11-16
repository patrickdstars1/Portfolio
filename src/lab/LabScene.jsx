// The 3D scene for the full-screen lab. Reads the mutable `sim` object every frame;
// React never re-renders during the animation.
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import RetroConsole from './RetroConsole.jsx'
import GameCartridge, { poseCartridge } from './GameCartridge.jsx'
import CRTScreen from './CRTScreen.jsx'
import { buildCameraKeys, PART_IDS, partOffset, powerAt, sampleCamera } from './ExplodedView.js'
import { shadowTexture } from './textures.js'

const BG = '#05070c'

export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 7, 5]} intensity={2.1} color="#fff4e8" />
      <pointLight position={[-6, 3.5, 4]} intensity={30} color="#75cfff" distance={18} />
      <pointLight position={[5, 2.5, -5]} intensity={26} color="#ffb47a" distance={16} />
      {/* procedural environment: reflections for metal parts without downloading an HDR */}
      <Environment resolution={128} frames={1}>
        <color attach="background" args={['#0a0d14']} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#75cfff" position={[-7, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffb47a" position={[7, 2, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffffff" position={[0, 2, 8]} rotation={[0, Math.PI, 0]} scale={[10, 3, 1]} />
      </Environment>
    </>
  )
}

function Rig({ sim, onPower }) {
  const { camera, size } = useThree()
  const parts = useRef({})
  const cart = useRef()
  const tv = useRef()
  const shadow = useRef()
  const consoleState = useRef({ btn: 0, led: 0 })
  const screen = useRef({ mode: 'off', bootT: 0, time: 0, glitch: 0, brightness: 0, collapse: 1 })
  const base = useRef(null)
  const keys = useMemo(() => buildCameraKeys(size.width / size.height), [size.width, size.height])
  const v = useMemo(() => ({ off: new THREE.Vector3(), pos: new THREE.Vector3(), tgt: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), look: new THREE.Vector3(), cur: null }), [])
  const pointer = useRef({ x: 0, y: 0 })
  const shadowTex = useMemo(() => shadowTexture(), [])
  useEffect(() => () => shadowTex.dispose(), [shadowTex])

  useEffect(() => {
    const on = (e) => { pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1 }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const p = sim.powered ? sim.p : 0
    const time = state.clock.elapsedTime

    // --- electrical state: scripted intro until powered, then derived from scroll
    let st
    if (sim.powered) st = powerAt(p, time)
    else {
      const i = sim.intro
      st = { on: i.btn > 0.5, led: i.led, brightness: i.brightness, collapse: i.collapse, mode: i.mode, bootT: i.bootT, frozen: false, glitch: 0, cart: i.cart, away: 0 }
    }
    const cs = consoleState.current
    cs.btn += ((st.on ? 1 : 0) - cs.btn) * Math.min(1, dt * 18)
    cs.led = st.led
    const sc = screen.current
    if (!st.frozen && st.mode === 'title') sc.time += dt
    sc.mode = st.mode; sc.bootT = st.bootT; sc.glitch = st.glitch
    sc.brightness = st.brightness; sc.collapse = st.collapse

    // --- parts: remember seated positions once, then offset from them
    if (!base.current && parts.current.topCase) {
      base.current = PART_IDS.map((id) => parts.current[id].position.clone())
    }
    if (base.current) {
      PART_IDS.forEach((id, i) => {
        parts.current[id].position.copy(base.current[i]).add(partOffset(i, p, v.off))
      })
    }
    poseCartridge(cart.current, st.cart, st.away)
    if (tv.current) { tv.current.position.x = -st.away * 9; tv.current.position.z = -st.away * 3; tv.current.visible = st.away < 0.995 }
    if (shadow.current) shadow.current.material.opacity = 0.9 - st.away * 0.5

    // --- camera
    const shift = sampleCamera(keys, p, v.pos, v.tgt)
    const wide = size.width / size.height > 1.05
    v.look.subVectors(v.tgt, v.pos)
    const dist = v.look.length()
    v.right.crossVectors(v.look, camera.up).normalize()
    v.up.crossVectors(v.right, v.look).normalize()
    // keep the part clear of the info panel: left on wide screens, bottom on tall ones
    if (wide) { v.pos.addScaledVector(v.right, -shift * dist * 0.17); v.tgt.addScaledVector(v.right, -shift * dist * 0.17) }
    else { v.pos.addScaledVector(v.up, -shift * dist * 0.2); v.tgt.addScaledVector(v.up, -shift * dist * 0.2) }
    // gentle pointer parallax
    v.pos.addScaledVector(v.right, pointer.current.x * dist * 0.025).addScaledVector(v.up, -pointer.current.y * dist * 0.018)
    if (!v.cur) v.cur = { pos: v.pos.clone(), tgt: v.tgt.clone() }
    const k = 1 - Math.exp(-dt * 5)
    v.cur.pos.lerp(v.pos, k); v.cur.tgt.lerp(v.tgt, k)
    camera.position.copy(v.cur.pos)
    camera.lookAt(v.cur.tgt)
  })

  return (
    <>
      <RetroConsole partsRef={parts} stateRef={consoleState} onPower={onPower} interactive />
      <GameCartridge innerRef={cart} />
      <CRTScreen screenRef={screen} groupRef={tv} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <circleGeometry args={[40, 48]} />
        <meshStandardMaterial color="#0c1018" roughness={0.92} />
      </mesh>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0.1]}>
        <planeGeometry args={[6.6, 5.2]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>
    </>
  )
}

export default function LabScene({ sim, onPower }) {
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{ fov: 34, near: 0.1, far: 120, position: [1.0, 3.7, 11.4] }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 16, 42]} />
      <StudioLights />
      <Rig sim={sim} onPower={onPower} />
    </Canvas>
  )
}
