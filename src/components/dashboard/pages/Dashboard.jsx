import { useAuth } from '../../../hooks/useAuth'
import { StatCard } from '../../ui'

export const Dashboard = () => {
  const { profile } = useAuth()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-2">
          ¡Bienvenido, {profile?.nombre}!
        </h1>
        <p className="text-gs-soft">
          Rol: <span className="font-semibold text-gs-accent">{profile?.roles?.nombre || 'N/D'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Equipos"
          value="245"
          change="+12%"
          icon="box"
        />
        <StatCard
          title="Total Ventas"
          value="1,234"
          change="+8%"
          icon="chart"
        />
        <StatCard
          title="En Stock"
          value="856"
          change="+5%"
          icon="inbox"
        />
        <StatCard
          title="Usuarios"
          value="42"
          change="+2%"
          icon="users"
        />
      </div>

      <div className="mt-8">
        <div className="bg-gs-surface rounded-xl p-4 md:p-6 border border-gs-border">
          <h2 className="text-lg font-semibold text-gs-text mb-4">
            Guía de Inicio Rápido
          </h2>
          <ul className="space-y-2 text-gs-soft text-sm">
            <li>✓ Ve a Inventario para gestionar tus equipos</li>
            <li>✓ Revisa Ventas para el historial de transacciones</li>
            <li>✓ Consulta Reportes para analíticas detalladas</li>
            <li>✓ Actualiza Configuración para preferencias de cuenta</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
