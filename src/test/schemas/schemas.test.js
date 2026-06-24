import { describe, it, expect } from 'vitest'
import { validateVenta } from '../../lib/schemas/ventaSchema'
import { validateCompra } from '../../lib/schemas/compraSchema'
import { validateCotizacion } from '../../lib/schemas/cotizacionSchema'

const validUuid = '00000000-0000-0000-0000-000000000001'
const goodItem = { equipo_id: 'EQ-1', cantidad: 2, precio_unitario: 100 }

describe('validateVenta', () => {
  it('acepta una venta válida', () => {
    const res = validateVenta({
      cliente_id: validUuid,
      almacen_id: validUuid,
      fecha: '2026-06-24',
      items: [goodItem],
    })
    expect(res.success).toBe(true)
  })

  it('exige almacen_id', () => {
    const res = validateVenta({ fecha: '2026-06-24', items: [goodItem] })
    expect(res.success).toBe(false)
    expect(res.errors.almacen_id).toMatch(/Almacén/i)
  })

  it('exige fecha en formato YYYY-MM-DD', () => {
    const res = validateVenta({
      almacen_id: validUuid, fecha: '24/06/2026', items: [goodItem],
    })
    expect(res.success).toBe(false)
    expect(res.errors.fecha).toBeTruthy()
  })

  it('rechaza items vacíos', () => {
    const res = validateVenta({
      almacen_id: validUuid, fecha: '2026-06-24', items: [],
    })
    expect(res.success).toBe(false)
    expect(res.errors.items).toMatch(/al menos un item/i)
  })

  it('rechaza cantidad <= 0', () => {
    const res = validateVenta({
      almacen_id: validUuid, fecha: '2026-06-24',
      items: [{ ...goodItem, cantidad: 0 }],
    })
    expect(res.success).toBe(false)
    expect(res.errors.items).toBeTruthy()
  })

  it('rechaza cantidad no entera', () => {
    const res = validateVenta({
      almacen_id: validUuid, fecha: '2026-06-24',
      items: [{ ...goodItem, cantidad: 1.5 }],
    })
    expect(res.success).toBe(false)
  })

  it('rechaza precio_unitario = 0 (en ventas)', () => {
    const res = validateVenta({
      almacen_id: validUuid, fecha: '2026-06-24',
      items: [{ ...goodItem, precio_unitario: 0 }],
    })
    expect(res.success).toBe(false)
    expect(res.errors.items).toMatch(/precios|0/i)
  })

  it('acepta cliente_id vacío (sin cliente)', () => {
    const res = validateVenta({
      cliente_id: '', almacen_id: validUuid, fecha: '2026-06-24', items: [goodItem],
    })
    expect(res.success).toBe(true)
  })
})

describe('validateCompra', () => {
  it('acepta una compra válida con item gratuito', () => {
    const res = validateCompra({
      proveedor_id: validUuid,
      almacen_id: validUuid,
      fecha: '2026-06-24',
      items: [{ ...goodItem, precio_unitario: 0 }],
    })
    expect(res.success).toBe(true)
  })

  it('exige almacen_id', () => {
    const res = validateCompra({ fecha: '2026-06-24', items: [goodItem] })
    expect(res.success).toBe(false)
    expect(res.errors.almacen_id).toBeTruthy()
  })

  it('rechaza precio_unitario negativo', () => {
    const res = validateCompra({
      almacen_id: validUuid, fecha: '2026-06-24',
      items: [{ ...goodItem, precio_unitario: -1 }],
    })
    expect(res.success).toBe(false)
  })

  it('rechaza items vacíos', () => {
    const res = validateCompra({
      almacen_id: validUuid, fecha: '2026-06-24', items: [],
    })
    expect(res.success).toBe(false)
    expect(res.errors.items).toMatch(/al menos un item/i)
  })
})

describe('validateCotizacion', () => {
  it('acepta cotización válida sin almacén (correcto: no aplica)', () => {
    const res = validateCotizacion({
      cliente_id: validUuid, fecha: '2026-06-24', items: [goodItem],
    })
    expect(res.success).toBe(true)
  })

  it('acepta sin cliente', () => {
    const res = validateCotizacion({
      fecha: '2026-06-24', items: [goodItem],
    })
    expect(res.success).toBe(true)
  })

  it('rechaza items vacíos', () => {
    const res = validateCotizacion({ fecha: '2026-06-24', items: [] })
    expect(res.success).toBe(false)
    expect(res.errors.items).toMatch(/al menos un item/i)
  })

  it('rechaza item sin equipo', () => {
    const res = validateCotizacion({
      fecha: '2026-06-24',
      items: [{ equipo_id: '', cantidad: 1, precio_unitario: 10 }],
    })
    expect(res.success).toBe(false)
    expect(res.errors.items).toBeTruthy()
  })

  it('rechaza fecha inválida', () => {
    const res = validateCotizacion({ fecha: 'no-fecha', items: [goodItem] })
    expect(res.success).toBe(false)
    expect(res.errors.fecha).toBeTruthy()
  })
})
