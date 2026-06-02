# NeonReactUI

> A reusable dark-neon React component library built with **Vite 5**, **React 18**, and **Tailwind CSS 3**.  
> Drop it into any project — not tied to any specific product or domain.

**Version:** 1.0.4 · **Updated:** 2026-06-02

---

## Quick Start

```bash
npm install       # install dependencies
npm run dev       # start dev server  →  http://localhost:5173
npm run build     # production build  →  dist/
npm run preview   # preview prod build
```

---

## Design System

### Color Tokens

All tokens are available as Tailwind classes (`bg-gs-accent`, `text-gs-soft`, …) **and** as CSS custom properties (`var(--gs-accent)`, …).

| Token | Value | Use |
|---|---|---|
| `--gs-bg` | `#0D0F14` | Page background |
| `--gs-surface` | `#13161E` | Section surfaces |
| `--gs-card` | `#181C26` | Card backgrounds |
| `--gs-border` | `#232837` | Borders, dividers |
| `--gs-accent` | `#00C9A7` | Primary neon green |
| `--gs-teal` | `#0EA5E9` | Secondary blue |
| `--gs-warn` | `#F59E0B` | Warning amber |
| `--gs-danger` | `#EF4444` | Danger red |
| `--gs-text` | `#E2E8F0` | Primary text |
| `--gs-soft` | `#94A3B8` | Secondary text |
| `--gs-muted` | `#4A5568` | Muted / disabled |

### Typography

| Usage | Font | Class |
|---|---|---|
| UI text, headings | Syne | `font-['Syne']` / `font-syne` |
| Monospace, IDs, code | DM Mono | `font-['DM_Mono']` / `font-mono` |

### Animations

| Class | Keyframe | Duration |
|---|---|---|
| `animate-fade-in` | fadeIn (Y+10 → Y0) | 350ms ease |
| `animate-slide-up` | slideUp (Y+16 → Y0) | 300ms ease |
| `animate-slide-in` | slideIn (X-14 → X0) | 300ms ease |
| `animate-pulse` | opacity 1 → 0.4 → 1 | 1.8s |
| `animate-dots-b` | scale bounce (dots) | 1.2s |
| `animate-bars-w` | scaleY wave (bars) | 1.1s |
| `animate-ring-e` | scale + fade (pulse rings) | 1.4s |

---

## Component Reference

### Button

```jsx
import { Button } from './components/ui'

<Button variant="primary">Save</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="primary" disabled>Disabled</Button>
```

| Prop | Type | Default |
|---|---|---|
| `variant` | `'primary' \| 'ghost' \| 'danger'` | `'primary'` |
| `disabled` | `boolean` | `false` |
| `onClick` | `() => void` | — |
| `type` | `string` | `'button'` |
| `className` | `string` | `''` |

---

### Badge

Status badge for equipment estado values.

```jsx
import { Badge } from './components/ui'

<Badge estado="Disponible" />     // green
<Badge estado="En uso" />         // amber
<Badge estado="Mantenimiento" />  // red
<Badge estado="Baja" />           // muted
```

---

### Icon

Inline SVG icon from the built-in library.

```jsx
import { Icon } from './components/ui'

<Icon name="box" size={20} color="var(--gs-accent)" />
```

**Available names:** `box`, `chart`, `qr`, `users`, `logout`, `plus`, `edit`, `trash`, `search`, `download`, `upload`, `eye`, `eyeOff`, `alert`, `check`, `bell`, `compass`, `trophy`, `tag`, `menu`, `image`, `filter`, `close`, `lock`, `key`, `grip`, `file`

| Prop | Type | Default |
|---|---|---|
| `name` | `string` | `'box'` |
| `size` | `number` | `16` |
| `color` | `string` | `'currentColor'` |

---

### Spinner

Five animated loading variants, all neon-glow styled.

```jsx
import { Spinner } from './components/ui'

<Spinner />                                            // ring, 20px, accent
<Spinner variant="dots"  size={28} color="var(--gs-teal)" />
<Spinner variant="bars"  size={32} color="var(--gs-warn)" />
<Spinner variant="orbit" size={36} color="var(--gs-danger)" label="Syncing…" />
<Spinner variant="pulse" size={40} thickness={3} />
```

| Prop | Type | Default |
|---|---|---|
| `variant` | `'ring' \| 'dots' \| 'bars' \| 'orbit' \| 'pulse'` | `'ring'` |
| `size` | `number` | `20` |
| `color` | `string` | `'#00C9A7'` |
| `thickness` | `number` | `2` |
| `label` | `string` | — |

