# GeoStock UI - Quick Start Guide

## ⚡ 30-Second Setup

```bash
# 1. Extract and navigate
unzip geostock-ui.zip
cd geostock-ui

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:5173
```

## 🎯 What You Get

✅ **15+ Production-Ready Components**
- Buttons, Inputs, Selects, Textareas
- Forms, Cards, Modals
- Tables, Pagination, Badges
- Sidebar Navigation, Avatars
- Toast Notifications
- And more...

✅ **Complete Design System**
- Color palette (Navy, Green, Blue, Amber, Red)
- Typography system (Inter font)
- Spacing scale
- Border radius standards
- Responsive design

✅ **Full Documentation**
- Component showcase (interactive demo)
- README with usage examples
- COMPONENTS.md (complete API reference)
- INSTALLATION.md (detailed setup guide)

## 📚 File Structure

```
geostock-ui/
├── src/
│   ├── ui/                    ← All components here!
│   ├── components/
│   │   └── ComponentShowcase.jsx   ← Interactive demo
│   ├── App.jsx               ← Shows demo
│   └── index.css             ← Tailwind + custom styles
├── package.json              ← Dependencies
├── vite.config.js            ← Build config
├── tailwind.config.js        ← Tailwind theme
└── README.md, COMPONENTS.md, INSTALLATION.md
```

## 🚀 First Steps

### 1. View Component Showcase
```bash
npm run dev
# Open http://localhost:5173
# See all components with interactive examples
```

### 2. Use a Component in Your Code
```jsx
// App.jsx or any file
import { Button, Input, Card, Badge } from './ui';

function MyPage() {
  return (
    <Card>
      <h2>Create Article</h2>
      <Input label="Name" placeholder="Leica TS16" />
      <Button variant="primary">Save</Button>
    </Card>
  );
}
```

### 3. Customize Styling
```jsx
// Add custom classes
<Button className="w-full text-lg">Full Width</Button>

// Or modify tailwind.config.js for global changes
```

## 📖 Component Imports

All components exported from `ui/index.js`:

```jsx
import {
  // Buttons & Forms
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Form,
  FormGroup,
  FormLabel,

  // Display
  Badge,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardText,
  MetricCard,

  // Containers
  Modal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  Sidebar,
  SidebarHeader,
  SidebarLogo,
  SidebarNav,
  NavItem,
  SidebarFooter,
  UserCard,
  Pagination,

  // Notifications
  Toast,
  useToast,
} from './ui';
```

## 🎨 Color System

**Brand Colors:**
- Navy: `#142238` (primary)
- Light: `#F8F9FF` (backgrounds)

**Semantic Colors:**
- Success: `#10B981` (green)
- Info: `#3B82F6` (blue)
- Warning: `#F59E0B` (amber)
- Danger: `#EF4444` (red)
- Gray: `#6B7280` (neutral)

Use in components:
```jsx
<Badge variant="success">In Stock</Badge>
<Badge variant="warning">Low Stock</Badge>
<Badge variant="danger">Out of Stock</Badge>
<Button variant="danger">Delete</Button>
```

## 📱 Common Patterns

### Form with Validation
```jsx
import { Form, Input, Select, Button, useToast } from './ui';
import { useState } from 'react';

function ArticleForm() {
  const [error, setError] = useState('');
  const { show, ToastContainer } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      setError('Name is required');
      return;
    }
    show('Article saved!', 'success');
  };

  return (
    <>
      <ToastContainer />
      <Form onSubmit={handleSubmit}>
        <Input 
          label="Name" 
          error={error}
          onChange={() => setError('')}
        />
        <Select label="Category" options={categories} />
        <Button type="submit">Save</Button>
      </Form>
    </>
  );
}
```

### Table with Pagination
```jsx
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Pagination, Badge } from './ui';
import { useState } from 'react';

function ArticleTable({ articles }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const start = (page - 1) * itemsPerPage;
  const items = articles.slice(start, start + itemsPerPage);
  
  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>SKU</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(article => (
            <TableRow key={article.id}>
              <TableCell>{article.sku}</TableCell>
              <TableCell>{article.name}</TableCell>
              <TableCell>
                <Badge variant={article.inStock ? 'success' : 'danger'}>
                  {article.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(articles.length / itemsPerPage)}
        onPageChange={setPage}
      />
    </>
  );
}
```

### Modal Dialog
```jsx
import { Modal, Button, Input, useState } from './ui';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        New Article
      </Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Article"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              setIsOpen(false);
              // Handle save
            }}>
              Create
            </Button>
          </div>
        }
      >
        <Input label="Product Name" />
        <Input label="SKU" />
      </Modal>
    </>
  );
}
```

### Dashboard with Metrics
```jsx
import { MetricCard } from './ui';

function Dashboard() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard label="Total SKUs" value="2,847" change="+120" />
      <MetricCard label="Low Stock" value="34" change="+5" />
      <MetricCard label="Pending Orders" value="18" change="-3" changeType="negative" />
      <MetricCard label="Warehouse Cap" value="78%" change="+5" />
    </div>
  );
}
```

## 📦 Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build locally
```

## 🎓 Learn More

1. **Component Showcase** - Run `npm run dev` and explore
2. **COMPONENTS.md** - Full API reference for all components
3. **README.md** - Detailed usage examples
4. **INSTALLATION.md** - Advanced setup and customization

## 🚨 Troubleshooting

**Components not styled?**
- Restart dev server: `npm run dev`
- Check that `src/index.css` is imported

**Import errors?**
- Verify file names (case-sensitive)
- Check `src/ui/index.js` exports all components
- Use: `import { Button } from './ui'`

**Port already in use?**
- Vite will try next port automatically
- Or change in `vite.config.js`

## 💡 Tips

- Use `className` prop to customize any component
- All components support standard HTML attributes
- Responsive: Use Tailwind breakpoints (md:, lg:, etc)
- Dark mode: Components work with both light/dark

## 🚀 Next: Build Your App!

You're ready to:
1. Create pages using components
2. Build your inventory system
3. Add authentication
4. Connect to your API
5. Deploy to production

---

**Enjoy building with GeoStock UI! 🎉**

Questions? Check INSTALLATION.md or COMPONENTS.md
