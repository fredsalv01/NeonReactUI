/**
 * Atom: InputField
 * Campo de formulario con label, validación y mensaje de error.
 */

/**
 * @param {{
 *   label: string,
 *   error?: string,
 *   children: React.ReactNode,
 * }} props
 */
const InputField = ({ label, error, children }) => (
  <div className="mb-4">
    <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-1.5">
      {label}
    </label>
    {children}
    {error && (
      <p className="err-msg mt-1 text-[11px] text-gs-danger font-mono">
        ⚠ {error}
      </p>
    )}
  </div>
)

export default InputField
