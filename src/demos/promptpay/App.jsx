import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Download } from 'lucide-react'
import DemoShell from '../shared/DemoShell.jsx'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { buildPayload, nationalIdChecksumOk, normalizeTarget, parseAmount, parseTlv, verifyPayload } from './emv.js'

// A number that cannot belong to anyone: used by "Use sample" so nobody is paid by accident.
const SAMPLE = { target: '0800000000', amount: '100' }

const TEXT = {
  en: {
    title: 'PromptPay QR Maker',
    subtitle: 'Turn a mobile number or ID, and an optional amount, into a PromptPay QR code. Built on the Thai QR Payment format, with the checksum calculated in your browser.',
    formLabel: 'Details',
    qrLabel: 'QR code',
    target: 'PromptPay ID',
    targetHint: 'Mobile number (0812345678) or 13-digit national / tax ID',
    amount: 'Amount (THB), optional',
    amountHint: 'Leave empty for a reusable QR where the payer types the amount',
    sample: 'Use sample',
    clear: 'Clear',
    sampleWarn: 'Sample number, not a real account. Do not use this QR to pay anyone.',
    empty: 'Enter a PromptPay ID to see the QR code.',
    err: {
      format: 'Enter a 10-digit mobile number (starting with 0) or a 13-digit ID.',
      amountFormat: 'Use numbers with at most 2 decimals, for example 1250.50.',
      zero: 'The amount must be more than 0.',
      max: 'The amount is too large for a QR code (maximum 9,999,999.99).',
      idChecksum: 'This ID does not pass the national ID checksum. Check for a typo (tax IDs of companies may still be valid).',
    },
    typePhone: 'Mobile number',
    typeId: 'National / tax ID',
    staticQr: 'Reusable QR (no amount)',
    dynamicQr: 'One-time QR with amount',
    download: 'Download PNG',
    copy: 'Copy payload',
    copied: 'Copied',
    verified: 'Checksum verified',
    scan: 'Scan with any Thai banking app. Always check the account name shown by the app before paying.',
    breakdown: 'How this QR is built',
    breakdownIntro: 'The code is a text string made of tag, length and value fields. The last field is a checksum that lets a banking app reject a mistyped code.',
    cols: ['Tag', 'Meaning', 'Value'],
    tags: {
      '00': 'Payload format version',
      '01': 'Initiation method: 11 = reusable, 12 = one payment',
      '29': 'PromptPay account block',
      '29.00': 'Application ID for PromptPay',
      '29.01': 'Mobile number as 0066 + number without the leading 0',
      '29.02': 'National or tax ID',
      '53': 'Currency: 764 = Thai baht',
      '54': 'Amount',
      '58': 'Country: TH',
      '63': 'Checksum: CRC-16 over every character before it',
    },
    alt: 'PromptPay QR code',
  },
  th: {
    title: 'เครื่องมือสร้าง QR PromptPay',
    subtitle: 'แปลงเบอร์มือถือหรือเลขบัตร (และจำนวนเงินถ้าต้องการ) เป็น QR PromptPay ตามมาตรฐาน Thai QR Payment โดยคำนวณ checksum ในเบราว์เซอร์ของคุณ',
    formLabel: 'รายละเอียด',
    qrLabel: 'QR code',
    target: 'PromptPay ID',
    targetHint: 'เบอร์มือถือ (0812345678) หรือเลขบัตรประชาชน / เลขผู้เสียภาษี 13 หลัก',
    amount: 'จำนวนเงิน (บาท) ไม่บังคับ',
    amountHint: 'เว้นว่างไว้ถ้าต้องการ QR ใช้ซ้ำที่ผู้จ่ายกรอกจำนวนเงินเอง',
    sample: 'ใช้ตัวอย่าง',
    clear: 'ล้าง',
    sampleWarn: 'เบอร์ตัวอย่าง ไม่ใช่บัญชีจริง ห้ามใช้ QR นี้โอนเงินให้ใคร',
    empty: 'กรอก PromptPay ID เพื่อดู QR',
    err: {
      format: 'กรอกเบอร์มือถือ 10 หลัก (ขึ้นต้นด้วย 0) หรือเลข 13 หลัก',
      amountFormat: 'ใช้ตัวเลขและทศนิยมไม่เกิน 2 ตำแหน่ง เช่น 1250.50',
      zero: 'จำนวนเงินต้องมากกว่า 0',
      max: 'จำนวนเงินมากเกินกว่าที่ QR รองรับ (สูงสุด 9,999,999.99)',
      idChecksum: 'เลขนี้ไม่ผ่านการตรวจ checksum ของเลขบัตรประชาชน ลองตรวจว่าพิมพ์ผิดไหม (เลขผู้เสียภาษีนิติบุคคลอาจใช้ได้อยู่)',
    },
    typePhone: 'เบอร์มือถือ',
    typeId: 'เลขบัตร / เลขผู้เสียภาษี',
    staticQr: 'QR ใช้ซ้ำ (ไม่มีจำนวนเงิน)',
    dynamicQr: 'QR ครั้งเดียว (มีจำนวนเงิน)',
    download: 'ดาวน์โหลด PNG',
    copy: 'คัดลอก payload',
    copied: 'คัดลอกแล้ว',
    verified: 'ตรวจ checksum ผ่าน',
    scan: 'สแกนด้วยแอปธนาคารของไทยได้ และตรวจชื่อบัญชีที่แอปแสดงทุกครั้งก่อนจ่าย',
    breakdown: 'QR นี้ประกอบขึ้นอย่างไร',
    breakdownIntro: 'โค้ดคือข้อความที่ประกอบด้วยฟิลด์ tag, ความยาว และค่า ฟิลด์สุดท้ายคือ checksum ที่ช่วยให้แอปธนาคารปฏิเสธโค้ดที่พิมพ์ผิด',
    cols: ['Tag', 'ความหมาย', 'ค่า'],
    tags: {
      '00': 'เวอร์ชันของรูปแบบข้อมูล',
      '01': 'วิธีสร้าง QR: 11 = ใช้ซ้ำ, 12 = จ่ายครั้งเดียว',
      '29': 'ข้อมูลบัญชี PromptPay',
      '29.00': 'รหัสแอปพลิเคชันของ PromptPay',
      '29.01': 'เบอร์มือถือ แทนเลข 0 นำหน้าด้วย 0066',
      '29.02': 'เลขบัตรประชาชนหรือเลขผู้เสียภาษี',
      '53': 'สกุลเงิน: 764 = บาท',
      '54': 'จำนวนเงิน',
      '58': 'ประเทศ: TH',
      '63': 'Checksum: CRC-16 ของทุกตัวอักษรก่อนหน้า',
    },
    alt: 'QR code PromptPay',
  },
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch {}
  try {
    const ta = document.createElement('textarea')
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    const ok = document.execCommand('copy'); ta.remove(); return ok
  } catch { return false }
}

