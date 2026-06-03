import { EmptyState } from '../../ui'

export const Sales = () => {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-8">
        Sales
      </h1>
      <EmptyState
        icon="chart"
        title="No Sales Yet"
        description="Sales transactions will appear here once they are created"
      />
    </div>
  )
}