**Variant details**

| Variant | Technique |
|---|---|
| `ring` | Conic-gradient arc + CSS mask + neon `drop-shadow` |
| `dots` | 3 dots — `scale + opacity` bounce, staggered 180ms |
| `bars` | 4 bars — `scaleY` wave, staggered 130ms |
| `orbit` | Dim track ring + glowing dot orbiting via rotate |
| `pulse` | 2 concentric rings expanding from glowing center dot |

---

### InputField

Label + children slot + error message wrapper.

```jsx
import { InputField } from './components/ui'

<InputField label="Equipment Name *" error="Required">
  <input type="text" placeholder="e.g., Leica TS16" />
</InputField>
```

---

### SearchBar

Search input with integrated icon.

```jsx
import { SearchBar } from './components/ui'

<SearchBar
  value={query}
  onChange={setQuery}
  placeholder="Search by name or ID…"
  className="w-72"
/>
```

---

### Select

Autocomplete combobox — single or multi-select with full keyboard navigation.

```jsx
import { Select } from './components/ui'

const OPTIONS = [
  { value: 'ts',   label: 'Total Station', meta: '48 units' },
  { value: 'gnss', label: 'GNSS Receiver',  meta: '32 units' },
  { value: 'lev',  label: 'Level',          meta: '27 units' },
]

// Single select
<Select
  options={OPTIONS}
  value={category}
  onChange={setCategory}
  placeholder="Filter by category…"
  label="Category"
/>

// Multi-select with chips
<Select
  options={OPTIONS}
  value={categories}
  onChange={setCategories}
  placeholder="Select categories…"
  multi
  clearable
/>
```

| Prop | Type | Default |
|---|---|---|
| `options` | `{ value, label, meta? }[]` | `[]` |
| `value` | `string \| string[] \| null` | — |
| `onChange` | `(val) => void` | — |
| `placeholder` | `string` | `'Select…'` |
| `label` | `string` | — |
| `multi` | `boolean` | `false` |
| `clearable` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `error` | `string` | — |

**Keyboard shortcuts:** `↓ ↑` navigate · `Enter` select · `Escape` close · `Backspace` remove last chip (multi)

---

### PasswordStrength

Visual 4-bar password strength indicator.

```jsx
import { PasswordStrength } from './components/ui'

<PasswordStrength password={password} />
```

Levels: `Weak` → `Fair` → `Good` → `Strong`, scored on length (8+, 12+), uppercase, digits, and special characters.

---

### StatCard

Dashboard KPI card with neon accent stripe, trend auto-detection, and hover lift.

```jsx
import { StatCard } from './components/ui'

<StatCard
  label="Total Inventory"
  value="142"
  icon="box"
  color="var(--gs-accent)"
  sub="+3 this week"          // auto-detected as trend="up"
/>

<StatCard
  label="Maintenance"
  value="12"
  icon="alert"
  color="var(--gs-danger)"
  sub="Action required"       // plain text (no +/- prefix)
/>

<StatCard
  label="In Use"
  value="34"
  icon="users"
  color="var(--gs-teal)"
  trend="down"                // explicit override
  sub="-2 since yesterday"
/>
```

| Prop | Type | Default |
|---|---|---|
| `label` | `string` | — |
| `value` | `string \| number` | — |
| `icon` | `string` | — |
| `color` | `string` | `'#00C9A7'` |
| `sub` | `string` | — |
| `trend` | `'up' \| 'down'` | auto-detected from `sub` |

Trend is **auto-detected**: `sub` starting with `+` → `up` (green pill), `-` → `down` (red pill), anything else → plain colored text.  
Accepts hex **and** CSS variables (`var(--gs-accent)`) thanks to `color-mix()` for opacity effects.

---

### Pagination

Responsive page navigation. Numbered buttons collapse to a current-page pill on mobile.

```jsx
import { Pagination } from './components/ui'

<Pagination
  page={currentPage}
  totalPages={10}
  total={98}
  onPageChange={setCurrentPage}
/>
```

Returns `null` when `totalPages <= 1`.

---

### Toast / useToast

Global floating notifications via context.