// Draws the QR with square modules and a 4-module quiet zone. It is always dark on white,
// whatever the site theme, because scanners need the contrast.
function drawQr(canvas, text, size = 288) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' })
  const n = qr.modules.size
  const cell = Math.max(2, Math.floor(size / (n + 8)))
  const px = cell * (n + 8)
  canvas.width = px; canvas.height = px
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, px, px)
  ctx.fillStyle = '#0b0c0e'
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.data[y * n + x]) ctx.fillRect((x + 4) * cell, (y + 4) * cell, cell, cell)
}

export default function App() {
  const { lang } = useLanguage()
  const T = TEXT[lang]
  const [target, setTarget] = useState('')
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState(false)
  const canvas = useRef(null)

  const result = useMemo(() => {
    const tg = normalizeTarget(target)
    const am = parseAmount(amount)
    const errors = []
    if (tg.error === 'format') errors.push(T.err.format)
    if (am.error === 'format') errors.push(T.err.amountFormat)
    if (am.error === 'zero') errors.push(T.err.zero)
    if (am.error === 'max') errors.push(T.err.max)
    const warnings = []
    if (tg.type === 'id' && !nationalIdChecksumOk(tg.digits)) warnings.push(T.err.idChecksum)
    const ok = !tg.error && !am.error
    const payload = ok ? buildPayload({ target, amount: am.empty ? undefined : am.value }) : null
    return { tg, am, errors, warnings, payload, isSample: tg.digits === SAMPLE.target }
  }, [target, amount, T])

  useEffect(() => { if (result.payload && canvas.current) drawQr(canvas.current, result.payload) }, [result.payload])

  const download = () => {
    canvas.current?.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = 'promptpay-qr.png'; a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    })
  }
  const copy = async () => { if (await copyText(result.payload)) { setCopied(true); setTimeout(() => setCopied(false), 1800) } }

  const fields = result.payload ? parseTlv(result.payload) : []
  const rows = fields.flatMap((f) => f.children ? [{ ...f, key: f.tag }, ...f.children.map((c) => ({ ...c, key: `29.${c.tag}`, indent: true }))] : [{ ...f, key: f.tag }])
  const input = 'mt-2 block w-full border-2 border-line bg-card px-3 py-2.5 font-mono text-base text-ink placeholder:text-muted focus:border-sky'

  return (
    <DemoShell title={T.title} subtitle={T.subtitle}>
      <div className="grid gap-8 md:grid-cols-[1fr_20rem] md:gap-10">
        <section className="px-card p-5 md:p-6" aria-label={T.formLabel}>
          <label className="block">
            <span className="font-semibold">{T.target}</span>
            <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="numeric" autoComplete="off" spellCheck={false} placeholder="08x-xxx-xxxx" className={input} aria-describedby="t-hint" />
            <span id="t-hint" className="mt-1.5 block text-sm text-muted">{T.targetHint}</span>
          </label>
          <label className="mt-5 block">
            <span className="font-semibold">{T.amount}</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" autoComplete="off" spellCheck={false} placeholder="0.00" className={input} aria-describedby="a-hint" />
            <span id="a-hint" className="mt-1.5 block text-sm text-muted">{T.amountHint}</span>
          </label>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button type="button" onClick={() => { setTarget(SAMPLE.target); setAmount(SAMPLE.amount) }} className="px-btn bg-sky px-4 py-2 text-sm font-semibold text-on-accent">{T.sample}</button>
            <button type="button" onClick={() => { setTarget(''); setAmount('') }} className="px-btn bg-card px-4 py-2 text-sm font-semibold">{T.clear}</button>
          </div>
          <div aria-live="polite">
            {result.errors.map((m) => <p key={m} className="mt-4 border-l-4 border-orange pl-3 text-sm">{m}</p>)}
            {result.warnings.map((m) => <p key={m} className="mt-4 border-l-4 border-sky pl-3 text-sm text-muted">{m}</p>)}
            {result.isSample && <p className="mt-4 border-l-4 border-orange pl-3 text-sm font-semibold">{T.sampleWarn}</p>}
          </div>
        </section>

        <section className="px-card self-start p-5" aria-label={T.qrLabel}>
          {result.payload ? (
            <>
              <div className="border-[3px] border-line bg-white p-0">
                <canvas ref={canvas} role="img" aria-label={T.alt} className="pixelated block h-auto w-full" />
              </div>
              <p className="mt-4 text-sm font-semibold">{result.tg.type === 'phone' ? T.typePhone : T.typeId} · <span className="font-mono">{result.tg.digits}</span></p>
              <p className="text-sm text-muted">{result.am.empty ? T.staticQr : `${T.dynamicQr}: ${result.am.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} THB`}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-sky"><Check className="h-4 w-4" aria-hidden="true" />{verifyPayload(result.payload) ? T.verified : ''}</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button type="button" onClick={download} className="px-btn inline-flex items-center gap-2 bg-sky px-3.5 py-2 text-sm font-semibold text-on-accent"><Download className="h-4 w-4" aria-hidden="true" />{T.download}</button>
                <button type="button" onClick={copy} className="px-btn inline-flex items-center gap-2 bg-card px-3.5 py-2 text-sm font-semibold"><Copy className="h-4 w-4" aria-hidden="true" /><span aria-live="polite">{copied ? T.copied : T.copy}</span></button>
              </div>
              <p className="mt-4 text-xs text-muted">{T.scan}</p>
            </>
          ) : (
            <p className="grid min-h-48 place-items-center text-center text-muted">{T.empty}</p>
          )}
        </section>
      </div>

      {result.payload && (
        <section className="mt-12" aria-labelledby="bk">
          <h2 id="bk" className="font-display text-2xl font-semibold">{T.breakdown}</h2>
          <p className="mt-2 max-w-2xl text-muted">{T.breakdownIntro}</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-2 border-line text-left text-sm">
              <thead className="bg-bg-2 font-mono text-xs uppercase text-muted"><tr>{T.cols.map((c) => <th key={c} className="px-3 py-2.5 font-normal">{c}</th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-t-2 border-line align-top">
                    <td className={`px-3 py-2.5 font-mono ${r.indent ? 'pl-8 text-muted' : 'text-sky'}`}>{r.indent ? r.tag : `${r.tag}`}</td>
                    <td className="px-3 py-2.5">{T.tags[r.key]}</td>
                    <td className="break-all px-3 py-2.5 font-mono text-xs">{r.children ? '' : r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 break-all border-2 border-dashed border-line p-3 font-mono text-xs text-muted">{result.payload}</p>
        </section>
      )}
    </DemoShell>
  )
}
