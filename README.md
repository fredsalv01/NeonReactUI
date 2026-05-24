# GeoStock UI Component Library

A complete, production-ready React component library built with Vite, React, and Tailwind CSS.

## 🎯 Overview

This is a fully functional UI component library for the GeoStock Industrial Inventory Management System. All components are built with React and styled with Tailwind CSS, following the GeoStock design system specifications.

## 📦 Components Included

### Form Components
- **Button** - Primary, secondary, and danger variants with disabled states
- **Input** - Text inputs with validation and error states
- **Select** - Dropdown menus with placeholder support
- **Textarea** - Multi-line text input
- **Checkbox** - Selectable checkboxes
- **Radio** - Radio button groups
- **Form** - Form container with group layout

### Display Components
- **Badge** - Status and category badges (success, warning, danger, info)
- **Avatar** - User avatars in multiple sizes
- **Card** - Reusable card component with header, body, footer, title, and text
- **MetricCard** - Dashboard metric display cards

### Container Components
- **Modal** - Modal dialogs with titles, content, and footers
- **Table** - Data tables with thead, tbody, rows, headers, and cells
- **Sidebar** - Navigation sidebar with header, logo, nav items, and footer
- **Pagination** - Page navigation controls

### Feedback Components
- **Toast** - Notification toasts (success, error, info, warning)
- **useToast** - Custom hook for managing toast notifications

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
geostock-ui/
├── src/
│   ├── ui/                    # UI Components directory
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Textarea.jsx
│   │   ├── Badge.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Table.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Checkbox.jsx
│   │   ├── Radio.jsx
│   │   ├── Avatar.jsx
│   │   ├── Pagination.jsx
│   │   ├── MetricCard.jsx
│   │   ├── Form.jsx
│   │   └── index.js           # Export all components
│   ├── components/
│   │   └── ComponentShowcase.jsx  # Demo of all components
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 📖 Usage Examples

### Button

```jsx
import { Button } from './ui';

function App() {
  return (
    <div>
      <Button variant="primary">Create Article</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger" disabled>Delete</Button>
    </div>
  );
}
```

### Form Inputs

```jsx
import { Input, Select, Textarea } from './ui';

function ArticleForm() {
  const categories = [
    { value: 'topography', label: 'Topography' },
    { value: 'engineering', label: 'Engineering' },
  ];

  return (
    <form>
      <Input label="Product Name" placeholder="e.g., Leica TS16" />
      <Input label="SKU" error="This SKU already exists" />
      <Select 
        label="Category" 
        options={categories}
        placeholder="Select a category"
      />
      <Textarea label="Specifications" rows={4} />
    </form>
  );
}
```

### Cards

```jsx
import { Card, CardHeader, CardBody, CardFooter, CardTitle, Button } from './ui';

function ArticleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leica TS16</CardTitle>
      </CardHeader>
      <CardBody>
        <p>Total Station with integrated camera</p>
      </CardBody>
      <CardFooter>
        <Button variant="primary">Edit</Button>
        <Button variant="secondary">Delete</Button>
      </CardFooter>
    </Card>
  );
}
```

### Modal

```jsx
import { Modal, Button, Input, Select } from './ui';
import { useState } from 'react';

function CreateArticleModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>New Article</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Article"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="primary">Create</Button>
          </div>
        }
      >
        <Input label="Name" />
        <Input label="SKU" />
      </Modal>
    </>
  );
}
```

### Toast Notifications

```jsx
import { Button, useToast } from './ui';

function ToastExample() {
  const { show, ToastContainer } = useToast();

  return (
    <>
      <ToastContainer />
      <Button onClick={() => show('Success!', 'success')}>Show Success</Button>
      <Button onClick={() => show('Error occurred', 'danger')}>Show Error</Button>
    </>
  );
}
```

### Table

