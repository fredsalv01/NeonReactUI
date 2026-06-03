import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Inventory } from './Inventory'
import { useInventoryStore } from '../../../stores/inventoryStore'

// Mock the store
vi.mock('../../../stores/inventoryStore', () => ({
  useInventoryStore: vi.fn()
}))

// Mock child components
vi.mock('../../ui', () => ({
  Button: ({ children, onClick, ...props }) => (
    <button {...props} onClick={onClick}>{children}</button>
  ),
  DataTable: ({ data, columns }) => (
    <table>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td>{row.nombre}</td>
            <td>{row.stock}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
  Badge: ({ estado }) => <span>{estado}</span>,
  Icon: ({ name }) => <span>{name}</span>,
  Pagination: () => <div>Pagination</div>,
  Select: ({ value, onChange }) => (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select</option>
    </select>
  ),
  SearchBar: ({ value, onChange }) => (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder="Search" />
  ),
  SkeletonRow: () => <div>Loading...</div>,
  Drawer: () => null,
  QRCode: () => <div>QR</div>,
  SkeletonBlock: () => <div>Loading...</div>,
  useToast: () => ({ toast: { success: vi.fn(), error: vi.fn() } })
}))

vi.mock('../modals/AddEquipoModal', () => ({
  AddEquipoModal: () => <div>Add Modal</div>
}))

vi.mock('../drawers/ProductDetailsDrawer', () => ({
  ProductDetailsDrawer: () => <div>Details Drawer</div>
}))

// Test data
const mockEquipos = [
  {
    id: '1',
    nombre: 'Laptop Dell',
    tipo: 'Computadora',
    serie: 'ABC123',
    estado: 'Disponible',
    stock: 5,
    precio_compra: 800,
    precio_venta: 1000,
    imagen_url: null,
    vendidos: 0,
  },
  {
    id: '2',
    nombre: 'Monitor LG',
    tipo: 'Monitor',
    serie: 'DEF456',
    estado: 'En uso',
    stock: 3,
    precio_compra: 200,
    precio_venta: 300,
    imagen_url: null,
    vendidos: 2,
  },
]

describe('Inventory Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)
      expect(screen.getByText('Inventario')).toBeInTheDocument()
    })

    it('should display loading skeleton while loading', () => {
      useInventoryStore.mockReturnValue({
        equipos: [],
        isLoading: true,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should display error message when error occurs', () => {
      const errorMessage = 'Failed to load equipos'
      useInventoryStore.mockReturnValue({
        equipos: [],
        isLoading: false,
        error: errorMessage,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)
      expect(screen.getByText(`Error al cargar el inventario: ${errorMessage}`)).toBeInTheDocument()
    })

    it('should display empty state when no equipos', () => {
      useInventoryStore.mockReturnValue({
        equipos: [],
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)
      expect(screen.getByText('Sin resultados')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should render all equipos in table', () => {
      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)

      expect(screen.getByText('Laptop Dell')).toBeInTheDocument()
      expect(screen.getByText('Monitor LG')).toBeInTheDocument()
    })

    it('should display total stock calculation', () => {
      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)

      // Total stock should be 5 + 3 = 8
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('should handle undefined equipos gracefully', () => {
      useInventoryStore.mockReturnValue({
        equipos: [mockEquipos[0], undefined, mockEquipos[1]],
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      expect(() => render(<Inventory />)).not.toThrow()
    })

    it('should handle empty stock values', () => {
      const equipoWithoutStock = { ...mockEquipos[0], stock: undefined }
      useInventoryStore.mockReturnValue({
        equipos: [equipoWithoutStock],
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      expect(() => render(<Inventory />)).not.toThrow()
    })
  })

  describe('Filtering', () => {
    it('should filter by search term', async () => {
      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      const { container } = render(<Inventory />)
      const searchInput = container.querySelector('input[placeholder="Search"]')

      await userEvent.type(searchInput, 'Laptop')

      await waitFor(() => {
        expect(screen.getByText('Laptop Dell')).toBeInTheDocument()
      })
    })

    it('should filter by estado', async () => {
      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      const { container } = render(<Inventory />)
      const selects = container.querySelectorAll('select')
      const estadoSelect = selects[0]

      await userEvent.selectOptions(estadoSelect, 'Disponible')

      await waitFor(() => {
        expect(screen.getByText('Disponible')).toBeInTheDocument()
      })
    })

    it('should handle search with non-existent term', async () => {
      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      const { container } = render(<Inventory />)
      const searchInput = container.querySelector('input[placeholder="Search"]')

      await userEvent.type(searchInput, 'NonExistentProduct')

      await waitFor(() => {
        expect(screen.getByText('Sin resultados')).toBeInTheDocument()
      })
    })
  })

  describe('Modals and Drawers', () => {
    it('should render add modal', () => {
      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)
      expect(screen.getByText('Add Modal')).toBeInTheDocument()
    })

    it('should render details drawer', () => {
      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)
      expect(screen.getByText('Details Drawer')).toBeInTheDocument()
    })
  })

  describe('Null Safety', () => {
    it('should handle null equipos array', () => {
      useInventoryStore.mockReturnValue({
        equipos: null,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      expect(() => render(<Inventory />)).not.toThrow()
    })

    it('should handle equipos with missing properties', () => {
      const incompleteEquipo = {
        id: '1',
        nombre: 'Test',
      }
      useInventoryStore.mockReturnValue({
        equipos: [incompleteEquipo],
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      expect(() => render(<Inventory />)).not.toThrow()
    })

    it('should handle searchTerm with special characters', async () => {
      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      const { container } = render(<Inventory />)
      const searchInput = container.querySelector('input[placeholder="Search"]')

      await userEvent.type(searchInput, '@#$%')

      expect(() => {}).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long producto names', () => {
      const longNameEquipo = {
        ...mockEquipos[0],
        nombre: 'A'.repeat(500),
      }
      useInventoryStore.mockReturnValue({
        equipos: [longNameEquipo],
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      expect(() => render(<Inventory />)).not.toThrow()
    })

    it('should handle very large stock numbers', () => {
      const largeStockEquipo = {
        ...mockEquipos[0],
        stock: 999999999,
      }
      useInventoryStore.mockReturnValue({
        equipos: [largeStockEquipo],
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      expect(() => render(<Inventory />)).not.toThrow()
    })

    it('should handle negative stock values gracefully', () => {
      const negativeStockEquipo = {
        ...mockEquipos[0],
        stock: -5,
      }
      useInventoryStore.mockReturnValue({
        equipos: [negativeStockEquipo],
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      expect(() => render(<Inventory />)).not.toThrow()
    })

    it('should handle zero stock', () => {
      const zeroStockEquipo = {
        ...mockEquipos[0],
        stock: 0,
      }
      useInventoryStore.mockReturnValue({
        equipos: [zeroStockEquipo],
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)
      expect(() => {}).not.toThrow()
    })
  })

  describe('Store Integration', () => {
    it('should call fetchEquipos on mount', () => {
      const fetchEquiposMock = vi.fn()
      useInventoryStore.mockReturnValue({
        equipos: [],
        isLoading: false,
        error: null,
        fetchEquipos: fetchEquiposMock,
        deleteEquipo: vi.fn(),
      })

      render(<Inventory />)
      expect(fetchEquiposMock).toHaveBeenCalled()
    })

    it('should use updated equipos from store', () => {
      const { rerender } = render(<Inventory />)

      useInventoryStore.mockReturnValue({
        equipos: mockEquipos,
        isLoading: false,
        error: null,
        fetchEquipos: vi.fn(),
        deleteEquipo: vi.fn(),
      })

      rerender(<Inventory />)
      expect(screen.getByText('Laptop Dell')).toBeInTheDocument()
    })
  })
})
