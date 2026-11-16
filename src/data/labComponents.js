// Component information for the BK-8, an original fictional 8-bit console.
// Order = disassembly order. `id` must match a part id in src/lab/ExplodedView.js.
export const labComponents = [
  {
    id: 'topCase',
    name: { en: 'Top casing', th: 'ฝาครอบด้านบน' },
    fn: {
      en: 'Protects the internals and guides the cartridge into the slot.',
      th: 'ป้องกันชิ้นส่วนภายใน และนำตลับเกมลงสู่ช่องเสียบ',
    },
    spec: {
      en: 'Injection-moulded ABS, 2.5 mm wall, textured matte finish',
      th: 'พลาสติก ABS ฉีดขึ้นรูป หนา 2.5 มม. ผิวด้านแบบมีเท็กซ์เจอร์',
    },
    note: {
      en: 'ABS was the standard choice of the era: cheap to mould, tough enough to survive being dropped, and stiff enough to hold four screw bosses in line. The rear slots let warm air rise out by convection, so no fan is needed.',
      th: 'ABS เป็นวัสดุมาตรฐานของยุคนั้น ขึ้นรูปได้ถูก ทนการตกกระแทก และแข็งพอจะยึดเสาสกรูทั้งสี่ให้ตรงแนว ช่องระบายด้านหลังปล่อยให้อากาศร้อนลอยออกเองตามธรรมชาติ จึงไม่ต้องมีพัดลม',
    },
  },
  {
    id: 'buttons',
    name: { en: 'Power & reset assembly', th: 'ชุดปุ่ม Power และ Reset' },
    fn: {
      en: 'Switches the 5 V rail and pulls the CPU reset line.',
      th: 'ตัดต่อไฟ 5 V และดึงสัญญาณ reset ของ CPU',
    },
    spec: {
      en: 'Latching DPDT power switch, momentary reset switch, 3 mm red LED',
      th: 'สวิตช์ power แบบ DPDT กดค้าง, สวิตช์ reset แบบกดปล่อย, LED สีแดง 3 มม.',
    },
    note: {
      en: 'Power latches mechanically, so it stays down when the console is on. Reset is momentary: it only holds the CPU in reset while your finger is on it, which is why a quick tap restarts the game without cutting power.',
      th: 'ปุ่ม power ล็อกด้วยกลไก จึงค้างอยู่ด้านล่างตอนเครื่องเปิด ส่วน reset เป็นแบบกดปล่อย จะกด CPU ให้อยู่ในสถานะ reset เฉพาะตอนนิ้วยังกดอยู่ แตะครั้งเดียวเกมจึงเริ่มใหม่โดยไม่ต้องตัดไฟ',
    },
  },
  {
    id: 'cartSlot',
    name: { en: 'Cartridge slot & connector', th: 'ช่องเสียบและคอนเนกเตอร์ตลับเกม' },
    fn: {
      en: 'Connects the game cartridge to the CPU and video buses.',
      th: 'เชื่อมตลับเกมเข้ากับบัสของ CPU และวิดีโอ',
    },
    spec: {
      en: '60-pin card-edge connector, 2.54 mm pitch, gold-flashed contacts',
      th: 'คอนเนกเตอร์ card-edge 60 ขา ระยะ 2.54 มม. หน้าสัมผัสเคลือบทอง',
    },
    note: {
      en: 'The cartridge is part of the computer, not just storage: program ROM sits directly on the CPU bus and graphics ROM on the video bus. Dirty contacts break those buses, which is where the old ritual of blowing on cartridges came from.',
      th: 'ตลับเกมคือส่วนหนึ่งของคอมพิวเตอร์ ไม่ใช่แค่ที่เก็บข้อมูล ROM โปรแกรมต่อเข้ากับบัส CPU โดยตรง และ ROM กราฟิกต่อเข้ากับบัสวิดีโอ ถ้าหน้าสัมผัสสกปรกบัสก็ขาด นี่คือที่มาของพิธีเป่าตลับเกมในตำนาน',
    },
  },
  {
    id: 'heatShield',
    name: { en: 'Heat shield', th: 'แผ่นกันความร้อน' },
    fn: {
      en: 'Spreads heat and blocks radio-frequency interference.',
      th: 'กระจายความร้อน และกันคลื่นรบกวนความถี่วิทยุ',
    },
    spec: {
      en: '0.5 mm tin-plated steel, perforated, grounded at four points',
      th: 'เหล็กชุบดีบุก หนา 0.5 มม. เจาะรูระบาย ต่อกราวด์สี่จุด',
    },
    note: {
      en: 'Fast digital signals make a circuit board behave like a radio transmitter. A grounded metal shield kept the console from putting snow on the neighbours’ TV, and doubled as a heat spreader for the chips underneath.',
      th: 'สัญญาณดิจิทัลความเร็วสูงทำให้แผงวงจรทำตัวเหมือนเครื่องส่งวิทยุ แผ่นโลหะที่ต่อกราวด์ช่วยไม่ให้เครื่องเกมไปกวนทีวีบ้านข้าง ๆ และยังช่วยกระจายความร้อนจากชิปด้านล่างด้วย',
    },
  },
  {
    id: 'motherboard',
    name: { en: 'Main motherboard', th: 'เมนบอร์ดหลัก' },
    fn: {
      en: 'Carries every chip and routes power, address and data lines between them.',
      th: 'เป็นฐานของชิปทุกตัว และเดินสายไฟ address และ data ระหว่างกัน',
    },
    spec: {
      en: 'Double-sided FR-4, 1.6 mm, through-hole assembly, revision C',
      th: 'FR-4 สองหน้า หนา 1.6 มม. ประกอบแบบ through-hole รุ่น revision C',
    },
    note: {
      en: 'With only two copper layers, every trace had to be routed by hand around every other one. The wide traces are power and ground; the thin parallel groups are the 16-bit address bus and 8-bit data bus.',
      th: 'เมื่อมีทองแดงแค่สองชั้น ลายวงจรทุกเส้นต้องเดินหลบกันด้วยมือ เส้นกว้างคือไฟและกราวด์ ส่วนเส้นบางที่วิ่งขนานกันเป็นกลุ่มคือ address bus 16 บิต และ data bus 8 บิต',
    },
  },
  {
    id: 'cpu',
    name: { en: 'CPU', th: 'CPU' },
    fn: {
      en: 'Runs the game program: logic, input, sound and timing.',
      th: 'ประมวลผลโปรแกรมเกม ทั้ง logic, input, เสียง และจังหวะเวลา',
    },
    spec: {
      en: 'BK-8502, 8-bit, 1.79 MHz, 16-bit address bus (64 KB), 40-pin DIP',
      th: 'BK-8502 แบบ 8 บิต 1.79 MHz address bus 16 บิต (64 KB) ตัวถัง DIP 40 ขา',
    },
    note: {
      en: 'At 1.79 MHz the CPU has roughly 30,000 clock cycles per video frame. Every enemy, jump and sound effect had to fit in that budget, which is why 8-bit games were written in hand-tuned assembly.',
      th: 'ที่ความเร็ว 1.79 MHz CPU มีเวลาราว 30,000 clock cycle ต่อหนึ่งเฟรม ศัตรูทุกตัว การกระโดดทุกครั้ง และเสียงทุกเสียงต้องอยู่ในงบนี้ เกม 8 บิตจึงต้องเขียนด้วย assembly ที่จูนด้วยมือ',
    },
  },
  {
    id: 'gpu',
    name: { en: 'GPU (picture processor)', th: 'GPU (ชิปประมวลผลภาพ)' },
    fn: {
      en: 'Builds each video frame from background tiles and sprites.',
      th: 'สร้างภาพแต่ละเฟรมจาก background tile และ sprite',
    },
    spec: {
      en: 'BK-PPU, 256 × 240 px, 52-colour palette, 64 sprites (8 per scanline)',
      th: 'BK-PPU ความละเอียด 256 × 240 px จานสี 52 สี 64 sprite (8 ตัวต่อ scanline)',
    },
    note: {
      en: 'There is no frame buffer. The chip assembles the picture one scanline at a time, in step with the TV’s electron beam. The eight-sprites-per-line limit is why crowded scenes in games of this era flicker.',
      th: 'ชิปนี้ไม่มี frame buffer มันประกอบภาพทีละ scanline ไปพร้อมกับลำอิเล็กตรอนของทีวี ข้อจำกัด 8 sprite ต่อบรรทัดคือเหตุผลที่ฉากคนเยอะในเกมยุคนั้นกะพริบ',
    },
  },
  {
    id: 'ram',
    name: { en: 'RAM', th: 'RAM' },
    fn: {
      en: 'Holds working data: positions, score, and the tile map on screen.',
      th: 'เก็บข้อมูลระหว่างทำงาน เช่น ตำแหน่ง คะแนน และ tile map บนจอ',
    },
    spec: {
      en: '2 × 2 KB static RAM (work RAM + video RAM), 24-pin DIP',
      th: 'Static RAM 2 KB จำนวน 2 ตัว (work RAM + video RAM) ตัวถัง DIP 24 ขา',
    },
    note: {
      en: 'Two kilobytes of work RAM is less than this paragraph takes up as text. Static RAM needs no refresh circuitry, which kept the board simple, and everything is forgotten the moment power is cut.',
      th: 'Work RAM ขนาด 2 KB นั้นน้อยกว่าพื้นที่ที่ข้อความย่อหน้านี้ใช้เสียอีก Static RAM ไม่ต้องมีวงจร refresh บอร์ดจึงเรียบง่าย และทุกอย่างจะหายไปทันทีที่ตัดไฟ',
    },
  },
  {
    id: 'components',
    name: { en: 'Electronic components', th: 'ชิ้นส่วนอิเล็กทรอนิกส์' },
    fn: {
      en: 'Regulate power, generate the clock, and send video to the TV.',
      th: 'ควบคุมแรงดันไฟ สร้างสัญญาณ clock และส่งภาพไปยังทีวี',
    },
    spec: {
      en: '5 V linear regulator with heatsink, 21.47 MHz crystal, RF modulator, filter capacitors',
      th: 'Linear regulator 5 V พร้อม heatsink, crystal 21.47 MHz, RF modulator และ capacitor กรองไฟ',
    },
    note: {
      en: 'One crystal is the heartbeat of the whole machine: divided by twelve it clocks the CPU, divided by four it clocks the picture processor. The regulator burns off excess voltage as heat, hence the finned heatsink.',
      th: 'Crystal ตัวเดียวคือจังหวะหัวใจของทั้งเครื่อง หารสิบสองได้ clock ของ CPU หารสี่ได้ clock ของชิปภาพ ส่วน regulator เผาแรงดันส่วนเกินทิ้งเป็นความร้อน จึงต้องมี heatsink แบบครีบ',
    },
  },
  {
    id: 'ports',
    name: { en: 'Controller ports', th: 'พอร์ตจอยคอนโทรลเลอร์' },
    fn: {
      en: 'Read button presses from two controllers.',
      th: 'อ่านการกดปุ่มจากจอยสองตัว',
    },
    spec: {
      en: '2 × 7-pin ports, serial data via shift register, 5 V logic',
      th: 'พอร์ต 7 ขา จำนวน 2 ช่อง ส่งข้อมูลแบบ serial ผ่าน shift register ที่ logic 5 V',
    },
    note: {
      en: 'Eight buttons, but only three signal wires. The console pulses a latch line, then clocks the button states out one bit at a time. Fewer wires meant a thinner, cheaper cable.',
      th: 'ปุ่มแปดปุ่ม แต่ใช้สายสัญญาณแค่สามเส้น เครื่องจะส่งพัลส์ latch แล้ว clock สถานะปุ่มออกมาทีละบิต สายน้อยลงก็หมายถึงสายที่บางและถูกลง',
    },
  },
  {
    id: 'bottomCase',
    name: { en: 'Bottom casing', th: 'ฝาครอบด้านล่าง' },
    fn: {
      en: 'Structural base: holds the board and locks to the top casing.',
      th: 'ฐานโครงสร้าง ยึดเมนบอร์ด และล็อกเข้ากับฝาบน',
    },
    spec: {
      en: 'ABS tray, four screw bosses, four rubber feet',
      th: 'ถาด ABS เสาสกรูสี่จุด และยางรองสี่ตำแหน่ง',
    },
    note: {
      en: 'The four bosses do two jobs: they hold the board off the floor of the case so air can move underneath, and they take the screws that clamp the whole stack together. Four screws and it all comes apart, the way things should.',
      th: 'เสาทั้งสี่ทำสองหน้าที่ คือยกเมนบอร์ดให้ลอยจากพื้นเคสเพื่อให้อากาศไหลผ่านด้านล่าง และรับสกรูที่ยึดทุกชั้นเข้าด้วยกัน ไขสกรูสี่ตัวก็แกะได้ทั้งเครื่อง อย่างที่ของดี ๆ ควรจะเป็น',
    },
  },
]
