# NeonReactUI — GeoStock Component Library

> Dark-neon React component library built with **Vite 5**, **React 18**, and **Tailwind CSS 3**.  
> Designed for the GeoStock Industrial Inventory Management System.

**Version:** 1.0.2 · **Updated:** 2026-06-02

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

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Charts.jsx          ← ChartPanel (Recharts + Nivo)
│   │   ├── DataTable.jsx
│   │   ├── DragDrop.jsx        ← DropZone + SortableList
│   │   ├── Icon.jsx
│   │   ├── InputField.jsx
│   │   ├── Modal.jsx
│   │   ├── Pagination.jsx
│   │   ├── PasswordStrength.jsx
│   │   ├── QRCode.jsx
│   │   ├── QueryLoader.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Select.jsx          ← autocomplete combobox
│   │   ├── Skeleton.jsx
│   │   ├── Spinner.jsx         ← 5 variants
│   │   ├── StatCard.jsx        ← redesigned
│   │   ├── Toast.jsx
│   │   ├── ToastContext.jsx
│   │   └── index.js            ← barrel export
│   └── ComponentShowcase.jsx
├── App.jsx
├── index.css                   ← global styles + :root CSS vars
└── main.jsx
tailwind.config.js              ← design tokens + keyframes
```

---

## Changelog

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

Components and patterns worth adding next, prioritized by practical impact for inventory management UIs:

### High priority

| Component | Why |
|---|---|
| **Tooltip** | Every icon-only button (`edit`, `trash`) needs a hover label; currently there's no way to add one |
| **Switch / Toggle** | Cleaner than a checkbox for binary settings (e.g., active/inactive, notifications on/off) |
| **Alert / Banner** | Inline persistent feedback — different from Toast; sits in the page flow for form-level errors or system warnings |
| **Drawer / Sheet** | Slide-in panel from the right for equipment detail views, edit forms, or filter panels without leaving the current page |
| **Tabs** | Organizing content inside detail views (e.g., Overview / History / Documents / Calibration) |

### Medium priority

| Component | Why |
|---|---|
| **DatePicker** | Calibration dates, maintenance scheduling, filter by date range |
| **Progress / ProgressBar** | Upload progress, onboarding steps, capacity indicators |
| **NumberInput** | Quantity fields with increment/decrement controls |
| **EmptyState** | A proper illustrated "nothing here" state with icon, title, description, and a CTA button |
| **Stepper** | Multi-step forms for equipment registration workflows |

### Nice to have

| Component / Feature | Why |
|---|---|
| **Command Palette** (`⌘K`) | Power-user navigation; search equipment, actions, and pages from anywhere |
| **Timeline** | Equipment maintenance and calibration history log |
| **Avatar / AvatarGroup** | User assignment display (who has the equipment, who last touched it) |
| **Virtual scroll in DataTable** | Handle 1 000+ rows without rendering them all; `react-virtual` or `@tanstack/virtual` |
| **`prefers-reduced-motion`** | Wrap all `animate-*` classes and FLIP animation in a motion check for accessibility |
| **Grouped options in Select** | `{ group: 'Surveying', options: [...] }` support in the Select component |

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
