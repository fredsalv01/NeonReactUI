import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export const PublicEquipoPage = () => {
  const { id } = useParams()
  const [equipo, setEquipo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      // ponytail: RPC con columnas fijas (ver migración fn_equipo_publico).
      // Ficha pública = info general. Nada de stock, precios ni almacenes.
      const { data, error } = await supabase
        .rpc('fn_equipo_publico', { p_id: id })
        .maybeSingle()
      if (cancelled) return
      setError(!!error)
      setEquipo(error ? null : data)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [id])

  return (
    <div className="min-h-screen bg-gs-bg text-gs-text font-['Syne'] flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 border-b border-gs-border bg-gs-surface/40 backdrop-blur">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-gs-accent font-bold tracking-wider text-sm">GEOSTOCK</p>
            <p className="text-[10px] text-gs-muted font-['DM_Mono'] uppercase">Ficha de producto</p>
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
            No se pudo cargar la ficha del producto. Intenta de nuevo.
          </div>
        )}

        {!loading && !error && !equipo && (
          <div className="text-center mt-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gs-soft text-lg">Producto no encontrado</p>
            <p className="text-gs-muted text-xs mt-2 font-['DM_Mono']">Código: {id}</p>
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
            </div>

            {equipo.descripcion && (
              <div>
                <p className="text-[11px] font-['DM_Mono'] uppercase text-gs-soft mb-2 tracking-wider">
                  Descripción
                </p>
                <p className="text-sm text-gs-text/90 leading-relaxed">{equipo.descripcion}</p>
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
