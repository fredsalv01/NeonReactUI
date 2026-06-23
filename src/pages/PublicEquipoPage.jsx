import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Vista pública móvil-first del equipo. SIN auth, sin precios, sin acciones.
// Apuntar el QR a /p/equipo/:id desde la generación.
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
        .select('id, nombre, tipo, descripcion, serie, estado, imagen_url, stock_total, active')
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

  return (
    <div className="min-h-screen bg-gs-bg text-gs-text font-['Syne'] flex flex-col">
      <header className="px-5 py-4 border-b border-gs-border">
        <p className="text-gs-accent font-bold tracking-wider">GEOSTOCK</p>
        <p className="text-[10px] text-gs-muted font-['DM_Mono'] uppercase">Vista pública</p>
      </header>

      <main className="flex-1 px-5 py-6 max-w-md mx-auto w-full">
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="aspect-square w-full bg-gs-surface rounded-xl" />
            <div className="h-6 bg-gs-surface rounded w-2/3" />
            <div className="h-4 bg-gs-surface rounded w-1/3" />
          </div>
        )}

        {!loading && error && (
          <div className="text-gs-danger bg-gs-danger/10 border border-gs-danger/25 rounded-lg p-4 text-sm">
            No se pudo cargar el equipo: {error}
          </div>
        )}

        {!loading && !error && !equipo && (
          <div className="text-center mt-12">
            <p className="text-gs-soft text-lg">Equipo no encontrado.</p>
            <p className="text-gs-muted text-xs mt-2 font-['DM_Mono']">ID: {id}</p>
          </div>
        )}

        {!loading && equipo && (
          <div className="space-y-5">
            <div className="aspect-square w-full bg-gs-surface rounded-xl overflow-hidden border border-gs-border flex items-center justify-center">
              {equipo.imagen_url ? (
                <img src={equipo.imagen_url} alt={equipo.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gs-muted font-['DM_Mono'] text-xs">Sin imagen</span>
              )}
            </div>

            <div>
              <p className="text-[10px] font-['DM_Mono'] uppercase text-gs-muted tracking-wider">{equipo.tipo}</p>
              <h1 className="text-2xl font-bold text-gs-text mt-1 leading-tight">{equipo.nombre}</h1>
              <p className="text-[11px] font-['DM_Mono'] text-gs-soft mt-1">ID: {equipo.id}</p>
            </div>

            {equipo.descripcion && (
              <div>
                <p className="text-[11px] font-['DM_Mono'] uppercase text-gs-soft mb-1">Descripción</p>
                <p className="text-sm text-gs-text/90 leading-relaxed">{equipo.descripcion}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gs-surface border border-gs-border rounded-lg">
                <p className="text-[10px] font-['DM_Mono'] uppercase text-gs-muted">Stock</p>
                <p className={`text-lg font-bold mt-1 ${
                  equipo.stock_total === 0 ? 'text-gs-danger'
                  : equipo.stock_total <= 5 ? 'text-yellow-400'
                  : 'text-green-400'
                }`}>
                  {equipo.stock_total ?? 0} unid.
                </p>
              </div>
              {equipo.estado && (
                <div className="p-3 bg-gs-surface border border-gs-border rounded-lg">
                  <p className="text-[10px] font-['DM_Mono'] uppercase text-gs-muted">Estado</p>
                  <p className="text-sm font-semibold mt-1 capitalize">{equipo.estado}</p>
                </div>
              )}
              {equipo.serie && (
                <div className="col-span-2 p-3 bg-gs-surface border border-gs-border rounded-lg">
                  <p className="text-[10px] font-['DM_Mono'] uppercase text-gs-muted">N° Serie</p>
                  <p className="text-sm font-['DM_Mono'] mt-1">{equipo.serie}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="px-5 py-3 text-[10px] text-center text-gs-muted font-['DM_Mono'] border-t border-gs-border">
        Geotop Perú S.A.C. · GeoStock
      </footer>
    </div>
  )
}
