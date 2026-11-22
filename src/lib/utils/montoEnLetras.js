// Importe en letras para comprobantes: 96325.2 → "NOVENTA Y SEIS MIL TRESCIENTOS
// VEINTICINCO CON 20/100 SOLES".
// ponytail: hasta 999 999 999; más allá no hay boletas en este negocio.

const UNIDADES = [
  '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
  'VEINTE', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS',
  'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE',
]
const DECENAS = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
const CENTENAS = [
  '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
]

const hasta999 = (n) => {
  if (n === 100) return 'CIEN'
  const r = n % 100
  const resto = r < 30
    ? UNIDADES[r]
    : DECENAS[Math.floor(r / 10)] + (r % 10 ? ` Y ${UNIDADES[r % 10]}` : '')
  return [CENTENAS[Math.floor(n / 100)], resto].filter(Boolean).join(' ')
}

// Delante de MIL / MILLONES: "VEINTIÚN MIL", "TREINTA Y UN MIL", "CIENTO UN MIL"
const apocope = (s) => s.replace(/VEINTIUNO$/, 'VEINTIÚN').replace(/UNO$/, 'UN')

const entero = (n) => {
  if (n === 0) return 'CERO'
  const millones = Math.floor(n / 1e6)
  const miles = Math.floor((n % 1e6) / 1000)
  const resto = n % 1000
  return [
    millones === 1 ? 'UN MILLÓN' : millones ? `${apocope(hasta999(millones))} MILLONES` : '',
    miles === 1 ? 'MIL' : miles ? `${apocope(hasta999(miles))} MIL` : '',
    resto ? hasta999(resto) : '',
  ].filter(Boolean).join(' ')
}

export const montoEnLetras = (monto, moneda = 'SOLES') => {
  const centimos = Math.round((Number(monto) || 0) * 100)
  const dec = String(centimos % 100).padStart(2, '0')
  return `${entero(Math.floor(centimos / 100))} CON ${dec}/100 ${moneda}`
}
