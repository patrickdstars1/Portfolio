// Thai QR Payment (PromptPay) payload, built on the EMVCo merchant-presented QR format.
// Pure functions, no DOM: tested separately from the UI.
//
// Payload = a list of TLV fields: 2-digit tag + 2-digit length + value.
//   00 payload format       "01"
//   01 initiation method    "11" static (reusable) or "12" dynamic (one payment, has an amount)
//   29 PromptPay account    00 application id "A000000677010111"
//                           01 mobile number as "0066" + number without the leading 0
//                           02 13-digit national ID / tax ID
//   53 currency             "764" (THB)
//   54 amount               optional, e.g. "100.00"
//   58 country              "TH"
//   63 CRC-16/CCITT-FALSE   4 hex digits over everything before it, including "6304"

export const PROMPTPAY_AID = 'A000000677010111'

export function crc16(str) {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

const tlv = (tag, value) => tag + String(value.length).padStart(2, '0') + value

// Accepts 0812345678, 081-234-5678, +66 81 234 5678, or a 13-digit ID.
export function normalizeTarget(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (!digits) return { error: 'empty' }
  if (digits.length === 10 && digits[0] === '0') return { type: 'phone', digits, value: '0066' + digits.slice(1) }
  if (digits.length === 11 && digits.startsWith('66')) return { type: 'phone', digits: '0' + digits.slice(2), value: '0066' + digits.slice(2) }
  if (digits.length === 13) return { type: 'id', digits, value: digits }
  return { error: 'format' }
}

// Checksum of a Thai national ID card number (the last digit checks the first 12).
export function nationalIdChecksumOk(d) {
  if (!/^\d{13}$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 12; i++) sum += Number(d[i]) * (13 - i)
  return (11 - (sum % 11)) % 10 === Number(d[12])
}

export const MAX_AMOUNT = 9999999.99

export function parseAmount(raw) {
  const s = String(raw ?? '').replace(/,/g, '').trim()
  if (!s) return { empty: true }
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return { error: 'format' }
  const n = Number(s)
  if (!(n > 0)) return { error: 'zero' }
  if (n > MAX_AMOUNT) return { error: 'max' }
  return { value: n }
}

export function buildPayload({ target, amount }) {
  const t = normalizeTarget(target)
  if (t.error) throw new Error('invalid target')
  if (amount != null && !(amount > 0 && amount <= MAX_AMOUNT)) throw new Error('invalid amount')
  const account = tlv('00', PROMPTPAY_AID) + tlv(t.type === 'phone' ? '01' : '02', t.value)
  let s = tlv('00', '01') + tlv('01', amount != null ? '12' : '11') + tlv('29', account) + tlv('53', '764')
  if (amount != null) s += tlv('54', amount.toFixed(2))
  s += tlv('58', 'TH') + '6304'
  return s + crc16(s)
}

export function verifyPayload(payload) {
  return /^.{8,}6304[0-9A-F]{4}$/.test(payload) && crc16(payload.slice(0, -4)) === payload.slice(-4)
}

// Splits a payload into fields; the PromptPay account (tag 29) is split once more.
export function parseTlv(payload) {
  const out = []
  let i = 0
  while (i + 4 <= payload.length) {
    const tag = payload.slice(i, i + 2)
    const len = Number(payload.slice(i + 2, i + 4))
    if (!Number.isInteger(len) || i + 4 + len > payload.length) break
    const value = payload.slice(i + 4, i + 4 + len)
    out.push({ tag, len, value, children: tag === '29' ? parseTlv(value) : undefined })
    i += 4 + len
  }
  return out
}
