/**
 * NeonReactUI — PasswordStrength
 * Visual password strength indicator (4-bar).
 * No external deps — strength logic is inlined.
 */

const calcStrength = (pwd) => {
  if (!pwd) return 0
  let s = 0
  if (pwd.length >= 8)            s++
  if (pwd.length >= 12)           s++
  if (/[A-Z]/.test(pwd))         s++
  if (/[0-9]/.test(pwd))         s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return Math.min(4, Math.ceil(s * 4 / 5))
}

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const COLORS = ['', '#EF4444', '#F59E0B', '#F59E0B', '#00C9A7']

const PasswordStrength = ({ password }) => {
  if (!password) return null
  const level = calcStrength(password)
  const color = COLORS[level]
  const label = LABELS[level]

  return (
    <div className="mt-[-10px] mb-4">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-sm transition-all duration-300"
            style={{ background: level >= i ? color : '#232837' }}
          />
        ))}
      </div>
      <p className="text-[10px] font-mono" style={{ color }}>
        Strength: {label}
      </p>
    </div>
  )
}

export default PasswordStrength
