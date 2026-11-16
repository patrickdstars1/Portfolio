// Rigid-body physics for the "take apart" pile (cannon-es).
// Each part is a compound of boxes, so parts land on and lean against each
// other instead of passing through. Boxes are given in the part group's local
// space as [cx, cy, cz, halfX, halfY, halfZ]; `c` is the centre of mass.
import * as CANNON from 'cannon-es'
import { rng } from '../lib/pixel.js'

const wallsOf = (y, hy) => [[-1.965, y, 0, 0.035, hy, 1.5], [1.965, y, 0, 0.035, hy, 1.5], [0, y, 1.465, 2, hy, 0.035], [0, y, -1.465, 2, hy, 0.035]]
const COLLIDERS = {
  topCase: { c: [0, 0.2, 0], mass: 3, boxes: [[0, 0.385, 0, 2, 0.035, 1.5], ...wallsOf(0.18, 0.18)] },
  buttons: { c: [-0.95, 0.1, 0], mass: 0.5, boxes: [[-0.95, 0.1, 0, 0.8, 0.16, 0.21]] },
  cartSlot: { c: [0, 0.2, 0], mass: 0.8, boxes: [[0, 0.2, 0, 1.17, 0.2, 0.135]] },
  heatShield: { c: [0, -0.04, 0], mass: 1.2, boxes: [[0, -0.04, 0, 1.7, 0.06, 1.2]] },
  motherboard: { c: [0, 0, 0], mass: 1.5, boxes: [[0, 0, 0, 1.75, 0.04, 1.25]] },
  cpu: { c: [-0.8, 0.05, 0.35], mass: 0.3, boxes: [[-0.8, 0.05, 0.35, 0.65, 0.08, 0.23]] },
  gpu: { c: [0.75, 0.05, 0.35], mass: 0.3, boxes: [[0.75, 0.05, 0.35, 0.65, 0.08, 0.23]] },
  ram: { c: [-0.4, 0.05, 0.9], mass: 0.4, boxes: [[-0.9, 0.05, 0.9, 0.4, 0.08, 0.23], [0.1, 0.05, 0.9, 0.4, 0.08, 0.23]] },
  components: { c: [0.1, 0.1, -0.6], mass: 1, boxes: [[-1.2, 0.13, -0.95, 0.45, 0.13, 0.23], [1.3, 0.14, -1.03, 0.25, 0.13, 0.1], [0.45, 0.13, -0.93, 0.45, 0.13, 0.12], [1.08, 0.035, 0.88, 0.4, 0.03, 0.12]] },
  ports: { c: [0.9, 0.15, 1.3], mass: 0.6, boxes: [[0.5, 0.15, 1.3, 0.26, 0.13, 0.21], [1.3, 0.15, 1.3, 0.26, 0.13, 0.21]] },
  bottomCase: { c: [0, 0.2, 0], mass: 3, boxes: [[0, 0.03, 0, 2, 0.03, 1.5], ...wallsOf(0.27, 0.21)] },
}

const STATIC = 1, PART = 2
const FLOOR_Y = -0.05

export function createPhysics(partIds, groups, onHit) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -26, 0) })
  world.allowSleep = true
  world.solver.iterations = 14
  world.defaultContactMaterial.friction = 0.45
  world.defaultContactMaterial.restitution = 0.18

  const fixed = (hx, hy, hz, x, y, z, ry = 0) => {
    const b = new CANNON.Body({ mass: 0, collisionFilterGroup: STATIC })
    b.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)))
    b.position.set(x, y, z); b.quaternion.setFromEuler(0, ry, 0)
    world.addBody(b)
  }
  fixed(30, 1, 30, 0, FLOOR_Y - 1, 0) // desk
  fixed(2.0, 1.5, 1.35, -3.7, 1.62, -2.0, 0.3) // television (matches TV_POS / TV_ROT in CRTScreen.jsx)
  fixed(1.0, 0.13, 0.75, 3.2, 0.15, 0.7, -0.35) // cartridge lying on the desk
  // invisible walls keep the pile inside the picture
  fixed(0.5, 6, 8, -6.2, 6, 2); fixed(0.5, 6, 8, 6.2, 6, 2)
  fixed(8, 6, 0.5, 0, 6, 5.6); fixed(8, 6, 0.5, 0, 6, -1.1)

  const parts = partIds.map((id, i) => {
    const def = COLLIDERS[id]
    const body = new CANNON.Body({ mass: def.mass, collisionFilterGroup: PART, collisionFilterMask: STATIC, linearDamping: 0.08, angularDamping: 0.35 })
    for (const [cx, cy, cz, hx, hy, hz] of def.boxes) {
      body.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)), new CANNON.Vec3(cx - def.c[0], cy - def.c[1], cz - def.c[2]))
    }
    body.sleepSpeedLimit = 0.25; body.sleepTimeLimit = 0.4
    body.addEventListener('collide', (e) => {
      const v = Math.abs(e.contact.getImpactVelocityAlongNormal())
      if (v > 3) onHit?.(v)
    })
    return { body, group: groups[i], c: new CANNON.Vec3(...def.c), launchAt: 0, live: false, solid: false }
  })

  const off = new CANNON.Vec3()
  const state = { active: false, t: 0 }

  return {
    get active() { return state.active },

    // Throw every part out of the console. Parts start out nested inside each
    // other, so they only collide with the desk until they have separated.
    burst() {
      this.stop()
      const r = rng(Math.floor(performance.now()))
      state.active = true; state.t = 0
      parts.forEach((p, i) => { p.launchAt = i * 0.03; p.live = false; p.solid = false; p.r = [r(), r(), r(), r(), r(), r()] })
    },

    stop() {
      parts.forEach((p) => { if (p.live) world.removeBody(p.body); p.live = false })
      state.active = false
    },

    step(dt) {
      if (!state.active) return
      state.t += dt
      parts.forEach((p, i) => {
        if (!p.live && state.t >= p.launchAt) {
          const { body, group } = p
          body.quaternion.copy(group.quaternion)
          body.quaternion.vmult(p.c, off)
          body.position.set(group.position.x + off.x, group.position.y + off.y, group.position.z + off.z)
          // outward from the console centre, biased toward the viewer, upper layers thrown higher
          const [a, b, c, d, e, f] = p.r
          const ang = Math.atan2(body.position.z + 0.4, body.position.x) + (a - 0.5) * 2.4
          const speed = 2.2 + b * 3.4
          body.velocity.set(Math.cos(ang) * speed, 7 + c * 5 + (10 - i) * 0.35, Math.sin(ang) * speed * 0.8 + 2.2)
          body.angularVelocity.set((d - 0.5) * 9, (e - 0.5) * 6, (f - 0.5) * 9)
          body.collisionFilterMask = STATIC
          body.wakeUp()
          world.addBody(body)
          p.live = true
        }
        if (p.live && !p.solid && state.t >= p.launchAt + 0.32) { p.body.collisionFilterMask = STATIC | PART; p.solid = true }
      })
      world.step(1 / 60, dt, 4)
      for (const p of parts) {
        if (!p.live) continue
        const { body, group } = p
        group.quaternion.copy(body.quaternion)
        body.quaternion.vmult(p.c, off)
        group.position.set(body.position.x - off.x, body.position.y - off.y, body.position.z - off.z)
      }
    },
  }
}
