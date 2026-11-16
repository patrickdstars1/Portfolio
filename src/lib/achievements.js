// Achievements: the whole site is a small game, and exploring it unlocks these.
// Progress is kept in localStorage. Components call unlock(id), mark(flag),
// visit(section) or addCoins(n); the UI subscribes with useSyncExternalStore.
import { isEmbed } from './scroll.js'

// `icon` is a key of the pixel icons in lib/pixelScene.js.
export const ACHIEVEMENTS = [
  { id: 'start', icon: 'flag', title: { en: 'Press Start', th: 'Press Start' }, desc: { en: 'Scroll past the first screen.', th: 'เลื่อนผ่านหน้าแรก' } },
  { id: 'explorer', icon: 'map', title: { en: 'World Map', th: 'World Map' }, desc: { en: 'Visit every section of the site.', th: 'เข้าชมครบทุก section ของเว็บ' } },
  { id: 'coin1', icon: 'coin', title: { en: 'First Coin', th: 'เหรียญแรก' }, desc: { en: 'Collect a coin with Byte.', th: 'ให้ Byte เก็บเหรียญได้ 1 เหรียญ' } },
  { id: 'coin10', icon: 'coin', title: { en: 'Pocket Change', th: 'เศษเหรียญ' }, desc: { en: 'Collect 10 coins.', th: 'เก็บเหรียญครบ 10 เหรียญ' } },
  { id: 'coin30', icon: 'coin', title: { en: 'Coin Hoarder', th: 'นักสะสมเหรียญ' }, desc: { en: 'Collect 30 coins.', th: 'เก็บเหรียญครบ 30 เหรียญ' } },
  { id: 'highjump', icon: 'star', title: { en: 'Hold to Fly', th: 'กดค้างแล้วลอย' }, desc: { en: 'Hold the jump for a full-height leap.', th: 'กดกระโดดค้างจนโดดสูงสุด' } },
  { id: 'friends', icon: 'heart', title: { en: 'Animal Friend', th: 'เพื่อนรักสัตว์' }, desc: { en: 'Poke the slime and the flying critter.', th: 'แกล้งสไลม์ และกดตัวที่บินอยู่บนฟ้า' } },
  { id: 'break', icon: 'chip', title: { en: 'Curious Hands', th: 'มือซน' }, desc: { en: 'Take the BK-8 console apart.', th: 'ถอดชิ้นส่วนเครื่อง BK-8' } },
  { id: 'inspect', icon: 'cartridge', title: { en: 'Inspector', th: 'ช่างสังเกต' }, desc: { en: 'Line up the parts of the console.', th: 'เปิดดูชิ้นส่วนของเครื่องเกม' } },
  { id: 'fix', icon: 'gamepad', title: { en: 'Made to Last', th: 'Made to Last' }, desc: { en: 'Put the console back together.', th: 'ประกอบเครื่องเกมกลับเข้าที่' } },
  { id: 'tvoff', icon: 'terminal', title: { en: 'Go Outside', th: 'ออกไปข้างนอกบ้าง' }, desc: { en: 'Switch the TV off.', th: 'ปิดทีวี' } },
  { id: 'bilingual', icon: 'chat', title: { en: 'Bilingual', th: 'สองภาษา' }, desc: { en: 'Read the site in both languages.', th: 'อ่านเว็บทั้งสองภาษา' } },
  { id: 'daynight', icon: 'star', title: { en: 'Day and Night', th: 'กลางวันกลางคืน' }, desc: { en: 'See the world in both themes.', th: 'ดูโลกนี้ทั้งสองธีม' } },
  { id: 'resume', icon: 'floppy', title: { en: 'Save Point', th: 'Save Point' }, desc: { en: 'Download the resume.', th: 'ดาวน์โหลด Resume' } },
  { id: 'hello', icon: 'mail', title: { en: 'Say Hello', th: 'ทักทาย' }, desc: { en: 'Copy the email address or start an email.', th: 'คัดลอกอีเมล หรือเริ่มเขียนอีเมล' } },
  { id: 'konami', icon: 'code', secret: true, title: { en: 'Old School', th: 'Old School' }, desc: { en: 'Enter a certain famous code.', th: 'ใส่รหัสลับในตำนาน' } },
  { id: 'complete', icon: 'trophy', title: { en: '100%', th: '100%' }, desc: { en: 'Unlock everything else.', th: 'ปลดล็อกครบทุกอย่าง' } },
]

const SECTIONS = ['about', 'skills', 'experience', 'projects', 'lab', 'contact']
const KEY = 'bankdev:achievements'
const empty = () => ({ unlocked: {}, coins: 0, flags: {} })

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    if (raw && typeof raw === 'object') return { ...empty(), ...raw }
  } catch {}
  return empty()
}

let state = typeof window === 'undefined' ? empty() : load()
const subs = new Set()
const toastSubs = new Set()
// The copy of the site running on the TV shares storage but stays quiet.
const off = () => isEmbed()

function commit(next) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  subs.forEach((fn) => fn())
}

export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn) }
export const getState = () => state
export const onUnlock = (fn) => { toastSubs.add(fn); return () => toastSubs.delete(fn) }

export function unlock(id) {
  if (off() || state.unlocked[id] || !ACHIEVEMENTS.some((a) => a.id === id)) return
  commit({ ...state, unlocked: { ...state.unlocked, [id]: Date.now() } })
  toastSubs.forEach((fn) => fn(id))
  // the last one comes for free once the rest are done
  if (id !== 'complete' && ACHIEVEMENTS.every((a) => a.id === 'complete' || state.unlocked[a.id])) unlock('complete')
}

// Small facts that combine into achievements.
export function mark(flag) {
  if (off() || state.flags[flag]) return
  commit({ ...state, flags: { ...state.flags, [flag]: true } })
  const f = state.flags
  if (f.slime && f.flyer) unlock('friends')
  if (f.lang_en && f.lang_th) unlock('bilingual')
  if (f.theme_dark && f.theme_light) unlock('daynight')
  if (SECTIONS.every((s) => f[`visit_${s}`])) unlock('explorer')
}

export function visit(section) {
  if (!SECTIONS.includes(section)) return
  unlock('start')
  mark(`visit_${section}`)
}

export function addCoins(n) {
  if (off()) return
  commit({ ...state, coins: state.coins + n })
  if (state.coins >= 1) unlock('coin1')
  if (state.coins >= 10) unlock('coin10')
  if (state.coins >= 30) unlock('coin30')
}

export function resetAchievements() { commit(empty()) }
