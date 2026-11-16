// BK-8: an original cartridge console. Each of the 11 parts is its own group,
// registered in `partsRef.current[id]`, so the parent can move them independently.
// Units: console is 4.0 wide (x), 0.9 tall (y), 3.0 deep (z). Front faces +z.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { grainTexture, labelTexture, pcbTexture } from './textures.js'

// ---------- geometry helpers ----------
function roundedRect(target, w, d, r, cx = 0, cy = 0) {
  const x = cx - w / 2, y = cy - d / 2
  target.moveTo(x + r, y)
  target.lineTo(x + w - r, y); target.quadraticCurveTo(x + w, y, x + w, y + r)
  target.lineTo(x + w, y + d - r); target.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
  target.lineTo(x + r, y + d); target.quadraticCurveTo(x, y + d, x, y + d - r)
  target.lineTo(x, y + r); target.quadraticCurveTo(x, y, x + r, y)
  return target
}

// Flat plate in the XZ plane with optional rectangular holes ({x, z, w, d, r}).
function plate(w, d, r, thick, holes = [], bevel = 0.012) {
  const shape = roundedRect(new THREE.Shape(), w, d, r)
  for (const h of holes) shape.holes.push(roundedRect(new THREE.Path(), h.w, h.d, h.r ?? 0.02, h.x, -h.z))
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thick, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 6,
  })
  g.rotateX(-Math.PI / 2) // shape y -> world -z, extrusion -> world +y
  return g
}

// Vertical wall ring (outer rounded rect minus inner), `height` tall.
function ring(w, d, r, wall, height) {
  const shape = roundedRect(new THREE.Shape(), w, d, r)
  shape.holes.push(roundedRect(new THREE.Path(), w - wall * 2, d - wall * 2, Math.max(0.01, r - wall)))
  const g = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 6 })
  g.rotateX(-Math.PI / 2)
  return g
}

// Many boxes merged into one geometry / one draw call. Items: [x, y, z, w, h, d]
function boxes(list) {
  const geos = list.map(([x, y, z, w, h, d]) => new THREE.BoxGeometry(w, h, d).translate(x, y, z))
  const merged = mergeGeometries(geos)
  geos.forEach((g) => g.dispose())
  return merged
}

function cylinders(list, seg = 14) {
  const geos = list.map(([x, y, z, r, h]) => new THREE.CylinderGeometry(r, r, h, seg).translate(x, y, z))
  const merged = mergeGeometries(geos)
  geos.forEach((g) => g.dispose())
  return merged
}

function range(n) { return Array.from({ length: n }, (_, i) => i) }

