import { useAuth } from '../../../hooks/useAuth'

export const Settings = () => {
  const { profile } = useAuth()

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-8">
        Configuración
      </h1>

      <div className="max-w-2xl">
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
                {profile?.active ? (
                  <span className="text-gs-accent">Activo</span>
                ) : (
                  <span className="text-gs-danger">Inactivo</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
