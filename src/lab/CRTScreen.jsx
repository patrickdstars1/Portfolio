// CRT television that plays PIXEL QUEST, plus the physical game box beside it.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { drawGame, GAME_H, GAME_W } from './pixelQuest.js'
import { coverTexture } from './textures.js'

// Where the television stands (also used by the physics colliders).
export const TV_POS = [-3.7, 0, -2.0]
export const TV_ROT = 0.3

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float brightness; // 0..1.2
  uniform float collapse;   // 0 = full picture, 1 = collapsed to a line/dot
  uniform float time;
  varying vec2 vUv;

  void main() {
    // barrel distortion: the picture bulges like curved glass
    vec2 c = vUv - 0.5;
    vec2 uv = 0.5 + c * (1.0 + 0.16 * dot(c, c));
    vec3 col = vec3(0.0);
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);

    // power-off collapse: squeeze vertically, then horizontally
    float sy = max(0.004, 1.0 - smoothstep(0.0, 0.7, collapse));
    float sx = max(0.004, 1.0 - smoothstep(0.6, 1.0, collapse));
    vec2 suv = vec2((uv.x - 0.5) / sx + 0.5, (uv.y - 0.5) / sy + 0.5);
    float pic = inside * step(0.0, suv.x) * step(suv.x, 1.0) * step(0.0, suv.y) * step(suv.y, 1.0);

    // slight chromatic offset + phosphor scanlines
    float off = 0.0012;
    col.r = texture2D(map, suv + vec2(off, 0.0)).r;
    col.g = texture2D(map, suv).g;
    col.b = texture2D(map, suv - vec2(off, 0.0)).b;
    float scan = 0.78 + 0.22 * sin(suv.y * ${GAME_H}.0 * 6.28318);
    float mask = 0.92 + 0.08 * sin(suv.x * ${GAME_W}.0 * 6.28318);
    float flicker = 0.97 + 0.03 * sin(time * 110.0);
    float roll = 1.0 + 0.05 * smoothstep(0.92, 1.0, fract(suv.y * 0.6 - time * 0.12));
    col *= scan * mask * flicker * roll * pic;
    // collapsed picture concentrates its energy into a bright line
    col += pic * vec3(0.9, 0.95, 1.0) * smoothstep(0.35, 1.0, collapse) * (1.0 - smoothstep(0.97, 1.0, collapse));
    col *= brightness;

    // vignette + faint glass glow so the tube never looks like a flat sticker
    float vig = smoothstep(0.75, 0.25, length(c * vec2(1.0, 1.1)));
    col *= mix(0.55, 1.0, vig);
    col += vec3(0.012, 0.016, 0.022) * inside;
    col += vec3(0.05, 0.06, 0.07) * smoothstep(0.55, 0.0, length(vUv - vec2(0.24, 0.8))) * 0.5;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

/**
 * @param screenRef ref to { mode, bootT, time, glitch, brightness, collapse } updated by the parent each frame
 */
// The portfolio itself, running inside the TV. It is the real site in an
// iframe (embed mode: no nested 3D), so it scrolls and works like the page.
const SITE_W = 640
const SITE_H = 500
const siteUrl = () => `${window.location.pathname}?embed=tv`

