// The 3D scene for the full-screen lab. Reads the mutable `sim` object every frame;
// React never re-renders during the animation.
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import RetroConsole from './RetroConsole.jsx'
import GameCartridge, { poseCartridge } from './GameCartridge.jsx'
import CRTScreen from './CRTScreen.jsx'
import { bounceOut, easeInOutCubic, easeOutBack, easeOutCubic, explodedOffset, layoutCamera, PART_IDS, pilePose } from './ExplodedView.js'
import { sfx } from '../lib/sound.js'
import { shadowTexture } from './textures.js'


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

function Rig({ sim }) {
  const { camera, size } = useThree()
  const parts = useRef({})
  const cart = useRef()
  const tv = useRef()
  const shadow = useRef()
  const consoleState = useRef({ btn: 0, led: 0 })
  const screen = useRef({ mode: 'off', bootT: 0, time: 0, glitch: 0, brightness: 0, collapse: 1 })
  const anim = useRef(null) // per-part animation state, created once the meshes exist
  const v = useMemo(() => ({ off: new THREE.Vector3(), pos: new THREE.Vector3(), tgt: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), look: new THREE.Vector3(), cur: null }), [])
  const pointer = useRef({ x: 0, y: 0 })
  const shadowTex = useMemo(() => shadowTexture(), [])
  useEffect(() => () => shadowTex.dispose(), [shadowTex])

  useEffect(() => {
    // nudge the picture down (and right on wide screens) so it clears the heading
    const wide = size.width >= 1024
    camera.setViewOffset(size.width, size.height, wide ? -size.width * 0.09 : 0, -size.height * (wide ? 0.12 : 0.13), size.width, size.height)
    return () => camera.clearViewOffset()
  }, [camera, size.width, size.height])

  useEffect(() => {
    const on = (e) => { pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1 }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [])

  // Start a move of every part from wherever it is now to the pose for `layout`.
  const startLayout = (a, layout, now) => {
    a.layout = layout
    const fast = sim.reduced ? 0.2 : 1
    a.items.forEach((it, i) => {
      it.fromPos.copy(it.group.position); it.fromQuat.copy(it.group.quaternion)
      if (layout === 'pile') {
        pilePose(i, it.seated, it.toPos, it.toQuat)
        it.mode = 'burst'; it.delay = (i % 4) * 0.03 * fast; it.dur = (0.75 + (i % 3) * 0.12) * fast
        it.pop = 1.6 + (i % 5) * 0.45 // how high it is thrown before it falls
      } else if (layout === 'exploded') {
        it.toPos.copy(it.seated).add(explodedOffset(i, v.off)); it.toQuat.identity()
        it.mode = 'smooth'; it.delay = i * 0.05 * fast; it.dur = 0.6 * fast
      } else {
        it.toPos.copy(it.seated); it.toQuat.identity()
        // reverse order: bottom casing first, top casing last
        it.mode = 'snap'; it.delay = (a.items.length - 1 - i) * 0.045 * fast; it.dur = 0.36 * fast
      }
      it.t0 = now; it.done = false
    })
    if (layout === 'pile') sfx.crash()
  }

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const now = state.clock.elapsedTime

    // --- electrical state is animated by LabStage; just read it
    const e = sim.elec
    const cs = consoleState.current
    cs.btn += (e.btn - cs.btn) * Math.min(1, dt * 18)
    cs.led = e.led
    const sc = screen.current
    if (e.mode === 'title' && e.glitch === 0) sc.time += dt
    sc.mode = e.mode; sc.bootT = e.bootT; sc.glitch = e.glitch
    sc.brightness = e.brightness; sc.collapse = e.collapse

    // --- parts
    if (!anim.current && parts.current.topCase) {
      anim.current = {
        layout: 'assembled',
        items: PART_IDS.map((id) => {
          const group = parts.current[id]
          return { group, seated: group.position.clone(), fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(), fromQuat: new THREE.Quaternion(), toQuat: new THREE.Quaternion(), done: true }
        }),
      }
    }
    const a = anim.current
    if (a) {
      if (a.layout !== sim.layout) startLayout(a, sim.layout, now)
      let finished = 0
      a.items.forEach((it, i) => {
        if (it.done) { finished++; return }
        const k = Math.min(1, Math.max(0, (now - it.t0 - it.delay) / it.dur))
        const g = it.group
        if (it.mode === 'burst') {
          // thrown outwards, falls, bounces on the desk
          const h = easeOutCubic(k)
          g.position.x = it.fromPos.x + (it.toPos.x - it.fromPos.x) * h
          g.position.z = it.fromPos.z + (it.toPos.z - it.fromPos.z) * h
          g.position.y = it.fromPos.y + (it.toPos.y - it.fromPos.y) * bounceOut(k) + it.pop * Math.sin(Math.PI * Math.min(1, k * 2.4)) * (1 - k)
          g.quaternion.slerpQuaternions(it.fromQuat, it.toQuat, h)
        } else {
          const h = it.mode === 'snap' ? easeOutBack(k) : easeInOutCubic(k)
          g.position.lerpVectors(it.fromPos, it.toPos, h)
          g.quaternion.slerpQuaternions(it.fromQuat, it.toQuat, Math.min(1, easeOutCubic(k) * 1.15))
        }
        if (k >= 1) {
          it.done = true
          g.position.copy(it.toPos); g.quaternion.copy(it.toQuat)
          if (it.mode === 'snap') (i === 0 ? sfx.lock : i % 2 ? sfx.connect : sfx.click)()
          else if (it.mode === 'burst' ? i % 3 === 0 : i % 2 === 0) sfx.click()
          if (i === 0 && it.mode === 'snap') sim.onAssembled?.()
        }
      })
    }

    poseCartridge(cart.current, e.cart, e.away)
    if (tv.current) { tv.current.position.x = -e.away * 9; tv.current.position.z = -e.away * 3; tv.current.visible = e.away < 0.995 }
    if (shadow.current) shadow.current.material.opacity = sim.layout === 'assembled' ? 0.9 : 0.35

    // --- camera: one view per layout
    const aspect = size.width / size.height
    layoutCamera(sim.layout, aspect, v.pos, v.tgt)
    v.look.subVectors(v.tgt, v.pos)
    const dist = v.look.length()
    v.right.crossVectors(v.look, camera.up).normalize()
    v.up.crossVectors(v.right, v.look).normalize()
    // gentle pointer parallax
    v.pos.addScaledVector(v.right, pointer.current.x * dist * 0.025).addScaledVector(v.up, -pointer.current.y * dist * 0.018)
    if (!v.cur) v.cur = { pos: v.pos.clone(), tgt: v.tgt.clone() }
    const k = 1 - Math.exp(-dt * 4.5)
    v.cur.pos.lerp(v.pos, k); v.cur.tgt.lerp(v.tgt, k)
    camera.position.copy(v.cur.pos)
    camera.lookAt(v.cur.tgt)
  })

  return (
    <>
      <RetroConsole partsRef={parts} stateRef={consoleState} />
      <GameCartridge innerRef={cart} />
      <CRTScreen screenRef={screen} groupRef={tv} />
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0.1]}>
        <planeGeometry args={[6.6, 5.2]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>
    </>
  )
}

export default function LabScene({ sim, active = true }) {
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{ fov: 34, near: 0.1, far: 120, position: [1.0, 3.7, 11.4] }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
    >
      <StudioLights />
      <Rig sim={sim} />
    </Canvas>
  )
}
