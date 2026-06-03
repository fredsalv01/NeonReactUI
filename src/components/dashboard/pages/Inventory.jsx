import { EmptyState } from '../../ui'

export const Inventory = () => {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-8">
        Inventory
      </h1>
      <EmptyState
        icon="box"
        title="No Items Yet"
        description="Start by adding your first equipment to the inventory"
      />
    </div>
  )
}
