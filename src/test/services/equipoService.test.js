import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeQuery } from '../_helpers/mockSupabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

vi.mock('../../lib/services/kardexService', () => ({
  kardexService: {
    entradaStock: vi.fn(() => Promise.resolve()),
  },
}))

import { supabase } from '../../lib/supabase'
import { equipoService } from '../../lib/services/equipoService'
import { kardexService } from '../../lib/services/kardexService'

describe('equipoService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getEquipos', () => {
    it('devuelve filas desde la vista v_equipos_con_stock', async () => {
      const rows = [{ id: 1, nombre: 'GPS', stock_total: 5 }]
      supabase.from.mockReturnValue(makeQuery({ data: rows, error: null }))

      const result = await equipoService.getEquipos()

      expect(supabase.from).toHaveBeenCalledWith('v_equipos_con_stock')
      expect(result).toEqual(rows)
    })

    it('devuelve [] cuando data es null', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: null }))
      const result = await equipoService.getEquipos()
      expect(result).toEqual([])
    })

    it('lanza si supabase devuelve error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'boom' } }))
      await expect(equipoService.getEquipos()).rejects.toBeTruthy()
    })
  })

  describe('getEquipoById', () => {
    it('devuelve el equipo encontrado', async () => {
      const eq = { id: 42, nombre: 'Teodolito' }
      supabase.from.mockReturnValue(makeQuery({ data: eq, error: null }))

      const result = await equipoService.getEquipoById(42)
      expect(result).toEqual(eq)
    })

    it('lanza si supabase devuelve error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'not found' } }))
      await expect(equipoService.getEquipoById(99)).rejects.toBeTruthy()
    })
  })

  describe('addEquipo', () => {
    it('inserta en equipos y re-fetchea via getEquipoById, sin stock inicial', async () => {
      // 1ª llamada: insert en 'equipos' devuelve [{id:7}]
      // 2ª llamada: getEquipoById devuelve el equipo completo
      const insertedRow = [{ id: 7 }]
      const fullRow = { id: 7, nombre: 'Nivel', stock_total: 0 }
      supabase.from
        .mockReturnValueOnce(makeQuery({ data: insertedRow, error: null }))
        .mockReturnValueOnce(makeQuery({ data: fullRow, error: null }))

      const result = await equipoService.addEquipo({
        nombre: 'Nivel',
        tipo: 'Nivel',
        serie: 'NL-1',
        precio_compra: 100,
        precio_venta: 150,
        imagen_url: null,
        stock: 0,
      })

      expect(supabase.from).toHaveBeenNthCalledWith(1, 'equipos')
      expect(supabase.from).toHaveBeenNthCalledWith(2, 'v_equipos_con_stock')
      expect(result).toEqual(fullRow)
      expect(kardexService.entradaStock).not.toHaveBeenCalled()
    })

    it('dispara entradaStock cuando stock inicial > 0', async () => {
      supabase.from
        .mockReturnValueOnce(makeQuery({ data: [{ id: 8 }], error: null }))
        .mockReturnValueOnce(makeQuery({ data: { id: 8, nombre: 'GPS' }, error: null }))

      await equipoService.addEquipo({ nombre: 'GPS', stock: 5 })

      expect(kardexService.entradaStock).toHaveBeenCalledWith({
        equipo_id: 8,
        cantidad: 5,
        motivo: expect.stringContaining('Entrada inicial de GPS'),
      })
    })

    it('lanza si el insert falla', async () => {
      supabase.from.mockReturnValueOnce(makeQuery({ data: null, error: { message: 'dup serie' } }))
      await expect(equipoService.addEquipo({ nombre: 'X' })).rejects.toBeTruthy()
    })

    it('devuelve null si el insert no devuelve fila', async () => {
      supabase.from.mockReturnValueOnce(makeQuery({ data: [], error: null }))
      const result = await equipoService.addEquipo({ nombre: 'X' })
      expect(result).toBeNull()
    })
  })

  describe('updateEquipo', () => {
    it('actualiza y re-fetchea', async () => {
      const updated = { id: 5, nombre: 'Nuevo' }
      supabase.from
        .mockReturnValueOnce(makeQuery({ data: null, error: null }))  // update
        .mockReturnValueOnce(makeQuery({ data: updated, error: null })) // getEquipoById

      const result = await equipoService.updateEquipo(5, { nombre: 'Nuevo' })
      expect(result).toEqual(updated)
    })

    it('lanza si el update falla', async () => {
      supabase.from.mockReturnValueOnce(makeQuery({ data: null, error: { message: 'fail' } }))
      await expect(equipoService.updateEquipo(1, { nombre: 'X' })).rejects.toBeTruthy()
    })
  })

  describe('deleteEquipo (soft delete)', () => {
    it('marca active=false', async () => {
      const q = makeQuery({ data: null, error: null })
      supabase.from.mockReturnValue(q)

      await equipoService.deleteEquipo(3)

      expect(supabase.from).toHaveBeenCalledWith('equipos')
      expect(q.update).toHaveBeenCalledWith(expect.objectContaining({ active: false }))
    })

    it('lanza si el update falla', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'rls' } }))
      await expect(equipoService.deleteEquipo(3)).rejects.toBeTruthy()
    })
  })

  describe('updateEquipoStatus', () => {
    it('hace update con el active dado', async () => {
      const q = makeQuery({ data: null, error: null })
      supabase.from.mockReturnValue(q)
      await equipoService.updateEquipoStatus(2, true)
      expect(q.update).toHaveBeenCalledWith(expect.objectContaining({ active: true }))
    })
  })

  describe('checkSerieUnique', () => {
    it('devuelve true cuando no hay matches', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: [], error: null }))
      expect(await equipoService.checkSerieUnique('SN-1')).toBe(true)
    })

    it('devuelve false cuando ya existe', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: [{ id: 1 }], error: null }))
      expect(await equipoService.checkSerieUnique('SN-1')).toBe(false)
    })

    it('excluye el id dado en la búsqueda', async () => {
      const q = makeQuery({ data: [], error: null })
      supabase.from.mockReturnValue(q)
      await equipoService.checkSerieUnique('SN-1', 99)
      expect(q.neq).toHaveBeenCalledWith('id', 99)
    })
  })
})
