import { describe, it, expect } from 'vitest'
import { montoEnLetras } from '../../lib/utils/montoEnLetras'

describe('montoEnLetras', () => {
  it.each([
    [0, 'CERO CON 00/100 SOLES'],
    [1, 'UNO CON 00/100 SOLES'],
    [15.5, 'QUINCE CON 50/100 SOLES'],
    [21, 'VEINTIUNO CON 00/100 SOLES'],
    [100, 'CIEN CON 00/100 SOLES'],
    [101, 'CIENTO UNO CON 00/100 SOLES'],
    [865.5, 'OCHOCIENTOS SESENTA Y CINCO CON 50/100 SOLES'],
    [1000, 'MIL CON 00/100 SOLES'],
    [21000, 'VEINTIÚN MIL CON 00/100 SOLES'],
    [31500, 'TREINTA Y UN MIL QUINIENTOS CON 00/100 SOLES'],
    [101001, 'CIENTO UN MIL UNO CON 00/100 SOLES'],
    [96325.2, 'NOVENTA Y SEIS MIL TRESCIENTOS VEINTICINCO CON 20/100 SOLES'],
    [1000000, 'UN MILLÓN CON 00/100 SOLES'],
    [2500000.99, 'DOS MILLONES QUINIENTOS MIL CON 99/100 SOLES'],
    [0.1 + 0.2, 'CERO CON 30/100 SOLES'], // flotante: redondea céntimos
  ])('%s → %s', (n, esperado) => {
    expect(montoEnLetras(n)).toBe(esperado)
  })
})
