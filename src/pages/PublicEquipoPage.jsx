import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Badge } from '../components/ui'
import { getStockEstado } from '../lib/constants/inventoryConstants'

export const PublicEquipoPage = () => {
  const { id } = useParams()
  const [equipo, setEquipo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('v_equipos_con_stock')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .maybeSingle()
      if (cancelled) return
      if (error) setError(error.message)
      else setEquipo(data)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [id])

  const almacenes = Array.isArray(equipo?.stock_por_almacen) ? equipo.stock_por_almacen : []
  const stockEstado = equipo ? getStockEstado(equipo.stock_total ?? 0) : null

  return (
    <div className="min-h-screen bg-gs-bg text-gs-text font-['Syne'] flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 border-b border-gs-border bg-gs-surface/40 backdrop-blur">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-gs-accent font-bold tracking-wider text-sm">GEOSTOCK</p>
            <p className="text-[10px] text-gs-muted font-['DM_Mono'] uppercase">Ficha pública</p>
          </div>
          <span className="text-[10px] font-['DM_Mono'] text-gs-muted">Geotop Perú</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-md mx-auto w-full">
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="aspect-square w-full bg-gs-surface rounded-2xl" />
            <div className="h-7 bg-gs-surface rounded w-2/3" />
            <div className="h-4 bg-gs-surface rounded w-1/3" />
            <div className="h-24 bg-gs-surface rounded-xl" />
          </div>
        )}

        {!loading && error && (
          <div className="text-gs-danger bg-gs-danger/10 border border-gs-danger/25 rounded-xl p-4 text-sm">
            No se pudo cargar el equipo: {error}
          </div>
        )}

        {!loading && !error && !equipo && (
          <div className="text-center mt-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gs-soft text-lg">Equipo no encontrado</p>
            <p className="text-gs-muted text-xs mt-2 font-['DM_Mono']">ID: {id}</p>
          </div>
        )}

        {!loading && equipo && (
          <div className="space-y-5">
            {/* Hero */}
            <div className="relative aspect-square w-full bg-gs-surface rounded-2xl overflow-hidden border border-gs-border">
              {equipo.imagen_url ? (
                <img src={equipo.imagen_url} alt={equipo.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gs-muted font-['DM_Mono'] text-xs">
                  Sin imagen
                </div>
              )}
              {/* Floating ID chip */}
              <div className="absolute top-3 left-3 bg-gs-bg/85 backdrop-blur px-3 py-1 rounded-full border border-gs-border">
                <p className="text-[10px] font-['DM_Mono'] text-gs-soft">{equipo.id}</p>
              </div>
            </div>

            {/* Title block */}
            <div className="space-y-2">
              <p className="text-[10px] font-['DM_Mono'] uppercase text-gs-accent tracking-[1.5px]">
                {equipo.tipo || 'Equipo'}
              </p>
              <h1 className="text-2xl font-bold text-gs-text leading-tight">{equipo.nombre}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                {stockEstado && <Badge estado={stockEstado} />}
                {equipo.estado && <Badge estado={equipo.estado} />}
              </div>
            </div>

            {/* Stock total card */}
            <div className="p-4 bg-gs-surface border border-gs-border rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-['DM_Mono'] uppercase text-gs-muted tracking-wider">Stock disponible</p>
                <p className={`text-3xl font-bold font-['DM_Mono'] mt-1 ${
                  (equipo.stock_total ?? 0) === 0 ? 'text-gs-danger'
                  : (equipo.stock_total ?? 0) <= 5 ? 'text-yellow-400'
                  : 'text-green-400'
                }`}>
                  {equipo.stock_total ?? 0}
                </p>
              </div>
              <p className="text-xs text-gs-muted font-['DM_Mono']">unidades</p>
            </div>

            {/* Almacenes breakdown */}
            {almacenes.length > 0 && (
              <div>
                <p className="text-[11px] font-['DM_Mono'] uppercase text-gs-soft mb-2 tracking-wider">
                  Distribución por almacén
                </p>
                <div className="space-y-2">
                  {almacenes.map((a) => (
                    <div
                      key={a.almacen_id}
                      className="flex items-center justify-between p-3 bg-gs-surface border border-gs-border rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gs-accent text-base">📦</span>
                        <p className="text-sm font-semibold text-gs-text truncate">{a.almacen_nombre}</p>
                      </div>
                      <p className={`text-sm font-bold font-['DM_Mono'] ${
                        a.cantidad === 0 ? 'text-gs-danger'
                        : a.cantidad <= (a.stock_minimo || 5) ? 'text-yellow-400'
                        : 'text-green-400'
                      }`}>
                        {a.cantidad} unid.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción */}
            {equipo.descripcion && (
              <div>
                <p className="text-[11px] font-['DM_Mono'] uppercase text-gs-soft mb-2 tracking-wider">
                  Descripción
                </p>
                <p className="text-sm text-gs-text/90 leading-relaxed">{equipo.descripcion}</p>
              </div>
            )}

            {/* Datos técnicos */}
            {equipo.serie && (
              <div className="p-3 bg-gs-surface border border-gs-border rounded-lg">
                <p className="text-[10px] font-['DM_Mono'] uppercase text-gs-muted">N° Serie</p>
                <p className="text-sm font-['DM_Mono'] mt-1 text-gs-text">{equipo.serie}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="px-5 py-4 text-[10px] text-center text-gs-muted font-['DM_Mono'] border-t border-gs-border">
        Geotop Perú S.A.C. · GeoStock
      </footer>
    </div>
  )
}