export default function CRTScreen({ screenRef, groupRef }) {
  const [showSite, setShowSite] = useState(false)
  const siteOn = useRef(false)
  const glow = useRef()
  const tvLed = useRef()
  const frame = useRef(0)

  const res = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = GAME_W; canvas.height = GAME_H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    map.magFilter = THREE.NearestFilter; map.minFilter = THREE.NearestFilter; map.generateMipmaps = false
    const screen = new THREE.ShaderMaterial({
      uniforms: { map: { value: map }, brightness: { value: 0 }, collapse: { value: 1 }, time: { value: 0 } },
      vertexShader, fragmentShader, toneMapped: false,
    })
    // bulged tube face
    const tube = new THREE.PlaneGeometry(2.56, 2.0, 24, 18)
    const pos = tube.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / 1.28, y = pos.getY(i) / 1.0
      pos.setZ(i, 0.1 * (1 - x * x) * (1 - y * y))
    }
    tube.computeVertexNormals()
    const M = (o) => new THREE.MeshStandardMaterial(o)
    return {
      ctx, map, screen, tube,
      shell: M({ color: '#2b2d33', roughness: 0.7 }),
      bezel: M({ color: '#141518', roughness: 0.6 }),
      knob: M({ color: '#b9bec6', metalness: 0.9, roughness: 0.35 }),
      led: M({ color: '#1a0f08', emissive: '#ffb47a', emissiveIntensity: 0 }),
      boxFront: M({ map: coverTexture(false), roughness: 0.5 }),
      boxSide: M({ color: '#0B1030', roughness: 0.6 }),
      boxEdge: M({ color: '#F4F7FC', roughness: 0.6 }),
    }
  }, [])

  useEffect(() => () => {
    res.map.dispose(); res.tube.dispose(); res.boxFront.map.dispose()
    ;['screen', 'shell', 'bezel', 'knob', 'led', 'boxFront', 'boxSide', 'boxEdge'].forEach((k) => res[k].dispose())
  }, [res])

  useFrame((state) => {
    const s = screenRef.current
    // redraw the game at ~30 fps; that is plenty for 8-bit animation
    if (frame.current++ % 2 === 0 && (s.mode !== 'off' || res.lastMode !== 'off')) {
      drawGame(res.ctx, s)
      res.map.needsUpdate = true
      res.lastMode = s.mode
    }
    const u = res.screen.uniforms
    u.brightness.value = s.brightness
    u.collapse.value = s.collapse
    u.time.value = state.clock.elapsedTime
    if (glow.current) glow.current.intensity = s.brightness * (1 - s.collapse) * 5
    res.led.emissiveIntensity = s.brightness > 0.02 ? 2.5 : 0
    // swap the boot animation for the live site once the "game" has started
    const on = s.mode === 'title' && s.glitch === 0 && s.collapse < 0.02 && s.brightness > 0.5
    if (on !== siteOn.current) { siteOn.current = on; setShowSite(on) }
  })

  return (
    <group ref={groupRef}>
      {/* television */}
      <group position={TV_POS} rotation={[0, TV_ROT, 0]}>
        <RoundedBox args={[4.0, 3.0, 2.7]} radius={0.16} smoothness={3} position={[0, 1.62, 0]} material={res.shell} />
        <mesh material={res.shell} position={[0, 0.07, 0]}><boxGeometry args={[3.4, 0.14, 2.2]} /></mesh>
        {/* dark front bezel with the tube recessed into it */}
        <mesh material={res.bezel} position={[-0.42, 1.66, 1.355]}><boxGeometry args={[2.9, 2.4, 0.03]} /></mesh>
        <mesh geometry={res.tube} material={res.screen} position={[-0.42, 1.66, 1.372]} />
        {showSite && (
          <Html
            transform
            occlude="blending"
            position={[-0.42, 1.66, 1.48]}
            distanceFactor={(2.5 / SITE_W) * 400}
            style={{ width: SITE_W, height: SITE_H, pointerEvents: 'auto' }}
          >
            <div className="crt-site" style={{ width: SITE_W, height: SITE_H }}>
              <iframe src={siteUrl()} title="BANK.DEV running on the BK-8" width={SITE_W} height={SITE_H} />
            </div>
          </Html>
        )}
        {/* control panel */}
        <mesh material={res.bezel} position={[1.5, 1.66, 1.355]}><boxGeometry args={[0.72, 2.4, 0.03]} /></mesh>
        {[2.35, 1.85].map((y) => (
          <mesh key={y} material={res.knob} position={[1.5, y, 1.42]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.16, 0.18, 0.12, 24]} /></mesh>
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} material={res.shell} position={[1.5, 1.35 - i * 0.09, 1.372]}><boxGeometry args={[0.5, 0.03, 0.01]} /></mesh>
        ))}
        <mesh ref={tvLed} material={res.led} position={[1.3, 0.6, 1.375]}><boxGeometry args={[0.07, 0.04, 0.01]} /></mesh>
        <pointLight ref={glow} color="#9fd6ff" intensity={0} distance={9} decay={1.6} position={[-0.42, 1.6, 2.6]} />
      </group>

      {/* game box, leaning beside the TV */}
      <group position={[1.9, 1.06, -2.6]} rotation={[-0.09, -0.3, 0]}>
        <mesh material={[res.boxSide, res.boxEdge, res.boxSide, res.boxSide, res.boxFront, res.boxSide]}>
          <boxGeometry args={[1.5, 2.1, 0.32]} />
        </mesh>
      </group>
    </group>
  )
}
