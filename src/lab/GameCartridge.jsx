// Removable PIXEL QUEST cartridge. Upright pose: label faces +z, edge connector at the bottom.
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { coverTexture } from './textures.js'

const REST = { pos: new THREE.Vector3(3.2, 0.15, 0.7), rot: new THREE.Euler(-Math.PI / 2, 0, -0.35) }
const HOVER = new THREE.Vector3(0, 2.75, -0.35)
const SEATED = new THREE.Vector3(0, 1.22, -0.35)
const qRest = new THREE.Quaternion().setFromEuler(REST.rot)
const qUp = new THREE.Quaternion()
const ease = (t) => t * t * (3 - 2 * t)

// k: 0 = lying on the desk, 1 = seated in the slot. Used for insert and eject alike.
export function poseCartridge(group, k, away = 0) {
  if (!group) return
  if (k < 0.6) {
    const t = ease(k / 0.6)
    group.position.lerpVectors(REST.pos, HOVER, t)
    group.position.y += Math.sin(t * Math.PI) * 0.5
    group.quaternion.slerpQuaternions(qRest, qUp, ease(Math.min(1, t * 1.25)))
  } else {
    const t = ease((k - 0.6) / 0.4)
    group.position.lerpVectors(HOVER, SEATED, t)
    group.quaternion.copy(qUp)
  }
  group.position.x += away * 9
  group.visible = away < 0.995
}

export default function GameCartridge({ innerRef }) {
  const res = useMemo(() => {
    const body = new THREE.MeshStandardMaterial({ color: '#3d4047', roughness: 0.7 })
    const dark = new THREE.MeshStandardMaterial({ color: '#202227', roughness: 0.7 })
    const gold = new THREE.MeshStandardMaterial({ color: '#d7a644', metalness: 1, roughness: 0.3 })
    const pcb = new THREE.MeshStandardMaterial({ color: '#1d5f3f', roughness: 0.6 })
    const label = new THREE.MeshStandardMaterial({ map: coverTexture(true), roughness: 0.45 })
    return { body, dark, gold, pcb, label }
  }, [])
  useEffect(() => () => Object.values(res).forEach((m) => { m.map?.dispose(); m.dispose() }), [res])

  return (
    <group ref={innerRef}>
      <mesh material={res.body}><boxGeometry args={[2.0, 1.5, 0.26]} /></mesh>
      {/* grip ridges along the top */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} material={res.dark} position={[0, 0.66 - i * 0.07, 0.131]}><boxGeometry args={[1.7, 0.03, 0.012]} /></mesh>
      ))}
      <mesh material={res.dark} position={[0, 0.1, 0.131]}><boxGeometry args={[1.56, 0.86, 0.006]} /></mesh>
      <mesh material={res.label} position={[0, 0.1, 0.136]}><planeGeometry args={[1.5, 0.8]} /></mesh>
      {/* edge connector */}
      <mesh material={res.pcb} position={[0, -0.8, 0]}><boxGeometry args={[1.8, 0.14, 0.05]} /></mesh>
      <mesh material={res.gold} position={[0, -0.82, 0.026]}><boxGeometry args={[1.7, 0.09, 0.004]} /></mesh>
      <mesh material={res.gold} position={[0, -0.82, -0.026]}><boxGeometry args={[1.7, 0.09, 0.004]} /></mesh>
    </group>
  )
}
