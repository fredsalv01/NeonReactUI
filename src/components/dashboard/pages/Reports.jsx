import { EmptyState } from '../../ui'

export const Reports = () => {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-8">
        Reports
      </h1>
      <EmptyState
        icon="file"
        title="No Reports Available"
        description="Generate reports to analyze your business data"
      />
    </div>
  )
}