// ---------- shared resources (created once per console instance) ----------
function useResources() {
  const res = useMemo(() => {
    const grain = grainTexture()
    const M = (o) => new THREE.MeshStandardMaterial(o)
    const mat = {
      caseTop: M({ color: '#8f9299', roughness: 0.78, bumpMap: grain, bumpScale: 0.6 }),
      caseBottom: M({ color: '#34373e', roughness: 0.82, bumpMap: grain, bumpScale: 0.6 }),
      dark: M({ color: '#16181c', roughness: 0.7 }),
      black: M({ color: '#0b0c0e', roughness: 0.55 }),
      void: new THREE.MeshBasicMaterial({ color: '#050506' }),
      stripeBlue: M({ color: '#4d9ecf', roughness: 0.6 }),
      stripeOrange: M({ color: '#e0935a', roughness: 0.6 }),
      btnPower: M({ color: '#c4502f', roughness: 0.55 }),
      btnReset: M({ color: '#5b5f68', roughness: 0.55 }),
      metal: M({ color: '#c3c9d1', metalness: 1, roughness: 0.32 }),
      metalDull: M({ color: '#9aa1ab', metalness: 0.9, roughness: 0.5 }),
      gold: M({ color: '#d7a644', metalness: 1, roughness: 0.3 }),
      chip: M({ color: '#1a1b1f', roughness: 0.45 }),
      pcb: M({ color: '#ffffff', roughness: 0.55, map: pcbTexture() }),
      pcbPlain: M({ color: '#1d5f3f', roughness: 0.6 }),
      capBlue: M({ color: '#27467e', roughness: 0.4 }),
      capOrange: M({ color: '#c8742f', roughness: 0.45 }),
      ceramic: M({ color: '#c9a36a', roughness: 0.6 }),
      rubber: M({ color: '#0e0f11', roughness: 0.95 }),
      led: M({ color: '#3a0b0b', emissive: '#ff3b2f', emissiveIntensity: 0, roughness: 0.3 }),
      tin: M({ color: '#b9bec6', metalness: 1, roughness: 0.42, side: THREE.DoubleSide }),
    }
    const lbl = (lines, o) => new THREE.MeshStandardMaterial({ map: labelTexture(lines, o), roughness: 0.5 })
    const label = {
      cpu: lbl(['BK-8502', 'CPU  8922'], { w: 512, h: 150, notch: true }),
      gpu: lbl(['BK-PPU', 'VIDEO  8922'], { w: 512, h: 150, notch: true }),
      ram1: lbl(['BK6116  2K', 'SRAM'], { w: 384, h: 140, size: 30, notch: true }),
      ram2: lbl(['BK6116  2K', 'VRAM'], { w: 384, h: 140, size: 30, notch: true }),
      rf: lbl(['RF MODULATOR', 'CH3 / CH4'], { w: 512, h: 256, bg: '#aeb4bc', fg: '#22252a', size: 36 }),
      badge: lbl(['BK-8', 'ENTERTAINMENT COMPUTER'], { w: 640, h: 150, bg: '#16181c', fg: '#d5dae1', size: 40 }),
      power: lbl(['POWER'], { w: 256, h: 64, bg: '#8f9299', fg: '#1c1e22', size: 34, weight: 700 }),
      reset: lbl(['RESET'], { w: 256, h: 64, bg: '#8f9299', fg: '#1c1e22', size: 34, weight: 700 }),
    }

    const dip = (len, pins) => {
      const pitch = (len - 0.12) / (pins / 2 - 1)
      const legs = []
      for (let i = 0; i < pins / 2; i++) {
        const x = -len / 2 + 0.06 + i * pitch
        for (const s of [-1, 1]) {
          legs.push([x, 0.045, s * 0.2, 0.022, 0.012, 0.06]) // shoulder
          legs.push([x, 0.005, s * 0.225, 0.016, 0.09, 0.012]) // leg
        }
      }
      return boxes(legs)
    }

    const geo = {
      // casing
      topPlate: plate(4, 3, 0.2, 0.07, [
        { x: 0, z: -0.35, w: 2.25, d: 0.42, r: 0.04 }, // cartridge slot
        { x: -1.35, z: 0.95, w: 0.4, d: 0.24, r: 0.03 }, // power
        { x: -0.8, z: 0.95, w: 0.4, d: 0.24, r: 0.03 }, // reset
        { x: -0.35, z: 0.95, w: 0.1, d: 0.1, r: 0.04 }, // LED
      ], 0.02),
      topSkirt: ring(4, 3, 0.2, 0.07, 0.36),
      slotLip: ring(2.45, 0.62, 0.06, 0.1, 0.05),
      vents: boxes(range(9).map((i) => [-1.2 + i * 0.3, 0, -1.08, 0.2, 0.012, 0.42])),
      ribs: boxes(range(5).map((i) => [0, 0, 0.1 + i * 0.09, 3.6, 0.014, 0.03])),
      bottomFloor: plate(4, 3, 0.2, 0.06, [], 0.012),
      bottomWalls: ring(4, 3, 0.2, 0.07, 0.42),
      posts: cylinders([[-1.6, 0.11, -1.1, 0.09, 0.1], [1.6, 0.11, -1.1, 0.09, 0.1], [-1.6, 0.11, 1.1, 0.09, 0.1], [1.6, 0.11, 1.1, 0.09, 0.1]]),
      feet: cylinders([[-1.55, -0.02, -1.05, 0.16, 0.05], [1.55, -0.02, -1.05, 0.16, 0.05], [-1.55, -0.02, 1.05, 0.16, 0.05], [1.55, -0.02, 1.05, 0.16, 0.05]], 20),
      portHoles: boxes([[0.5, 0.33, 1.502, 0.58, 0.3, 0.01], [1.3, 0.33, 1.502, 0.58, 0.3, 0.01]]),
      // heat shield: perforated plate with a cut-out for the cartridge connector
      shield: plate(3.4, 2.4, 0.06, 0.02, [
        { x: 0, z: -0.35, w: 2.5, d: 0.5, r: 0.03 },
        ...range(3).flatMap((row) => range(9).map((i) => ({ x: -1.36 + i * 0.34, z: 0.25 + row * 0.3, w: 0.22, d: 0.07, r: 0.03 }))),
        ...range(7).map((i) => ({ x: -1.02 + i * 0.34, z: -0.9, w: 0.22, d: 0.07, r: 0.03 })),
      ], 0),
      shieldRim: ring(3.4, 2.4, 0.06, 0.02, 0.1),
      shieldScrews: cylinders([[-1.6, 0.03, -1.1, 0.06, 0.03], [1.6, 0.03, -1.1, 0.06, 0.03], [-1.6, 0.03, 1.1, 0.06, 0.03], [1.6, 0.03, 1.1, 0.06, 0.03]], 6),
      // cartridge connector
      connPins: boxes(range(30).flatMap((i) => [
        [-1.02 + i * 0.0703, 0.2, 0.05, 0.03, 0.34, 0.012],
        [-1.02 + i * 0.0703, 0.2, -0.05, 0.03, 0.34, 0.012],
      ])),
      // chips
      dip40: dip(1.3, 40),
      dip24: dip(0.8, 24),
      // electronic components
      caps: cylinders([[0.25, 0.14, -0.95, 0.085, 0.26], [0.55, 0.13, -0.95, 0.07, 0.24], [-0.35, 0.11, -0.98, 0.06, 0.2], [0.85, 0.11, -0.8, 0.055, 0.2], [1.55, 0.11, -0.45, 0.06, 0.2]], 18),
      capTops: cylinders([[0.25, 0.272, -0.95, 0.08, 0.004], [0.55, 0.252, -0.95, 0.066, 0.004], [-0.35, 0.212, -0.98, 0.056, 0.004], [0.85, 0.212, -0.8, 0.051, 0.004], [1.55, 0.212, -0.45, 0.056, 0.004]], 18),
      resistors: mergeGeometries(range(7).map((i) =>
        new THREE.CylinderGeometry(0.022, 0.022, 0.13, 8).rotateZ(Math.PI / 2).translate(0.75 + (i % 4) * 0.22, 0.035, 0.82 + Math.floor(i / 4) * 0.12))),
      ceramics: cylinders([[-0.2, 0.06, 0.02, 0.045, 0.02], [0.02, 0.06, 0.02, 0.045, 0.02], [1.58, 0.06, 0.75, 0.045, 0.02], [-1.55, 0.06, 0.0, 0.045, 0.02]], 12),
      heatsink: boxes([[1.3, 0.14, -1.08, 0.5, 0.26, 0.03], ...range(6).map((i) => [1.08 + i * 0.088, 0.14, -1.0, 0.02, 0.26, 0.14])]),
      portPins: cylinders(range(7).map((i) => [(i % 4) * 0.09 - (i < 4 ? 0.135 : 0.09), 0, i < 4 ? -0.04 : 0.04, 0.018, 0.06]), 8).rotateX(Math.PI / 2),
    }
    return { mat, label, geo }
  }, [])

  useEffect(() => () => {
    Object.values(res.geo).forEach((g) => g.dispose())
    Object.values(res.mat).forEach((m) => { m.map?.dispose(); m.bumpMap?.dispose(); m.dispose() })
    Object.values(res.label).forEach((m) => { m.map?.dispose(); m.dispose() })
  }, [res])
  return res
}

