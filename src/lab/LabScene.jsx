// The 3D scene for the full-screen lab. Reads the mutable `sim` object every frame;
// React never re-renders during the animation.
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import RetroConsole from './RetroConsole.jsx'
import GameCartridge, { poseCartridge } from './GameCartridge.jsx'
import CRTScreen from './CRTScreen.jsx'
import { easeInOutCubic, easeOutBack, easeOutCubic, explodedOffset, layoutCamera, PART_IDS } from './ExplodedView.js'
import { createPhysics } from './physics.js'
import { sfx } from '../lib/sound.js'


function StudioLights({ shadowSize = 2048 }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 12, 7]} intensity={2.2} color="#fff4e8" castShadow
        shadow-mapSize={[shadowSize, shadowSize]} shadow-bias={-0.0004} shadow-normalBias={0.03}
        shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-camera-near={1} shadow-camera-far={40}
      />
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
    const consoleState = useRef({ btn: 0, led: 0 })
  const screen = useRef({ mode: 'off', bootT: 0, time: 0, glitch: 0, brightness: 0, collapse: 1 })
  const anim = useRef(null) // per-part animation state, created once the meshes exist
  const v = useMemo(() => ({ off: new THREE.Vector3(), pos: new THREE.Vector3(), tgt: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), look: new THREE.Vector3(), cur: null }), [])
  const pointer = useRef({ x: 0, y: 0 })
  const physics = useRef(null)
  const lastHit = useRef(0)
  const scene = useThree((st) => st.scene)

  // every mesh casts and receives shadows, so parts visibly sit on top of each other
  useEffect(() => {
    scene.traverse((o) => { if (o.isMesh && !o.userData.noShadow) { o.castShadow = true; o.receiveShadow = true } })
  }, [scene])

  useEffect(() => {
    const on = (e) => { pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1 }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [])

  // Start a move of every part from wherever it is now to the pose for `layout`.
  const startLayout = (a, layout, now) => {
    a.layout = layout
    if (layout === 'pile') { physics.current.burst(); sfx.crash() } else physics.current.stop()
    const fast = sim.reduced ? 0.2 : 1
    a.items.forEach((it, i) => {
      it.fromPos.copy(it.group.position); it.fromQuat.copy(it.group.quaternion)
      if (layout === 'pile') {
        it.done = true // physics takes over
        return
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
    if (a && !physics.current) {
      physics.current = createPhysics(PART_IDS, a.items.map((it) => it.group), () => {
        const t = performance.now()
        if (t - lastHit.current > 70) { lastHit.current = t; sfx.click() }
      })
    }
    if (a) {
      if (a.layout !== sim.layout) startLayout(a, sim.layout, now)
      let finished = 0
      a.items.forEach((it, i) => {
        if (it.done) { finished++; return }
        const k = Math.min(1, Math.max(0, (now - it.t0 - it.delay) / it.dur))
        const g = it.group
        {
          const h = it.mode === 'snap' ? easeOutBack(k) : easeInOutCubic(k)
          g.position.lerpVectors(it.fromPos, it.toPos, h)
          g.quaternion.slerpQuaternions(it.fromQuat, it.toQuat, Math.min(1, easeOutCubic(k) * 1.15))
        }
        if (k >= 1) {
          it.done = true
          g.position.copy(it.toPos); g.quaternion.copy(it.toQuat)
          if (it.mode === 'snap') (i === 0 ? sfx.lock : i % 2 ? sfx.connect : sfx.click)()
          else if (i % 2 === 0) sfx.click()
          if (i === 0 && it.mode === 'snap') sim.onAssembled?.()
        }
      })
    }

    physics.current?.step(dt)

    poseCartridge(cart.current, e.cart, e.away)
    if (tv.current) { tv.current.position.x = -e.away * 9; tv.current.position.z = -e.away * 3; tv.current.visible = e.away < 0.995 }

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
      {/* invisible desk that only shows the shadows falling on it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow userData={{ noShadow: true }}>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial transparent opacity={0.42} />
      </mesh>
    </>
  )
}

export default function LabScene({ sim, active = true }) {
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
  return (
    <Canvas
      shadows
      style={{ pointerEvents: 'none' }} // clicks go to the page and to the site on the TV
      frameloop={active ? 'always' : 'never'}
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{ fov: 34, near: 0.1, far: 120, position: [1.0, 3.7, 11.4] }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
    >
      <StudioLights shadowSize={mobile ? 1024 : 2048} />
      <Rig sim={sim} />
    </Canvas>
  )
}