```jsx
// Wrap your app
import { ToastProvider } from './components/ui'
<ToastProvider><App /></ToastProvider>

// Use anywhere inside the tree
import { useToast } from './components/ui'
const { toast } = useToast()

toast.success('Saved successfully')
toast.error('Something went wrong')
toast.info('3 items selected')
const id = toast.loading('Uploading…')
toast.dismiss(id)
```

Types: `success` · `error` · `info` · `loading` (loading toasts don't auto-dismiss).  
On mobile: full-width strip at the bottom. On `sm+`: fixed corner (bottom-right).

---

### Skeleton Loaders

```jsx
import { SkeletonBlock, SkeletonRow, SkeletonCard, SkeletonStat } from './components/ui'

<SkeletonBlock className="h-8 w-3/4" />   // generic animated block
<SkeletonCard />                            // user/item card placeholder
<SkeletonStat />                            // StatCard placeholder
<SkeletonRow cols={6} />                    // DataTable row (used inside <tbody>)
```

---

### Modal

Responsive portal modal with focus trap, Escape-to-close, neon accent stripe, and five variants.

```jsx
import { Modal, Button } from './components/ui'

<Modal
  open={isOpen}
  onClose={() => setOpen(false)}
  title="Confirm Deletion"
  subtitle="This action cannot be undone."
  variant="danger"
  size="sm"
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  <p>Are you sure you want to delete this item?</p>
</Modal>
```

| Prop | Type | Default |
|---|---|---|
| `open` | `boolean` | — |
| `onClose` | `() => void` | — |
| `title` | `string` | — |
| `subtitle` | `string` | — |
| `icon` | `string` | auto from variant |
| `variant` | `'default' \| 'success' \| 'danger' \| 'info' \| 'warn'` | `'default'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `footer` | `ReactNode` | — |

---

### DataTable

Sortable, selectable, fully responsive data table with skeleton loading and empty state.

```jsx
import { DataTable, Badge, Button } from './components/ui'

const columns = [
  { key: 'id',     label: 'ID',       mono: true,  sortable: true },
  { key: 'name',   label: 'Equipment',             sortable: true },
  { key: 'status', label: 'Status',   render: (v) => <Badge estado={v} /> },
  // Hide on small screens:
  { key: 'location', label: 'Location', className: 'hidden md:table-cell' },
]

<DataTable
  columns={columns}
  data={rows}
  loading={false}
  selectable
  onRowClick={(row) => openModal(row)}
  actions={(row) => (
    <>
      <Button variant="ghost"  onClick={() => edit(row)}><Icon name="edit"  size={13} /></Button>
      <Button variant="danger" onClick={() => del(row)}> <Icon name="trash" size={13} /></Button>
    </>
  )}
  emptyMessage="No equipment matches your filters."
/>
```

**Column options**

| Key | Type | Effect |
|---|---|---|
| `key` | `string` | maps to `row[key]` |
| `label` | `string` | header text |
| `sortable` | `boolean` | click-to-sort with asc/desc/off cycle |
| `mono` | `boolean` | DM Mono font for data cells |
| `render` | `(value, row) => ReactNode` | custom cell renderer |
| `className` | `string` | applied to `<th>` and `<td>` (use for responsive hiding) |

---

### ChartPanel

Unified chart panel with library and chart-type selectors. Skinned to the neon design system.

```jsx
import { ChartPanel } from './components/ui'

<ChartPanel />
```

**Selectors:** Library (`Recharts` / `Nivo`) × Type (`Area/Line` / `Bar` / `Pie/Donut`).  
All tooltips, axes, and legends use the `--gs-*` token palette.

| Library | Chart | Data |
|---|---|---|
| Recharts | Area | Inventory trend (6 months) |
| Recharts | Bar | Equipment by category |
| Recharts | Pie | Status distribution (donut) |
| Nivo | Line | Inventory trend with area fill |
| Nivo | Bar | Equipment by category |
| Nivo | Pie | Status distribution |

---

### DropZone

OS file drag-and-drop / click-to-browse upload area with image thumbnails.

```jsx
import { DropZone } from './components/ui'

<DropZone
  accept=".jpg,.png,.pdf,.csv"
  multiple
  maxSizeMB={5}
  onFiles={(files) => uploadFiles(files)}
/>
```

| Prop | Type | Default |
|---|---|---|
| `onFiles` | `(files: File[]) => void` | — |
| `accept` | `string` | — |
| `multiple` | `boolean` | `true` |
| `maxSizeMB` | `number` | `10` |
| `label` | `string` | `'Drop files here or click to browse'` |

Dropped image files show a 40×40 thumbnail with `object-cover`. Non-images show a colored ext badge. Files over `maxSizeMB` are rejected with an inline error.

---

### SortableList

Drag-to-reorder list with Trello-style FLIP animation. Uses pointer events — no library needed.

```jsx
import { SortableList, Badge } from './components/ui'

const [items, setItems] = useState(myList)

<SortableList
  items={items}
  keyExtractor={(item) => item.id}
  onChange={setItems}
  renderItem={(item) => (
    <div className="flex items-center gap-3">
      <span className="flex-1">{item.name}</span>
      <Badge estado={item.status} />
    </div>
  )}
/>
```

**Animation:** Pointer events control the drag. A `createPortal` clone follows the cursor (neon accent border, `rotate(1.2deg) scale(1.03)` lift). Other items animate to their new positions via FLIP (`useLayoutEffect` + double `requestAnimationFrame`). A dashed neon placeholder shows the drop slot.

---

### Tooltip

Portal-rendered hover/focus tooltip. Never clipped by `overflow:hidden` parents. Positions itself after mount (`useLayoutEffect`) and clamps to the viewport.

```jsx
import { Tooltip, Button, Icon } from './components/ui'

// Wrap any element — string or ReactNode content
<Tooltip content="Delete this record" placement="top">
  <Button variant="danger"><Icon name="trash" size={13} /></Button>
</Tooltip>

<Tooltip content="Syncing with remote server…" placement="right" delay={0}>
  <Icon name="bell" size={18} />
</Tooltip>
```

| Prop | Type | Default |
|---|---|---|
| `content` | `ReactNode` | — |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` |
| `delay` | `number` (ms) | `130` |
| `disabled` | `boolean` | `false` |

---

### Switch

Accessible sliding toggle for binary settings. Sizes scale proportionally; accepts any CSS color.

```jsx
import { Switch } from './components/ui'

<Switch
  checked={isActive}
  onChange={setIsActive}
  label="Equipment active"
  description="Allow this unit to be assigned to projects"
/>

// Danger color for a destructive toggle
<Switch
  checked={locked}
  onChange={setLocked}
  label="Maintenance lock"
  color="var(--gs-danger)"
  size="sm"
/>
```

| Prop | Type | Default |
|---|---|---|
| `checked` | `boolean` | — |
| `onChange` | `(val: boolean) => void` | — |
| `label` | `string` | — |
| `description` | `string` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `color` | `string` | `'var(--gs-accent)'` |
| `disabled` | `boolean` | `false` |

---

### Alert

Inline persistent contextual banner — distinct from `Toast`. Sits in the document flow; dismissible via `onDismiss`.

```jsx
import { Alert } from './components/ui'

<Alert variant="warning" title="Calibration overdue" onDismiss={handleDismiss}>
  3 instruments require recalibration before field deployment.
</Alert>

<Alert variant="success" title="Sync completed">
  All records are up to date.
</Alert>

// No title — message only
<Alert variant="info">New firmware available for download.</Alert>
```

| Prop | Type | Default |
|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` |
| `title` | `string` | — |
| `children` | `ReactNode` | — |
| `onDismiss` | `() => void` | — (no dismiss button) |

---

### Drawer

Slide-in panel from the right (or left). Portal-rendered with a blurred backdrop, focus trap, and smooth CSS enter/exit transition — no animation library needed.

```jsx
import { Drawer, Button, Tabs, Switch } from './components/ui'

<Button onClick={() => setOpen(true)}>Open details</Button>

<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="Item Details"
  subtitle="ID-00142 · Category A"
  size="md"
  footer={
    <>
      <Button variant="ghost"   onClick={() => setOpen(false)}>Close</Button>
      <Button variant="primary" onClick={handleSave}>Save changes</Button>
    </>
  }
>
  {/* Any content — Tabs, Switches, forms, etc. */}
  <p>Drawer body goes here.</p>
</Drawer>
```

| Prop | Type | Default |
|---|---|---|
| `open` | `boolean` | — |
| `onClose` | `() => void` | — |
| `title` | `string` | — |
| `subtitle` | `string` | — |
| `side` | `'right' \| 'left'` | `'right'` |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` |
| `footer` | `ReactNode` | — |

**Widths:** `sm` → 320px · `md` → 440px · `lg` → 580px · `full` → 100vw  
**Animation:** double `requestAnimationFrame` defers the CSS `translateX` transition so the enter frame is always painted correctly. Exit plays the reverse, then unmounts after 300ms.

---

### Tabs

Tab list with a smooth sliding neon underline indicator. Indicator position and width are computed with `useLayoutEffect` and transition via CSS.

```jsx
import { Tabs } from './components/ui'

const TABS = [
  { value: 'overview',  label: 'Overview',  icon: 'box',   badge: null },
  { value: 'history',   label: 'History',   icon: 'chart', badge: 14   },
  { value: 'documents', label: 'Documents', icon: 'file',  badge: 3    },
]

<Tabs tabs={TABS} value={active} onChange={setActive}>
  {active === 'overview'  && <OverviewPanel />}
  {active === 'history'   && <HistoryPanel />}
  {active === 'documents' && <DocsPanel />}
</Tabs>
```

| Prop | Type | Default |
|---|---|---|
| `tabs` | `{ value, label, icon?, badge? }[]` | — |
| `value` | `string` | — |
| `onChange` | `(val: string) => void` | — |
| `children` | `ReactNode` | — |

The `badge` accepts any `number` or `string`; it renders as a small pill that turns accent-colored when the tab is active.

---

### DatePicker

Single-date and date-range calendar picker. Pure JS `Date` — no external library. The calendar grid is always 42 cells (6 × 7), Monday-aligned. Range mode shows a connected bar between start and end dates with a live hover preview.

```jsx
import { DatePicker } from './components/ui'

// Single date
<DatePicker
  value={date}
  onChange={setDate}
  label="Calibration date"
  minDate={new Date()}
/>

// Date range
<DatePicker
  mode="range"
  value={range}              // { from: Date | null, to: Date | null }
  onChange={setRange}
  label="Maintenance window"
  placeholder="Select date range…"
/>
```

| Prop | Type | Default |
|---|---|---|
| `value` | `Date \| null` / `{ from, to }` | — |
| `onChange` | `(val) => void` | — |
| `mode` | `'single' \| 'range'` | `'single'` |
| `placeholder` | `string` | auto |
| `label` | `string` | — |
| `minDate` | `Date` | — |
| `maxDate` | `Date` | — |
| `clearable` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `error` | `string` | — |

**Range UX:** first click sets `from`; second click sets `to` and auto-corrects order if needed. Hovering days during selection shows a live preview of the range bar.

---

### Progress

Three variants behind one API: linear bar, circular SVG, and segmented steps. Supports indeterminate (shimmer sweep) mode.

```jsx
import { Progress } from './components/ui'

// Bar — determinate
<Progress value={75} showValue label="Upload progress" />

// Bar — indeterminate
<Progress indeterminate label="Processing…" />

// Circular
<Progress variant="circular" value={78} showValue size="lg" color="var(--gs-teal)" />

// Steps (segmented)
<Progress variant="steps" value={60} segments={4} label="Phase 3 of 4" />
```

| Prop | Type | Default |
|---|---|---|
| `value` | `number` (0–100) | `0` |
| `variant` | `'bar' \| 'circular' \| 'steps'` | `'bar'` |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` |
| `color` | `string` | `'var(--gs-accent)'` |
| `label` | `string` | — |
| `showValue` | `boolean` | `false` |
| `indeterminate` | `boolean` | `false` |
| `segments` | `number` | `5` (steps only) |

**Bar heights:** `xs` 4px · `sm` 6px · `md` 8px · `lg` 12px  
**Circular diameters:** `sm` 48px · `md` 64px · `lg` 96px  
**Indeterminate:** bar uses an `animate-shimmer` sweep; circular spins a 270° arc via `stroke-dashoffset`.

---

### NumberInput

Quantity field with `+` / `−` controls. Hold a button to auto-repeat (fires immediately, then repeats at 80ms after a 380ms hold). Keyboard `↑` / `↓` also increment/decrement.

```jsx
import { NumberInput } from './components/ui'

<NumberInput
  value={qty}
  onChange={setQty}
  label="Quantity"
  min={0}
  max={999}
  step={1}
  suffix="units"
/>

<NumberInput
  value={price}
  onChange={setPrice}
  label="Unit price"
  min={0}
  step={50}
  prefix="$"
/>
```

| Prop | Type | Default |
|---|---|---|
| `value` | `number` | — |
| `onChange` | `(val: number) => void` | — |
| `min` | `number` | — |
| `max` | `number` | — |
| `step` | `number` | `1` |
| `label` | `string` | — |
| `prefix` | `string` | — |
| `suffix` | `string` | — |
| `disabled` | `boolean` | `false` |
| `error` | `string` | — |

---

### EmptyState

Polished "nothing here" placeholder with icon, title, description, and optional CTA. Four built-in presets cover the most common scenarios.

```jsx
import { EmptyState, Button } from './components/ui'

// Preset
<EmptyState
  preset="no-results"
  action={<Button variant="ghost" onClick={clearFilters}>Clear filters</Button>}
/>

// Custom
<EmptyState
  icon="trophy"
  title="All caught up!"
  description="No pending tasks for today."
  color="var(--gs-warn)"
  size="md"
/>
```

| Prop | Type | Default |
|---|---|---|
| `preset` | `'no-results' \| 'no-data' \| 'no-connection' \| 'empty'` | — |
| `icon` | `string` | preset value / `'box'` |
| `title` | `string` | preset value |
| `description` | `string` | preset value |
| `action` | `ReactNode` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `color` | `string` | `'var(--gs-accent)'` |

**Presets:** `no-results` (search icon) · `no-data` (inbox icon) · `no-connection` (wifi icon, danger color) · `empty` (box icon)

---

### Stepper

Multi-step wizard indicator. Derives step status automatically from `current` (`complete` → `active` → `upcoming`), or each step can override with an explicit `status` prop for error states.

```jsx
import { Stepper, Button } from './components/ui'

const STEPS = [
  { label: 'Details',    description: 'Basic info' },
  { label: 'Documents',  description: 'Upload files' },
  { label: 'Assignment', description: 'Assign to project' },
  { label: 'Review',     description: 'Confirm & submit' },
]

// Horizontal (default)
<Stepper steps={STEPS} current={step} onChange={setStep} />

// Vertical
<Stepper steps={STEPS} current={step} orientation="vertical" />

// With step error override
const stepsWithError = [
  ...STEPS.slice(0, 1),
  { label: 'Documents', status: 'error' },
  ...STEPS.slice(2),
]
<Stepper steps={stepsWithError} current={1} />
```

| Prop | Type | Default |
|---|---|---|
| `steps` | `{ label, description?, status? }[]` | — |
| `current` | `number` | — |
| `onChange` | `(index: number) => void` | — (no click nav) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `children` | `ReactNode` | — |

**Step statuses:** `complete` (filled accent + checkmark) · `active` (accent border + step number) · `upcoming` (muted border) · `error` (danger border + ✕)  
**Connector:** fills with a left-to-right (or top-to-bottom) accent gradient when the preceding step is complete.

---

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Alert.jsx           ← inline banner, 4 variants, dismissible
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Charts.jsx          ← ChartPanel (Recharts + Nivo)
│   │   ├── DataTable.jsx
│   │   ├── DatePicker.jsx      ← single date + range mode, min/max constraints
│   │   ├── Drawer.jsx          ← slide-in panel, enter/exit animation
│   │   ├── DragDrop.jsx        ← DropZone + SortableList
│   │   ├── EmptyState.jsx      ← 4 presets, custom icon + CTA
│   │   ├── Icon.jsx
│   │   ├── InputField.jsx
│   │   ├── Modal.jsx
│   │   ├── NumberInput.jsx     ← +/− controls, hold-to-repeat, prefix/suffix
│   │   ├── Pagination.jsx
│   │   ├── PasswordStrength.jsx
│   │   ├── Progress.jsx        ← bar / circular / steps, indeterminate mode
│   │   ├── QRCode.jsx
│   │   ├── QueryLoader.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Select.jsx          ← autocomplete combobox
│   │   ├── Skeleton.jsx
│   │   ├── Spinner.jsx         ← 5 variants
│   │   ├── StatCard.jsx
│   │   ├── Stepper.jsx         ← horizontal / vertical, step override
│   │   ├── Switch.jsx          ← sliding toggle, 3 sizes
│   │   ├── Tabs.jsx            ← sliding neon underline indicator
│   │   ├── Toast.jsx
│   │   ├── ToastContext.jsx
│   │   ├── Tooltip.jsx         ← portal tooltip, 4 placements
│   │   └── index.js            ← barrel export
│   └── ComponentShowcase.jsx
├── App.jsx
├── index.css                   ← global styles + :root CSS vars + @keyframes spin
└── main.jsx
tailwind.config.js              ← design tokens + keyframes
```

---

## Changelog

### v1.0.4 — 2026-06-02

**New components**
- `DatePicker` — single-date and date-range picker; pure JS `Date`, no library; range mode shows connected bar with live hover preview; min/max date constraints
- `Progress` — three variants (`bar` / `circular` / `steps`); indeterminate mode with shimmer sweep (bar) or spinning arc (circular); all sizes support neon glow
- `NumberInput` — quantity field with `+` / `−` buttons; hold-to-repeat fires immediately then 80ms intervals after 380ms; keyboard `↑` / `↓` navigation; prefix/suffix slots
- `EmptyState` — four built-in presets (`no-results` / `no-data` / `no-connection` / `empty`); custom icon, color, and CTA; three sizes with proportional scaling
- `Stepper` — horizontal and vertical step indicator; auto-derives step status from `current` index or via explicit `status` override (error states); connector bars fill with accent gradient when complete; `onClick` navigation optional

**Icon additions**
- `minus`, `calendar`, `arrowL`, `arrowR`, `inbox`, `wifi` — 6 new icons added to the Icon library

**Keyframe additions**
- `@keyframes spin` — explicit declaration in `index.css` so inline `animation: 'spin ...'` always resolves, fixing Spinner and Toast loading animation (Toast was statically defined in inline style but keyframe was only emitted when `animate-spin` class was used)
- `@keyframes shimmer` — added to Tailwind config for Progress indeterminate mode

**Bug fixes**
- Toast loading spinner now animates correctly (was silent due to missing `@keyframes spin`)

**Showcase**
- Full interactive demos of all 5 new components with real-world examples (equipment registration wizard, file upload with progress, quantity ordering, empty states, multi-step forms)

---

### v1.0.3 — 2026-06-02

**Identity**
- Rebranded as a general-purpose reusable library — no longer scoped to a specific product or domain

**New components**
- `Tooltip` — portal-rendered hover/focus tooltip with 4 placements, viewport clamping, configurable delay, and a rotated-square arrow caret
- `Switch` — accessible sliding toggle (`role="switch"`) with 3 sizes, any CSS color, optional label + description, neon glow when on
- `Alert` — inline persistent banner distinct from Toast; 4 variants (`info` / `success` / `warning` / `danger`), optional title and dismiss button, internal dismissed state
- `Drawer` — slide-in panel from right or left; portal-rendered, blurred backdrop, focus trap, Escape-to-close, smooth CSS enter/exit without any animation library; 4 widths (`sm` 320px → `full`)
- `Tabs` — tab list with a sliding neon underline indicator computed via `useLayoutEffect`; icon and badge per tab; content slot for any children

**Showcase**
- Tooltips wired to every icon button in the Buttons section
- All new components demonstrated with realistic content (equipment detail Drawer with nested Tabs + Switches, full Alert variants, Switch settings panel)

---

### v1.0.2 — 2026-06-02

**New components**
- `Select` — autocomplete combobox with single/multi-select, chip tags, keyboard navigation (↓↑ Enter Escape Backspace), `meta` text per option, and clear button
- `DropZone` — OS drag-and-drop upload zone with image thumbnail previews, per-file size validation, and neon drag-over state
- `SortableList` — Trello-style drag-to-reorder list using pointer events + CSS FLIP animation; floating clone via `createPortal`
- `Spinner` — full rewrite with 5 variants: `ring` (conic-gradient arc), `dots` (bounce), `bars` (wave), `orbit` (glowing satellite), `pulse` (expanding rings); optional `label` prop

**Redesigned**
- `StatCard` — vertical layout, neon top stripe, icon hover scale, trend pill auto-detected from `sub` prefix, radial corner glow, `color-mix()` for CSS-var-safe opacity

**Improvements**
- `Pagination` — responsive: numbered buttons collapse to a current-page pill on mobile
- `Toast` / `ToastContext` — full-width bottom strip on mobile, fixed corner on `sm+`
- `DataTable` — advanced filter row with `Select` for Category / Status / Location; live result count; combined filter logic
- All grids in `ComponentShowcase` — fixed hard-coded `grid-cols-4/3/2` to responsive `sm:` / `md:` / `lg:` breakpoints
- `:root` CSS custom properties added to `index.css` — `var(--gs-*)` tokens now resolve everywhere (SVG attributes, `color-mix()`, inline styles)
- `.skeleton` CSS class defined in `index.css` (was referenced but missing)
- New icons: `upload`, `grip`, `file`
- New Tailwind keyframes: `dotsB`, `barsW`, `ringE` (for Spinner variants)

---

### v1.0.1

**New components**
- `Modal` — portal modal, focus trap, Escape-to-close, 5 variants, 3 sizes, neon accent stripe
- `DataTable` — sortable columns, row selection, custom renderers, skeleton loading, empty state, responsive horizontal scroll
- `ChartPanel` — Recharts + Nivo charts (Area, Bar, Pie) with library/type selector, all tokens applied

**Dependencies added**
- `recharts@3.8.1`
- `@nivo/core`, `@nivo/line`, `@nivo/bar`, `@nivo/pie` @ `0.99.0`

---

### v1.0.0 — Initial release

Core component set: `Button`, `Badge`, `Icon`, `InputField`, `SearchBar`, `PasswordStrength`, `StatCard`, `Spinner`, `Pagination`, `Toast` / `useToast`, `SkeletonBlock` / `SkeletonRow` / `SkeletonCard` / `SkeletonStat`, `QRCode`, `QueryLoader`

---

## Improvement Roadmap

### Shipped ✓

| Component | Version |
|---|---|
| `DatePicker` — single date + range mode, min/max constraints, live preview | v1.0.4 |
| `Progress` — bar / circular / steps variants, indeterminate shimmer mode | v1.0.4 |
| `NumberInput` — hold-to-repeat +/− buttons, keyboard nav, prefix/suffix | v1.0.4 |
| `EmptyState` — 4 presets, custom icon + CTA, 3 sizes | v1.0.4 |
| `Stepper` — horizontal/vertical, auto-status from current, explicit override | v1.0.4 |
| `Tooltip` — portal tooltip, 4 placements, viewport clamp | v1.0.3 |
| `Switch` — sliding toggle, 3 sizes, any color | v1.0.3 |
| `Alert` — inline banner, 4 variants, dismissible | v1.0.3 |
| `Drawer` — slide-in panel, enter/exit animation, focus trap | v1.0.3 |
| `Tabs` — sliding neon underline indicator | v1.0.3 |
| `Select` — autocomplete combobox, multi-select chips | v1.0.2 |
| `DropZone` — file drag-and-drop, image thumbnails | v1.0.2 |
| `SortableList` — Trello-style FLIP drag-to-reorder | v1.0.2 |
| `Spinner` — 5 variants with neon glow | v1.0.2 |
| `Modal` — portal modal, 5 variants, focus trap | v1.0.1 |
| `DataTable` — sortable, selectable, advanced filters | v1.0.1 |
| `ChartPanel` — Recharts + Nivo, 6 chart types | v1.0.1 |

### Next up

| Component | Why |
|---|---|
| **Command Palette** (`⌘K`) | Power-user navigation — search items, actions, and pages from anywhere |
| **Timeline** | Activity log / history view for any record type |
| **Avatar / AvatarGroup** | User display — initials fallback, stacked group, status dot |
| **Virtual scroll in DataTable** | Handle 1 000+ rows without rendering them all |
| **`prefers-reduced-motion`** | Accessibility pass — wrap all animations in a motion check |
| **Grouped options in Select** | `{ group: 'Category', options: [...] }` support |

### Nice to have

| Component / Feature | Why |
|---|---|
| **Command Palette** (`⌘K`) | Power-user navigation — search items, actions, and pages from anywhere |
| **Timeline** | Activity log / history view for any record type |
| **Avatar / AvatarGroup** | User display — initials fallback, stacked group, status dot |
| **Virtual scroll in DataTable** | Handle 1 000+ rows without rendering them all |
| **`prefers-reduced-motion`** | Accessibility pass — wrap all animations in a motion check |
| **Grouped options in Select** | `{ group: 'Category', options: [...] }` support |

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.2 | Core |
| `react-dom` | 18.2 | DOM rendering + `createPortal` |
| `@tanstack/react-query` | 5.x | Server state (QueryLoader) |
| `recharts` | 3.8 | React-native charts |
| `@nivo/core` + `line` + `bar` + `pie` | 0.99 | D3-based nivo charts |
| `qrcode` | 1.5 | QR code generation |
| `tailwindcss` | 3.3 | Utility CSS |
| `vite` | 5.0 | Build tool |

---

**Built with** Vite · React 18 · Tailwind CSS 3 · Syne + DM Mono fonts
