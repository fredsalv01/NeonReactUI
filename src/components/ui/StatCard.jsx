import Icon from './Icon'

/**
 * Molecule: StatCard
 * Tarjeta de estadística con ícono, valor y etiqueta.
 */

/**
 * @param {{
 *   label: string,
 *   value: string|number,
 *   icon: string,
 *   color?: string,
 *   sub?: string,
 * }} props
 */
const StatCard = ({ label, value, icon, color = '#00C9A7', sub }) => (
  <div className="card animate-fade-in p-5 flex gap-4 items-center relative overflow-hidden">
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${color}18` }}
    >
      <Icon name={icon} size={20} color={color} />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gs-text leading-none">{value}</p>
      <p className="text-xs text-gs-soft mt-1">{label}</p>
      {sub && (
        <p className="text-[11px] font-mono mt-0.5" style={{ color }}>
          {sub}
        </p>
      )}
    </div>
    <div
      className="absolute -right-2 -top-2 w-16 h-16 rounded-full"
      style={{ background: `${color}08` }}
    />
  </div>
)

export default StatCard
