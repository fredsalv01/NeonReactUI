import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { humanizeError } from '../../../lib/utils/errors'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Button, useToast, SkeletonBlock, Icon } from '../../ui'
import { reportService } from '../../../lib/services/reportService'
import { kardexReportService } from '../../../lib/services/kardexReportService'
import { useAuth } from '../../../hooks/useAuth'
import { REPORT_SECTIONS, can } from '../../../lib/constants/permissions'
import { FiDownload, FiFileText, FiFileMinus } from 'react-icons/fi'
import html2pdf from 'html2pdf.js'

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

export const Reports = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { userRole } = useAuth()
  const show = (key) => can(userRole, REPORT_SECTIONS[key])

  // States
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [monthlySales, setMonthlySales] = useState([])
  const [categoriesBreakdown, setCategoriesBreakdown] = useState([])
  const [inventoryStatus, setInventoryStatus] = useState([])
  const [topSellingProducts, setTopSellingProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [error, setError] = useState(null)

  // Load all report data
  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [stats, monthly, categories, inventory, topSelling, lowStock] = await Promise.all([
        reportService.getSalesStatistics(),
        reportService.getMonthlySalesData(6),
        reportService.getCategoriesBreakdown(),
        reportService.getInventoryStatusBreakdown(),
        reportService.getTopSellingProducts(5),
        reportService.getLowStockProducts(10, 5),
      ])

      setStats(stats)
      setMonthlySales(monthly)
      setCategoriesBreakdown(categories)
      setInventoryStatus(inventory)
      setTopSellingProducts(topSelling)
      setLowStockProducts(lowStock)
    } catch (err) {
      setError(err.message)
      toast.error(humanizeError(err, 'No se pudieron cargar los reportes'))
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = async () => {
    try {
      const element = document.getElementById('reports-content')
      const opt = {
        margin: 10,
        filename: `reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }
      html2pdf().set(opt).from(element).save()
      toast.success('Reporte exportado a PDF')
    } catch (err) {
      toast.error(humanizeError(err, 'No se pudo exportar el PDF'))
    }
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-8">Reportes</h1>
        <div className="bg-gs-danger/10 border border-gs-danger/25 rounded-lg p-4 text-gs-danger">
          Error al cargar los reportes: {error}
        </div>
      </div>
    )
  }

  return (
    <div id="reports-content">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-2">Reportes</h1>
          <p className="text-gs-soft">Análisis completo de ventas e inventario</p>
        </div>
        {show('exportPdf') && (
          <Button
            variant="primary"
            onClick={exportToPDF}
            disabled={isLoading}
            className="flex items-center gap-2 w-full md:w-auto h-fit"
          >
            <FiDownload size={18} />
            Exportar a PDF
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {show('statVentas')   && <StatCard label="N° Ventas"        value={stats.totalVentas} icon="shopping-cart" />}
          {show('statMonto')    && <StatCard label="Monto Vendido"    value={`$${stats.totalMontoVentas.toFixed(2)}`} icon="dollar" />}
          {show('statCantidad') && <StatCard label="Cantidad Vendida" value={stats.totalCantidad} icon="box" />}
          {show('statValor')    && <StatCard label="Valor Inventario" value={`$${stats.totalInventarioValue.toFixed(2)}`} icon="inbox" />}
        </div>
      ) : null}

      {/* Charts */}
      <div className="space-y-6">
        {/* Area Chart - Monthly Sales */}
        {show('monthlySales') && (
          isLoading ? (
            <SkeletonBlock className="h-80 rounded-lg" />
          ) : (
            <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold text-gs-text mb-4">Ventas Mensual</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlySales}>
                  <defs>
                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mes" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="monto" stroke="#8884d8" fillOpacity={1} fill="url(#colorMonto)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        )}

        {/* Two Column Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Breakdown - Pie */}
          {show('categoriesPie') && (
            isLoading ? (
              <SkeletonBlock className="h-80 rounded-lg" />
            ) : (
              <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6">
                <h2 className="text-xl font-bold text-gs-text mb-4">Ventas por Categoría</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoriesBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoriesBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )
          )}

          {/* Inventory Status - Donut */}
          {show('inventoryStatus') && (
            isLoading ? (
              <SkeletonBlock className="h-80 rounded-lg" />
            ) : (
              <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6">
                <h2 className="text-xl font-bold text-gs-text mb-4">Porcentaje de disponibilidad de stock</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={inventoryStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={80}
                      innerRadius={50}
                      fill="#82ca9d"
                      dataKey="value"
                    >
                      {inventoryStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, _name, item) => [`${value} equipo(s) — ${item?.payload?.percent ?? 0}%`, item?.payload?.name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )
          )}
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock — primero, es accionable */}
          {show('lowStockTable') && (
          isLoading ? (
            <SkeletonBlock className="h-80 rounded-lg" />
          ) : (
            <div className="bg-gs-surface border-2 border-gs-danger/40 rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold text-gs-danger mb-4 flex items-center gap-2">
                <span aria-hidden>⚠</span> Requiere reposición
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gs-border">
                      <th className="text-left py-2 px-2 font-semibold text-gs-soft">#</th>
                      <th className="text-left py-2 px-2 font-semibold text-gs-soft">Producto</th>
                      <th className="text-center py-2 px-2 font-semibold text-gs-soft">Stock</th>
                      <th className="text-right py-2 px-2 font-semibold text-gs-soft">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gs-soft text-sm">
                          Sin alertas de stock por el momento.
                        </td>
                      </tr>
                    ) : lowStockProducts.map((product, idx) => (
                      <tr key={product.id} className="border-b border-gs-border hover:bg-gs-bg transition">
                        <td className="py-3 px-2 text-gs-text font-semibold">{idx + 1}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {product.imagen_url ? (
                              <img src={product.imagen_url} alt={product.nombre} className="w-8 h-8 rounded object-cover" />
                            ) : (
                              <div className="w-8 h-8 bg-gs-border rounded" />
                            )}
                            <div>
                              <p className="font-medium text-gs-text">{product.nombre}</p>
                              <p className="text-xs text-gs-soft">{product.tipo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            product.stock_total <= 3 ? 'bg-gs-danger/20 text-gs-danger' :
                            product.stock_total <= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {product.stock_total}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-gs-accent font-bold">
                          ${(product.stock_total * product.precio_venta).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
          )}

          {/* Top Selling Products */}
          {show('topSelling') && (
          isLoading ? (
            <SkeletonBlock className="h-80 rounded-lg" />
          ) : (
            <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-bold text-gs-text mb-4">Top 5 Productos Más Vendidos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gs-border">
                      <th className="text-left py-2 px-2 font-semibold text-gs-soft">#</th>
                      <th className="text-left py-2 px-2 font-semibold text-gs-soft">Producto</th>
                      <th className="text-right py-2 px-2 font-semibold text-gs-soft">Cantidad</th>
                      <th className="text-right py-2 px-2 font-semibold text-gs-soft">Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map((product, idx) => (
                      <tr key={product.equipo_id} className="border-b border-gs-border hover:bg-gs-bg transition">
                        <td className="py-3 px-2 text-gs-text font-semibold">{idx + 1}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {product.imagen_url ? (
                              <img src={product.imagen_url} alt={product.nombre} className="w-8 h-8 rounded object-cover" />
                            ) : (
                              <div className="w-8 h-8 bg-gs-border rounded" />
                            )}
                            <div>
                              <p className="font-medium text-gs-text">{product.nombre}</p>
                              <p className="text-xs text-gs-soft">{product.tipo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right text-gs-accent font-bold">{product.total_cantidad}</td>
                        <td className="py-3 px-2 text-right text-gs-soft">{product.total_ventas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
          )}

          {/* Reporte Kardex (Excel/CSV) — Admin + Almacén */}
          {show('kardexReport') && (
            <KardexReportCard />
          )}

          {/* Cotizaciones — acceso rápido para Ventas */}
          {show('cotizaciones') && (
            <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gs-text mb-2 flex items-center gap-2">
                  <FiFileText size={20} /> Cotizaciones
                </h2>
                <p className="text-sm text-gs-soft mb-4">
                  Revisa el estado de las cotizaciones recientes y conviértelas en ventas.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate('/dashboard/cotizaciones')}
                className="flex items-center gap-2 w-fit"
              >
                Ir a Cotizaciones
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

const KardexReportCard = () => {
  const { toast } = useToast()
  const today = new Date().toISOString().slice(0, 10)
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [from, setFrom] = useState(monthAgo)
  const [to, setTo] = useState(today)
  const [generating, setGenerating] = useState(null) // 'xlsx' | 'csv' | null

  const handleGenerate = async (format) => {
    setGenerating(format)
    try {
      const result = await kardexReportService.generate({ from, to, format })
      toast.success(`Reporte generado (${result.rowCount} movimientos). Descarga iniciada.`)
    } catch (err) {
      toast.error(humanizeError(err, 'No se pudo generar el reporte'))
    } finally {
      setGenerating(null)
    }
  }

  const invalid = !from || !to || from > to

  return (
    <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6 flex flex-col gap-4 lg:col-span-2">
      <div>
        <h2 className="text-xl font-bold text-gs-text mb-1 flex items-center gap-2">
          <FiFileMinus size={20} /> Reporte de Kardex
        </h2>
        <p className="text-sm text-gs-soft">
          Exporta los movimientos del kardex (compras, ventas y movimientos manuales) por almacén
          en formato Excel o CSV. El archivo queda guardado en el bucket privado de reportes y
          se descarga al instante.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-1">
            Desde
          </label>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text focus:outline-none focus:border-gs-accent"
          />
        </div>
        <div>
          <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={to}
            min={from || undefined}
            max={today}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text focus:outline-none focus:border-gs-accent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => handleGenerate('xlsx')}
          disabled={invalid || generating !== null}
          className="flex items-center gap-2"
        >
          <FiDownload size={16} />
          {generating === 'xlsx' ? 'Generando…' : 'Descargar Excel (.xlsx)'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleGenerate('csv')}
          disabled={invalid || generating !== null}
          className="flex items-center gap-2 border border-gs-border"
        >
          <FiDownload size={16} />
          {generating === 'csv' ? 'Generando…' : 'Descargar CSV'}
        </Button>
      </div>

      {invalid && (
        <p className="text-[12px] text-gs-danger">El rango de fechas es inválido.</p>
      )}
    </div>
  )
}

const StatCard = ({ label, value, icon }) => (
  <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gs-soft text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-gs-text mt-2">{value}</p>
      </div>
      <div className="p-3 bg-gs-accent/10 rounded-lg">
        <Icon name={icon} size={24} color="var(--gs-accent)" />
      </div>
    </div>
  </div>
)
