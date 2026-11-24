// Editable project data.
// Set `url` / `repo` to a real link to show the buttons; leave null to show "link coming soon".
// Set `image` to a file in /public (e.g. './projects/fleet.png') to replace the abstract preview.
// `image` can also be { dark, light } to show a screenshot that matches the site's current theme.
// Only add a project once there is something real to show (a live link, demo or screenshot).
// Never put placeholder URLs here.
// `links` is a list of { label: {en, th}, url } for projects with more than one public link.
// `details` ({ title, steps[] }) adds a numbered "how it works" box to the card.
// `demo: true` marks a link that is only a demo: the card gets a DEMO badge and a note
// (`note: { en, th }` replaces the default note, which says the real app cannot be shown).
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
      en: 'Two AI-themed pages, Abyss Files and Xeno Atlas, whose short clips are published automatically to TikTok, YouTube, Instagram and Facebook. The pages are live and have an audience.',
      th: 'เพจ AI สองเพจ คือ Abyss Files และ Xeno Atlas ที่โพสต์คลิปสั้นลง TikTok, YouTube, Instagram และ Facebook อัตโนมัติ เพจใช้งานจริงและมีผู้ชมติดตาม',
    },
    // How the auto-poster works (shown as a numbered list on the card).
    details: {
      title: { en: 'How the auto-poster works', th: 'ระบบโพสต์อัตโนมัติทำงานอย่างไร' },
      steps: [
        { en: 'A set of Python scripts that I wrote.', th: 'ชุดสคริปต์ Python ที่ผมเขียนเอง' },
        { en: 'It takes one clip file with a title and a caption.', th: 'รับคลิป 1 ไฟล์ พร้อมชื่อและแคปชั่น' },
        { en: 'A single command publishes it to every platform.', th: 'คำสั่งเดียวส่งขึ้นทุกแพลตฟอร์ม' },
        { en: 'It calls each platform’s official API directly: no middleman service, and no opening the website to upload by hand.', th: 'เรียก API ทางการของแต่ละแพลตฟอร์มโดยตรง ไม่ผ่านบริการตัวกลาง และไม่ต้องเปิดเว็บมาอัปโหลดเอง' },
      ],
    },
    tech: ['Python', 'Automation', 'Official APIs', 'TikTok', 'YouTube', 'Instagram', 'Facebook'],
    liveStats: true, // shows follower counts from stats.json (see src/data/socials.js)
    preview: 'social',
    image: null,
    url: null,
    repo: null,
    // Several public links: one button each. Order and names as given: page 1 = Abyss Files, page 2 = Xeno Atlas.
    links: [
      { label: { en: 'Abyss Files · Facebook', th: 'Abyss Files · Facebook' }, url: 'https://www.facebook.com/profile.php?id=61595622583527&sk=reels_tab' },
      { label: { en: 'Xeno Atlas · Facebook', th: 'Xeno Atlas · Facebook' }, url: 'https://www.facebook.com/profile.php?id=61595514497855' },
    ],
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
    id: 'promptpay',
    name: { en: 'PromptPay QR Maker', th: 'เครื่องมือสร้าง QR PromptPay' },
    description: {
      en: 'A web tool that turns a phone number or ID and an amount into a scannable PromptPay QR, with checksum validation.',
      th: 'เว็บเครื่องมือแปลงเบอร์หรือเลขบัตรและจำนวนเงินเป็น QR PromptPay ที่สแกนได้ พร้อมตรวจ checksum',
    },
    demo: true,
    note: {
      en: 'Interactive demo with sample data. It runs in your browser; nothing is uploaded.',
      th: 'เดโมใช้งานได้จริงด้วยข้อมูลตัวอย่าง ทำงานในเบราว์เซอร์ ไม่มีการอัปโหลดข้อมูล',
    },
    tech: ['React', 'JavaScript', 'Thai QR Payment', 'AI-assisted development'],
    preview: 'web',
    image: { dark: './projects/promptpay-dark.jpg', light: './projects/promptpay-light.jpg' },
    url: './demos/promptpay/',
    repo: null,
  },
  {
    id: 'linestop',
    name: { en: 'Line Stop Analyzer', th: 'ตัววิเคราะห์ไลน์ผลิตหยุด' },
    description: {
      en: 'Upload a production-line stop log and get downtime by cause and station, repair times, a stop timeline and a summary to send.',
      th: 'อัปโหลด log การหยุดของไลน์ผลิต แล้วได้ downtime แยกตามสาเหตุและสถานี เวลาซ่อม ไทม์ไลน์ และสรุปพร้อมส่ง',
    },
    demo: true,
    note: {
      en: 'Interactive demo with synthetic sample data. It runs in your browser; nothing is uploaded.',
      th: 'เดโมใช้งานได้จริงด้วยข้อมูลตัวอย่างที่สร้างขึ้นเอง ทำงานในเบราว์เซอร์ ไม่มีการอัปโหลดข้อมูล',
    },
    tech: ['React', 'JavaScript', 'Data analysis', 'AI-assisted development'],
    preview: 'automation',
    image: { dark: './projects/linestop-dark.jpg', light: './projects/linestop-light.jpg' },
    url: './demos/linestop/',
    repo: null,
  },
]
