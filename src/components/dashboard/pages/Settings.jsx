import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { configService } from '../../../lib/services/configService'
import { Button, useToast } from '../../ui'

const FIELDS = [
  { key: 'empresa_razon_social', label: 'Razón social' },
  { key: 'empresa_ruc',          label: 'RUC' },
  { key: 'empresa_direccion',    label: 'Dirección' },
  { key: 'empresa_telefono',     label: 'Teléfono comercial' },
  { key: 'empresa_email',        label: 'Email comercial', type: 'email' },
  { key: 'boleta_pie',           label: 'Pie de boleta', textarea: true },
]

export const Settings = () => {
  const { profile } = useAuth()
  const { toast } = useToast()
  const isAdmin = profile?.roles?.nombre === 'Administrador'

  const [values, setValues] = useState({})
  const [initial, setInitial] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    configService.getAll()
      .then(c => { setValues(c.map); setInitial(c.map) })
      .catch(e => toast?.error?.(e.message || 'No se pudo cargar configuración'))
      .finally(() => setLoading(false))
  }, [toast])

  const dirty = FIELDS.some(f => (values[f.key] ?? '') !== (initial[f.key] ?? ''))

  const onSave = async () => {
    setSaving(true)
    try {
      const updates = {}
      for (const f of FIELDS) {
        if ((values[f.key] ?? '') !== (initial[f.key] ?? '')) {
          updates[f.key] = values[f.key] ?? ''
        }
      }
      const fresh = await configService.setMany(updates)
      setInitial(fresh.map)
      toast?.success?.('Configuración guardada')
    } catch (e) {
      toast?.error?.(e.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-8">
        Configuración
      </h1>

      <div className="max-w-2xl space-y-6">
        <div className="bg-gs-surface rounded-xl p-6 border border-gs-border">
          <h2 className="text-lg font-semibold text-gs-text mb-6">
            Información de la Cuenta
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                Nombre Completo
              </label>
              <p className="text-gs-text">{profile?.nombre || 'N/D'}</p>
            </div>
            <div>
              <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                Correo Electrónico
              </label>
              <p className="text-gs-text">{profile?.email || 'N/D'}</p>
            </div>
            <div>
              <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                Rol
              </label>
              <p className="text-gs-text">{profile?.roles?.nombre || 'N/D'}</p>
            </div>
            <div>
              <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                Estado
              </label>
              <p className="text-gs-text">
                {profile?.active
                  ? <span className="text-gs-accent">Activo</span>
                  : <span className="text-gs-danger">Inactivo</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gs-surface rounded-xl p-6 border border-gs-border">
          <h2 className="text-lg font-semibold text-gs-text mb-1">
            Datos de la Empresa
          </h2>
          <p className="text-[12px] text-gs-soft mb-6">
            Aparecen en boletas y documentos generados por el sistema.
          </p>

          {loading ? (
            <p className="text-gs-soft text-sm">Cargando…</p>
          ) : (
            <div className="space-y-4">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                    {f.label}
                  </label>
                  {f.textarea ? (
                    <textarea
                      rows={2}
                      disabled={!isAdmin}
                      value={values[f.key] ?? ''}
                      onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text focus:outline-none focus:border-gs-accent disabled:opacity-60"
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      disabled={!isAdmin}
                      value={values[f.key] ?? ''}
                      onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text focus:outline-none focus:border-gs-accent disabled:opacity-60"
                    />
                  )}
                </div>
              ))}

              {isAdmin ? (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    onClick={onSave}
                    disabled={!dirty || saving}
                  >
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                </div>
              ) : (
                <p className="text-[12px] text-gs-soft pt-2">
                  Solo un Administrador puede editar estos datos.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