function Chip({ res, len, geo, label, position }) {
  return (
    <group position={position}>
      <mesh material={res.mat.chip} position={[0, 0.07, 0]}><boxGeometry args={[len, 0.1, 0.36]} /></mesh>
      <mesh material={label} position={[0, 0.1205, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[len * 0.94, 0.3]} /></mesh>
      <mesh geometry={geo} material={res.mat.metal} />
    </group>
  )
}

/**
 * @param partsRef  ref whose .current receives { [partId]: Group }
 * @param stateRef  ref to { btn: 0..1 (power button travel), led: 0..1 }
 * @param onPower   click handler for the physical power button
 */
export default function RetroConsole({ partsRef, stateRef, onPower, interactive = false }) {
  const res = useResources()
  const { mat, geo, label } = res
  const powerBtn = useRef()
  const local = useRef({})
  const reg = (id) => (el) => {
    local.current[id] = el
    if (partsRef) { partsRef.current ??= {}; partsRef.current[id] = el }
  }

  useFrame(() => {
    const s = stateRef?.current
    if (!s) return
    if (powerBtn.current) powerBtn.current.position.y = 0.2 - s.btn * 0.045
    mat.led.emissiveIntensity = s.led * 3.2
  })

  const hover = (v) => () => { if (interactive) document.body.style.cursor = v ? 'pointer' : '' }
  useEffect(() => () => { document.body.style.cursor = '' }, [])

  return (
    <group>
      {/* 11 — bottom casing */}
      <group ref={reg('bottomCase')}>
        <mesh geometry={geo.bottomFloor} material={mat.caseBottom} />
        <mesh geometry={geo.bottomWalls} material={mat.caseBottom} position={[0, 0.06, 0]} />
        <mesh geometry={geo.posts} material={mat.caseBottom} />
        <mesh geometry={geo.feet} material={mat.rubber} />
        <mesh geometry={geo.portHoles} material={mat.void} />
      </group>

      {/* 5 — motherboard */}
      <group ref={reg('motherboard')} position={[0, 0.16, 0]}>
        <mesh material={[mat.pcbPlain, mat.pcbPlain, mat.pcb, mat.pcbPlain, mat.pcbPlain, mat.pcbPlain]}>
          <boxGeometry args={[3.5, 0.04, 2.5]} />
        </mesh>
      </group>

      {/* 6 — CPU */}
      <group ref={reg('cpu')} position={[0, 0.18, 0]}>
        <Chip res={res} len={1.3} geo={geo.dip40} label={label.cpu} position={[-0.8, 0, 0.35]} />
      </group>

      {/* 7 — GPU */}
      <group ref={reg('gpu')} position={[0, 0.18, 0]}>
        <Chip res={res} len={1.3} geo={geo.dip40} label={label.gpu} position={[0.75, 0, 0.35]} />
      </group>

      {/* 8 — RAM */}
      <group ref={reg('ram')} position={[0, 0.18, 0]}>
        <Chip res={res} len={0.8} geo={geo.dip24} label={label.ram1} position={[-0.9, 0, 0.9]} />
        <Chip res={res} len={0.8} geo={geo.dip24} label={label.ram2} position={[0.1, 0, 0.9]} />
      </group>

      {/* 9 — electronic components */}
      <group ref={reg('components')} position={[0, 0.18, 0]}>
        <mesh geometry={geo.caps} material={mat.capBlue} />
        <mesh geometry={geo.capTops} material={mat.metalDull} />
        <mesh geometry={geo.resistors} material={mat.ceramic} />
        <mesh geometry={geo.ceramics} material={mat.capOrange} />
        {/* RF modulator can */}
        <mesh material={mat.tin} position={[-1.2, 0.13, -0.95]}><boxGeometry args={[0.9, 0.26, 0.46]} /></mesh>
        <mesh material={label.rf} position={[-1.2, 0.2605, -0.95]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.8, 0.38]} /></mesh>
        <mesh material={mat.gold} position={[-1.2, 0.13, -1.21]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.1, 14]} /></mesh>
        {/* regulator + finned heatsink */}
        <mesh geometry={geo.heatsink} material={mat.metalDull} />
        <mesh material={mat.chip} position={[1.3, 0.14, -0.93]}><boxGeometry args={[0.2, 0.26, 0.07]} /></mesh>
        {/* crystal */}
        <mesh material={mat.metal} position={[1.58, 0.05, 0.3]}><boxGeometry args={[0.1, 0.1, 0.26]} /></mesh>
      </group>

      {/* 10 — controller ports */}
      <group ref={reg('ports')} position={[0, 0.18, 0]}>
        {[0.5, 1.3].map((x) => (
          <group key={x} position={[x, 0.15, 1.3]}>
            <mesh material={mat.black}><boxGeometry args={[0.52, 0.26, 0.42]} /></mesh>
            <mesh material={mat.void} position={[0, 0, 0.212]}><planeGeometry args={[0.42, 0.18]} /></mesh>
            <mesh geometry={geo.portPins} material={mat.gold} position={[0, 0, 0.2]} />
            <mesh material={mat.metalDull} position={[0, -0.12, -0.12]}><boxGeometry args={[0.44, 0.02, 0.2]} /></mesh>
          </group>
        ))}
      </group>

      {/* 4 — heat shield */}
      <group ref={reg('heatShield')} position={[0, 0.48, 0]}>
        <mesh geometry={geo.shield} material={mat.tin} />
        <mesh geometry={geo.shieldRim} material={mat.tin} position={[0, -0.1, 0]} />
        <mesh geometry={geo.shieldScrews} material={mat.gold} />
      </group>

      {/* 3 — cartridge slot & connector */}
      <group ref={reg('cartSlot')} position={[0, 0.2, -0.35]}>
        <mesh material={mat.black} position={[0, 0.12, 0.1]}><boxGeometry args={[2.3, 0.24, 0.07]} /></mesh>
        <mesh material={mat.black} position={[0, 0.12, -0.1]}><boxGeometry args={[2.3, 0.24, 0.07]} /></mesh>
        <mesh material={mat.black} position={[-1.13, 0.2, 0]}><boxGeometry args={[0.08, 0.4, 0.27]} /></mesh>
        <mesh material={mat.black} position={[1.13, 0.2, 0]}><boxGeometry args={[0.08, 0.4, 0.27]} /></mesh>
        <mesh material={mat.black} position={[0, 0.02, 0]}><boxGeometry args={[2.3, 0.04, 0.27]} /></mesh>
        <mesh geometry={geo.connPins} material={mat.gold} />
      </group>

      {/* 2 — power & reset button assembly */}
      <group ref={reg('buttons')} position={[0, 0.7, 0.95]}>
        <mesh material={mat.pcbPlain} position={[-0.95, 0, 0]}><boxGeometry args={[1.5, 0.03, 0.42]} /></mesh>
        {/* switch bodies */}
        <mesh material={mat.metalDull} position={[-1.35, 0.06, 0]}><boxGeometry args={[0.3, 0.1, 0.2]} /></mesh>
        <mesh material={mat.metalDull} position={[-0.8, 0.06, 0]}><boxGeometry args={[0.3, 0.1, 0.2]} /></mesh>
        {/* caps */}
        <mesh
          ref={powerBtn}
          material={mat.btnPower}
          position={[-1.35, 0.2, 0]}
          onClick={interactive ? (e) => { e.stopPropagation(); onPower?.() } : undefined}
          onPointerOver={hover(true)}
          onPointerOut={hover(false)}
        >
          <boxGeometry args={[0.36, 0.14, 0.2]} />
        </mesh>
        <mesh material={mat.btnReset} position={[-0.8, 0.2, 0]}><boxGeometry args={[0.36, 0.14, 0.2]} /></mesh>
        {/* LED + ribbon header */}
        <mesh material={mat.led} position={[-0.35, 0.12, 0]}><cylinderGeometry args={[0.035, 0.035, 0.2, 12]} /></mesh>
        <mesh material={mat.black} position={[-1.6, 0.04, 0]}><boxGeometry args={[0.1, 0.06, 0.3]} /></mesh>
      </group>

      {/* 1 — top casing */}
      <group ref={reg('topCase')} position={[0, 0.48, 0]}>
        <mesh geometry={geo.topSkirt} material={mat.caseTop} />
        <mesh geometry={geo.topPlate} material={mat.caseTop} position={[0, 0.35, 0]} />
        <mesh geometry={geo.slotLip} material={mat.dark} position={[0, 0.42, -0.35]} />
        <mesh geometry={geo.vents} material={mat.black} position={[0, 0.438, 0]} />
        <mesh geometry={geo.ribs} material={mat.dark} position={[0, 0.438, 0]} />
        {/* front control band with colour stripes and badge */}
        <mesh material={mat.dark} position={[0.75, 0.438, 0.95]}><boxGeometry args={[1.9, 0.012, 0.36]} /></mesh>
        <mesh material={label.badge} position={[0.75, 0.4455, 0.95]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.5, 0.3]} /></mesh>
        <mesh material={mat.stripeBlue} position={[0, 0.2, 1.502]}><boxGeometry args={[3.6, 0.035, 0.01]} /></mesh>
        <mesh material={mat.stripeOrange} position={[0, 0.14, 1.502]}><boxGeometry args={[3.6, 0.035, 0.01]} /></mesh>
        <mesh material={label.power} position={[-1.35, 0.4415, 1.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.36, 0.09]} /></mesh>
        <mesh material={label.reset} position={[-0.8, 0.4415, 1.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.36, 0.09]} /></mesh>
      </group>
    </group>
  )
}
