/**
 * Molecule: EmptyState
 * Polished "nothing here" placeholder with icon, title, description, and optional CTA.
 * Sizes: 'sm' | 'md' | 'lg'
 * Built-in presets: 'no-results' | 'no-data' | 'no-connection' | 'empty'
 */

import Icon from './Icon'

const SIZES = {
  sm: { wrap: 'py-8  px-4', iconBox: 'w-10 h-10', iconSize: 18, title: 'text-sm',  desc: 'text-xs'  },
  md: { wrap: 'py-12 px-6', iconBox: 'w-16 h-16', iconSize: 26, title: 'text-base',desc: 'text-[13px]' },
  lg: { wrap: 'py-16 px-8', iconBox: 'w-20 h-20', iconSize: 34, title: 'text-xl', desc: 'text-sm'  },
}

const PRESETS = {
  'no-results':    { icon: 'search',   title: 'No results found',    description: 'Try adjusting your search or filter criteria.' },
  'no-data':       { icon: 'inbox',    title: 'Nothing here yet',     description: 'Add your first item to get started.' },
  'no-connection': { icon: 'wifi',     title: 'Connection lost',      description: 'Unable to load data. Check your connection and try again.' },
  'empty':         { icon: 'box',      title: 'Empty',                description: 'There are no items matching your current view.' },
}

/**
 * @param {{
 *   preset?:      'no-results'|'no-data'|'no-connection'|'empty',
 *   icon?:        string,
 *   title?:       string,
 *   description?: string,
 *   action?:      React.ReactNode,
 *   size?:        'sm'|'md'|'lg',
 *   color?:       string,
 *   className?:   string,
 * }} props
 */
const EmptyState = ({
  preset,
  icon,
  title,
  description,
  action,
  size      = 'md',
  color     = 'var(--gs-accent)',
  className = '',
}) => {
  const p = preset ? (PRESETS[preset] ?? {}) : {}
  const s = SIZES[size] ?? SIZES.md

  const resolvedIcon  = icon        ?? p.icon        ?? 'box'
  const resolvedTitle = title       ?? p.title       ?? 'Nothing here'
  const resolvedDesc  = description ?? p.description

  return (
    <div
      className={`flex flex-col items-center text-center ${s.wrap} ${className}`}
      role="status"
      aria-label={resolvedTitle}
    >
      {/* Icon wrapper */}
      <div
        className={`${s.iconBox} rounded-2xl flex items-center justify-center mb-4 relative shrink-0`}
        style={{
          '--c':      color,
          background: 'color-mix(in srgb, var(--c) 8%, var(--gs-surface))',
          border:     '1px solid color-mix(in srgb, var(--c) 20%, transparent)',
          boxShadow:  '0 0 32px color-mix(in srgb, var(--c) 10%, transparent)',
        }}
      >
        <Icon name={resolvedIcon} size={s.iconSize} color={color} />
      </div>

      {/* Text */}
      <h3
        className={`${s.title} font-bold text-gs-text font-['Syne'] leading-snug mb-1.5`}
      >
        {resolvedTitle}
      </h3>

      {resolvedDesc && (
        <p
          className={`${s.desc} text-gs-soft font-['DM_Mono'] max-w-xs leading-relaxed`}
          style={{ marginBottom: action ? '1.25rem' : 0 }}
        >
          {resolvedDesc}
        </p>
      )}

      {/* CTA */}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default EmptyState
