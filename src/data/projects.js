// Editable project data.
// Set `url` / `repo` to a real link to show the buttons; leave null to show "link coming soon".
// Set `image` to a file in /public (e.g. './projects/fleet.png') to replace the abstract preview.
// `image` can also be { dark, light } to show a screenshot that matches the site's current theme.
// Never put placeholder URLs here.
// `links` is a list of { label: {en, th}, url } for projects with more than one public link.
// `demo: true` marks a link that is only a demo: the card gets a DEMO badge and a note.
export const projects = [
  {
    id: 'ksher',
    featured: true,
    name: { en: 'Ksher Thailand website', th: 'เว็บไซต์ Ksher Thailand' },
    description: {
      en: 'A full website for Ksher Thailand, a payment solutions provider, built on Wix with custom code.',
      th: 'เว็บไซต์ฉบับเต็มของ Ksher Thailand ผู้ให้บริการระบบรับชำระเงิน พัฒนาบน Wix ร่วมกับการเขียนโค้ดเพิ่มเติม',
    },
    tech: ['Wix', 'Custom code'],
    preview: 'web',
    image: './projects/ksher.jpg',
    url: 'https://ksherthailand.com/',
    repo: null,
  },
  {
    id: 'aipages',
    name: { en: 'AI clip pages with auto-posting', th: 'เพจ AI และระบบโพสต์คลิปอัตโนมัติ' },
    description: {
      en: 'AI-themed pages whose short clips are published automatically to TikTok, YouTube, Instagram and Facebook. Every post goes out through each platform’s API, with no manual uploading. The pages are live and have an audience.',
      th: 'เพจ AI ที่โพสต์คลิปสั้นลง TikTok, YouTube, Instagram และ Facebook อัตโนมัติ ทุกโพสต์ส่งผ่าน API ของแต่ละแพลตฟอร์มโดยไม่ต้องอัปโหลดเอง เพจใช้งานจริงและมีผู้ชมติดตาม',
    },
    tech: ['AI', 'Automation', 'APIs', 'TikTok', 'YouTube', 'Instagram', 'Facebook'],
    preview: 'social',
    image: null,
    url: null,
    repo: null,
    // Several public links: one button each. Names are placeholders until the pages are named.
    links: [
      { label: { en: 'Facebook page 1', th: 'เพจ Facebook 1' }, url: 'https://www.facebook.com/profile.php?id=61595622583527&sk=reels_tab' },
      { label: { en: 'Facebook page 2', th: 'เพจ Facebook 2' }, url: 'https://www.facebook.com/profile.php?id=61595514497855' },
    ],
  },
  {
    id: 'fleet',
    name: { en: 'Fleet Management System', th: 'Fleet Management System' },
    description: {
      en: 'A fleet management platform for keeping track of vehicles, mileage, fuel records and maintenance information in one place.',
      th: 'แพลตฟอร์มจัดการยานพาหนะ สำหรับเก็บข้อมูลรถ ระยะทาง บันทึกการเติมน้ำมัน และการซ่อมบำรุงไว้ในที่เดียว',
    },
    tech: ['React', 'Vite', 'FastAPI', 'PostgreSQL', 'SQLAlchemy'],
    preview: 'fleet',
    image: null,
    url: null,
    repo: null,
  },
  {
    id: 'olympus',
    name: { en: 'Olympus Trader app', th: 'Olympus Trader app' },
    // The public demo runs on simulated data (the demo itself says so). Technologies are not listed until confirmed.
    description: {
      en: 'A trading dashboard that tracks account equity, drawdown limits, open trades, the trade log and analytics, in Thai and English.',
      th: 'แดชบอร์ดสำหรับการเทรด แสดง equity ของพอร์ต ขีดจำกัด drawdown รายการเทรดที่เปิดอยู่ บันทึกการเทรด และ analytics ใช้ได้ทั้งภาษาไทยและอังกฤษ',
    },
    tech: [],
    preview: 'trading',
    demo: true, // the link is a demo with simulated data; the real app cannot be shown
    image: { dark: './projects/olympus-dark.jpg', light: './projects/olympus-light.jpg' }, // shown to match the site's theme
    url: 'https://patrickdstars1.github.io/olympus-demo/',
    repo: null,
  },
  {
    id: 'web',
    name: { en: 'Websites for clients', th: 'เว็บไซต์สำหรับลูกค้า' },
    description: {
      en: 'Responsive interfaces, landing pages and business websites built through freelance work.',
      th: 'งาน responsive interface, landing page และเว็บไซต์ธุรกิจจากงาน freelance',
    },
    tech: ['React', 'Next.js', 'JavaScript', 'HTML', 'CSS', 'Wix'],
    preview: 'web',
    image: null,
    url: null,
    repo: null,
  },
  {
    id: 'trading',
    name: { en: 'Software & trading experiments', th: 'งานทดลองด้านซอฟต์แวร์และการเทรด' },
    description: {
      en: 'Experimental projects around backend development, trading-related automation and API integrations.',
      th: 'โปรเจกต์ทดลองเกี่ยวกับ backend, automation ด้านการเทรด และการเชื่อมต่อ API',
    },
    tech: ['Python', 'PHP', 'APIs'],
    preview: 'trading',
    image: null,
    url: null,
    repo: null,
  },
]
