# GeoStock Component Documentation

Complete reference for all UI components in the GeoStock library.

## Table of Contents

1. [Form Components](#form-components)
2. [Display Components](#display-components)
3. [Container Components](#container-components)
4. [Feedback Components](#feedback-components)

---

## Form Components

### Button

Primary interactive element for triggering actions.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' (default: 'primary')
- `disabled`: boolean (default: false)
- `className`: string for additional styling
- Standard HTML button attributes

**Example:**
```jsx
<Button variant="primary" onClick={handleClick}>
  Create Article
</Button>
```

### Input

Text input field with optional label and error state.

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'date' (default: 'text')
- `label`: string - Label text
- `error`: string - Error message (shows when present)
- `disabled`: boolean (default: false)
- `placeholder`: string
- `className`: string
- Standard HTML input attributes

**Example:**
```jsx
<Input 
  label="Product SKU"
  placeholder="e.g., TS16-001"
  error={skuError}
  onChange={handleChange}
/>
```

### Select

Dropdown/select menu component.

**Props:**
- `label`: string - Label text
- `options`: Array<{value: string, label: string}> - Menu options
- `error`: string - Error message
- `disabled`: boolean
- `placeholder`: string (default: '-- Select option --')
- `className`: string
- Standard HTML select attributes

**Example:**
```jsx
<Select
  label="Category"
  options={[
    { value: 'topography', label: 'Topography' },
    { value: 'engineering', label: 'Engineering' }
  ]}
  onChange={handleChange}
/>
```

### Textarea

Multi-line text input field.

**Props:**
- `label`: string - Label text
- `error`: string - Error message
- `disabled`: boolean
- `rows`: number (default: 4) - Number of rows
- `className`: string
- Standard HTML textarea attributes

**Example:**
```jsx
<Textarea
  label="Specifications"
  placeholder="Enter technical specifications..."
  rows={5}
/>
```

### Checkbox

Selectable checkbox input.

**Props:**
- `label`: string - Label text
- `checked`: boolean (default: false)
- `disabled`: boolean
- `className`: string
- Standard HTML input attributes

**Example:**
```jsx
<Checkbox 
  label="In Stock"
  checked={inStock}
  onChange={handleChange}
/>
```

### Radio

Radio button for single-choice selection.

**Props:**
- `label`: string - Label text
- `checked`: boolean (default: false)
- `disabled`: boolean
- `className`: string
- `name`: string - Group name (required for grouping)
- Standard HTML input attributes

**Example:**
```jsx
<div>
  <Radio label="Active" name="status" value="active" onChange={handleChange} />
  <Radio label="Inactive" name="status" value="inactive" onChange={handleChange} />
</div>
```

### Form, FormGroup, FormLabel

Form container components for better organization.

**Example:**
```jsx
<Form onSubmit={handleSubmit}>
  <FormGroup>
    <FormLabel htmlFor="name">Product Name</FormLabel>
    <Input id="name" type="text" />
  </FormGroup>
  <FormGroup>
    <FormLabel htmlFor="category">Category</FormLabel>
    <Select id="category" options={categories} />
  </FormGroup>
  <Button type="submit">Save</Button>
</Form>
```

---

## Display Components

### Badge

Status or category badge.

**Props:**
- `variant`: 'success' | 'warning' | 'danger' | 'info' (default: 'info')
- `className`: string

**Example:**
```jsx
<Badge variant="success">In Stock</Badge>
<Badge variant="warning">Low Stock</Badge>
<Badge variant="danger">Out of Stock</Badge>
```

### Avatar

User avatar with initials.

**Props:**
- `initials`: string - 1-4 character initials
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `className`: string

**Example:**
```jsx
<Avatar initials="AB" size="md" />
```

### Card, CardHeader, CardBody, CardFooter, CardTitle, CardText

Reusable card component with multiple sections.

**Example:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Article Details</CardTitle>
  </CardHeader>
  <CardBody>
    <CardText>Product information goes here</CardText>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Edit</Button>
  </CardFooter>
</Card>
```

### MetricCard

Dashboard metric display card.

**Props:**
- `label`: string - Metric label
- `value`: string | number - Metric value
- `change`: string - Change indicator (e.g., "+120 this month")
- `changeType`: 'positive' | 'negative' (default: 'positive')
- `icon`: ReactNode - Optional icon
- `className`: string

**Example:**
```jsx
<MetricCard
  label="Total SKUs"
  value="2,847"
  change="+120 this month"
  changeType="positive"
/>
```

---

## Container Components

### Modal

Modal dialog component.

**Props:**
- `isOpen`: boolean (default: false) - Show/hide modal
- `onClose`: function - Callback when closing
- `title`: string - Modal title
- `children`: ReactNode - Modal content
- `footer`: ReactNode - Footer content (usually buttons)
- `className`: string

**Example:**
```jsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create Article"
  footer={
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary">Save</Button>
    </div>
  }
>
  <Input label="Name" />
  <Input label="SKU" />
</Modal>
```

### Table, TableHead, TableBody, TableRow, TableHeader, TableCell

Data table components.

**Example:**
```jsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeader>SKU</TableHeader>
      <TableHeader>Product</TableHeader>
      <TableHeader>Stock</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    {articles.map(article => (
      <TableRow key={article.id}>
        <TableCell>{article.sku}</TableCell>
        <TableCell>{article.name}</TableCell>
        <TableCell>{article.stock}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Sidebar, SidebarHeader, SidebarLogo, SidebarNav, NavItem, SidebarFooter, UserCard

Navigation sidebar components.

**Example:**
```jsx
<Sidebar>
  <SidebarHeader>
    <SidebarLogo>GeoStock</SidebarLogo>
  </SidebarHeader>
  
  <SidebarNav>
    <NavItem href="/inventory" active>
      Inventory
    </NavItem>
    <NavItem href="/sales">Sales</NavItem>
    <NavItem href="/orders">Orders</NavItem>
  </SidebarNav>
  
  <SidebarFooter>
    <UserCard
      avatar="AB"
      name="Alex Brown"
      role="Admin"
    />
  </SidebarFooter>
</Sidebar>
```

### Pagination

Pagination controls.

**Props:**
- `currentPage`: number - Current page (default: 1)
- `totalPages`: number - Total pages (default: 1)
- `onPageChange`: function - Page change callback
- `className`: string

**Example:**
```jsx
const [page, setPage] = useState(1);

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
/>
```

---

## Feedback Components

### Toast

Notification toast component.

**Props:**
- `message`: string - Toast message
- `type`: 'info' | 'success' | 'danger' | 'warning' (default: 'info')
- `duration`: number - Duration in ms (default: 4000)
- `onClose`: function - Close callback
- `className`: string

**Example:**
```jsx
const [message, setMessage] = useState('');

<Toast
  message={message}
  type="success"
  duration={3000}
  onClose={() => setMessage('')}
/>
```

### useToast Hook

Custom hook for managing toast notifications.

**Returns:**
- `show(message, type, duration)` - Show a toast
- `hide(id)` - Hide a specific toast
- `ToastContainer` - Component to render toasts

**Example:**
```jsx
function MyComponent() {
  const { show, ToastContainer } = useToast();

  return (
    <>
      <ToastContainer />
      <Button onClick={() => show('Saved!', 'success')}>
        Save
      </Button>
    </>
  );
}
```

---

## Color Reference

### Brand Colors
- **Navy:** `#142238` (primary, sidebars, headers)
- **Light:** `#F8F9FF` (light backgrounds)

### Semantic Colors
- **Success Green:** `#10B981` (positive actions, success badges)
- **Info Blue:** `#3B82F6` (information, default state)
- **Warning Amber:** `#F59E0B` (warnings, alerts)
- **Error Red:** `#EF4444` (errors, destructive actions)
- **Gray:** `#6B7280` (disabled, secondary text)

---

## Spacing Scale

- **xs:** 4px (micro spacing)
- **sm:** 8px (small gaps)
- **md:** 16px (standard padding)
- **lg:** 24px (section gaps)
- **xl:** 32px (page margins)

---

## Border Radius

- **sm:** 4px (buttons, badges)
- **md:** 8px (cards, inputs)
- **lg:** 12px (modals, containers)
- **full:** 50% (circles, avatars)

---

## Responsive Breakpoints

Use Tailwind breakpoints with components:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Responsive grid */}
</div>
```

---

## Accessibility

All components follow WCAG 2.1 guidelines:
- Semantic HTML
- Proper form labels
- Keyboard navigation
- ARIA attributes
- Color contrast ≥ 4.5:1

---

## Best Practices

1. **Always provide labels** for form inputs
2. **Use semantic variants** (success, warning, danger) for status
3. **Keep modals focused** - one primary action per modal
4. **Use ToastContainer** at app root for notifications
5. **Test with keyboard navigation** and screen readers
6. **Responsive grid** for multi-column layouts
7. **Avoid deeply nested components** - use composition

---

## Troubleshooting

### Components not styled
- Ensure Tailwind CSS is imported in main.jsx
- Check that postcss.config.js and tailwind.config.js exist
- Verify index.css has @tailwind directives

### Modal not closing
- Check that onClose function updates state correctly
- Ensure onClick handler stops propagation

### Toast not showing
- Wrap ToastContainer in your app layout
- Verify useToast hook is called in correct component

---

**Last Updated:** 2026-05-23  
**Version:** 1.0.0
