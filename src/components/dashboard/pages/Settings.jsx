import { useAuth } from '../../../hooks/useAuth'

export const Settings = () => {
  const { profile } = useAuth()

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-8">
        Settings
      </h1>

      <div className="max-w-2xl">
        <div className="bg-gs-surface rounded-xl p-6 border border-gs-border">
          <h2 className="text-lg font-semibold text-gs-text mb-6">
            Account Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                Full Name
              </label>
              <p className="text-gs-text">{profile?.nombre || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                Email
              </label>
              <p className="text-gs-text">{profile?.email || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                Role
              </label>
              <p className="text-gs-text">{profile?.roles?.nombre || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                Status
              </label>
              <p className="text-gs-text">
                {profile?.active ? (
                  <span className="text-gs-accent">Active</span>
                ) : (
                  <span className="text-gs-danger">Inactive</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