```jsx
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge } from './ui';

function ArticleTable() {
  const articles = [
    { sku: 'TS16-001', name: 'Leica TS16', stock: 45, status: 'success' },
    { sku: 'TL2-002', name: 'Theodolite', stock: 12, status: 'warning' },
  ];

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>SKU</TableHeader>
          <TableHeader>Product</TableHeader>
          <TableHeader>Stock</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {articles.map((item) => (
          <TableRow key={item.sku}>
            <TableCell>{item.sku}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.stock}</TableCell>
            <TableCell>
              <Badge variant={item.status}>
                {item.status === 'success' ? 'In Stock' : 'Low Stock'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Sidebar Navigation

```jsx
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarLogo, 
  SidebarNav, 
  NavItem, 
  SidebarFooter,
  UserCard,
  Button
} from './ui';

function AppLayout() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarLogo>GeoStock</SidebarLogo>
      </SidebarHeader>
      
      <SidebarNav>
        <NavItem href="/inventory" active>Inventory</NavItem>
        <NavItem href="/sales">Sales</NavItem>
        <NavItem href="/orders">Orders</NavItem>
        <NavItem href="/reports">Reports</NavItem>
      </SidebarNav>
      
      <SidebarFooter>
        <UserCard avatar="AB" name="Alex Brown" role="Admin" />
        <Button variant="secondary" className="w-full">Sign Out</Button>
      </SidebarFooter>
    </Sidebar>
  );
}
```

### Dashboard Metrics

```jsx
import { MetricCard } from './ui';

function Dashboard() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard 
        label="Total SKUs" 
        value="2,847" 
        change="+120 this month"
      />
      <MetricCard 
        label="Low Stock" 
        value="34" 
        change="+5 alerts"
      />
      <MetricCard 
        label="Pending Orders" 
        value="18" 
        change="-3 completed"
        changeType="negative"
      />
      <MetricCard 
        label="Warehouse Cap" 
        value="78%" 
        change="+5% this week"
      />
    </div>
  );
}
```

## 🎨 Design System

### Colors

**Brand Colors:**
- Primary Navy: `#142238`
- Light Surface: `#F8F9FF`

**Semantic Colors:**
- Success Green: `#10B981`
- Info Blue: `#3B82F6`
- Warning Amber: `#F59E0B`
- Error Red: `#EF4444`
- Neutral Gray: `#6B7280`

### Typography

- **Headings (H1):** 32px, weight 600
- **Headings (H2):** 24px, weight 600
- **Headings (H3):** 18px, weight 600
- **Body:** 14px, weight 400
- **Small:** 12px, weight 400
- **Mono (Code):** 13px, weight 500

### Spacing

- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px

### Border Radius

- **sm:** 4px (buttons, badges)
- **md:** 8px (cards, inputs)
- **lg:** 12px (modals, containers)
- **full:** 50% (circles, avatars)

## 🔧 Customization

### Tailwind Configuration

Customize colors, fonts, and spacing in `tailwind.config.js`:

```js
export default {
  theme: {
    extend: {
      colors: {
        'brand-navy': '#142238',
        'semantic-success': '#10B981',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui'],
      },
    },
  },
}
```

### Component Styling

All components use Tailwind CSS utility classes. Override component styles by passing `className` prop:

```jsx
<Button className="w-full text-lg">Full Width Button</Button>
<Input className="bg-blue-50" />
```

## 📱 Responsive Design

Components are mobile-responsive with Tailwind breakpoints:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Responsive grid */}
</div>
```

## ♿ Accessibility

All components follow WCAG 2.1 guidelines:
- Semantic HTML structure
- Proper form labels and associations
- Keyboard navigation support
- ARIA attributes where needed
- Color contrast ratios ≥ 4.5:1

## 🎯 Next Steps

1. **View the showcase** - Run `npm run dev` and visit the component showcase
2. **Start building** - Import components into your pages
3. **Customize** - Adjust colors, sizes, and spacing as needed
4. **Extend** - Create additional components following the established patterns

## 📝 License

This component library is part of the GeoStock project.

## 🤝 Contributing

When adding new components:

1. Create component file in `src/ui/`
2. Export from `src/ui/index.js`
3. Add usage example to `ComponentShowcase.jsx`
4. Update this README with documentation
5. Follow Tailwind CSS utility-first approach
6. Support all required variants and states

## 📞 Support

For questions or issues, refer to the component showcase page or review the component implementation files.

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-23  
**Built with:** Vite, React 18, Tailwind CSS 3
