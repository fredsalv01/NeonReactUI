# GeoStock UI Component Library - Installation Guide

## Quick Start

### Prerequisites

- Node.js 16+ (recommended 18+)
- npm 8+ or yarn 3+

### Installation Steps

1. **Extract the project**
   ```bash
   unzip geostock-ui.zip
   cd geostock-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

## Project Structure

```
geostock-ui/
├── src/
│   ├── ui/                          # ✨ UI Components
│   │   ├── Button.jsx               # Button component
│   │   ├── Input.jsx                # Text input
│   │   ├── Select.jsx               # Dropdown
│   │   ├── Textarea.jsx             # Multi-line input
│   │   ├── Badge.jsx                # Status badges
│   │   ├── Card.jsx                 # Card container
│   │   ├── Modal.jsx                # Modal dialog
│   │   ├── Toast.jsx                # Toast notifications
│   │   ├── Table.jsx                # Data table
│   │   ├── Sidebar.jsx              # Navigation sidebar
│   │   ├── Checkbox.jsx             # Checkbox input
│   │   ├── Radio.jsx                # Radio buttons
│   │   ├── Avatar.jsx               # User avatar
│   │   ├── Pagination.jsx           # Page navigation
│   │   ├── MetricCard.jsx           # Dashboard metrics
│   │   ├── Form.jsx                 # Form container
│   │   └── index.js                 # Exports all components
│   │
│   ├── components/
│   │   └── ComponentShowcase.jsx     # 📚 Demo/showcase page
│   │
│   ├── App.jsx                      # Main app
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Tailwind styles
│
├── public/                          # Static assets
├── package.json                     # Dependencies
├── vite.config.js                   # Vite config
├── tailwind.config.js               # Tailwind config
├── postcss.config.js                # PostCSS config
├── README.md                        # Main documentation
├── COMPONENTS.md                    # Component reference
└── INSTALLATION.md                  # This file
```

## Available Scripts

### Development
```bash
npm run dev
```
Starts Vite development server with hot module replacement.

### Build Production
```bash
npm run build
```
Creates optimized production build in `dist/` folder.

### Preview Build
```bash
npm run preview
```
Serves the production build locally for testing.

## Using Components in Your Project

### Method 1: Direct Import
```jsx
import { Button, Input, Badge, Card } from './ui';

function MyComponent() {
  return (
    <Card>
      <Input label="Name" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### Method 2: Selective Imports
```jsx
import Button from './ui/Button';
import Input from './ui/Input';
```

### Method 3: From Index
```jsx
// All components exported from ui/index.js
import * as UI from './ui';

<UI.Button>Click me</UI.Button>
<UI.Input label="Name" />
```

## Customizing Components

### 1. Override Tailwind Classes

All components accept a `className` prop for custom styling:

```jsx
<Button className="w-full text-lg py-4">
  Full Width Button
</Button>

<Input className="bg-blue-50 border-2 border-blue-300" />
```

### 2. Extend Tailwind Config

Modify `tailwind.config.js` to add custom colors, fonts, etc:

```js
export default {
  theme: {
    extend: {
      colors: {
        'custom-brand': '#FF6B6B',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
      },
    },
  },
}
```

### 3. Create Custom Components

Use existing components as templates:

```jsx
// src/ui/CustomButton.jsx
import { Button } from './Button';

export function CustomButton(props) {
  return <Button className="rounded-full font-bold" {...props} />;
}
```

## Development Workflow

### 1. Component Showcase
The `ComponentShowcase.jsx` file demonstrates all components. Use it to:
- See component examples
- Test interactive features
- Verify responsive behavior
- Try different variants

### 2. Test Components
```bash
# Start dev server
npm run dev

# Open http://localhost:5173 in browser
# Interact with components
# Check console for any errors
```

### 3. Build & Deploy
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to hosting
```

## Configuration Files Explained

### vite.config.js
Vite build tool configuration. Includes React plugin for JSX support.

### tailwind.config.js
Tailwind CSS configuration with:
- Extended color palette
- Custom font family (Inter)
- Custom spacing scale
- Border radius settings

### postcss.config.js
PostCSS configuration for:
- Tailwind CSS processing
- Autoprefixer for browser compatibility

### package.json
Project dependencies and scripts:
- React 18
- Vite 5
- Tailwind CSS 3
- PostCSS and Autoprefixer

## Troubleshooting

### Styles not applied
**Problem:** Components appear unstyled
**Solution:**
1. Ensure `index.css` is imported in `main.jsx`
2. Check that `postcss.config.js` and `tailwind.config.js` exist
3. Verify Tailwind directives are at top of `index.css`
4. Restart dev server: `npm run dev`

### Components not found
**Problem:** Import errors for components
**Solution:**
1. Check file names match exactly (case-sensitive)
2. Verify component is exported in `ui/index.js`
3. Use correct import path: `import { Button } from './ui'`

### Hot reload not working
**Problem:** Changes don't reflect in browser
**Solution:**
1. Save file (Ctrl+S or Cmd+S)
2. Check terminal for errors
3. Restart dev server if needed
4. Clear browser cache

### Tailwind classes not recognized
**Problem:** Custom Tailwind classes don't work
**Solution:**
1. Only use classes defined in `tailwind.config.js`
2. Arbitrary values work: `px-[24px]`, `text-[#FF0000]`
3. Rebuild won't purge unused classes in dev
4. Check production build with `npm run build`

## Performance Tips

### 1. Code Splitting
Vite automatically splits code by route. No additional config needed.

### 2. Image Optimization
```jsx
// Use optimized image formats
import image from './image.webp';
```

### 3. CSS Purging
Tailwind automatically purges unused styles in production builds.

### 4. Tree Shaking
ES modules enable automatic tree-shaking of unused imports.

## Browser Support

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Next Steps

1. **Review Components** - Check `COMPONENTS.md` for full documentation
2. **View Showcase** - Run `npm run dev` and see all components
3. **Start Building** - Create your pages using provided components
4. **Customize** - Modify colors, fonts, spacing as needed
5. **Deploy** - Build with `npm run build` and deploy `dist/` folder

## Getting Help

### Documentation
- **Component Showcase:** Run `npm run dev` and visit localhost:5173
- **Component Reference:** Read `COMPONENTS.md`
- **Tailwind Docs:** https://tailwindcss.com/docs
- **React Docs:** https://react.dev

### Common Issues
1. Delete `node_modules` and `package-lock.json`, then `npm install`
2. Clear Vite cache: Delete `.vite` folder
3. Clear Tailwind cache: Restart dev server
4. Check Node version: `node --version` (should be 16+)

## Development Tips

### VS Code Extensions
Recommended for better DX:
- **Tailwind CSS IntelliSense** - CSS class autocomplete
- **ES7+ React/Redux/React-Native snippets** - React snippets
- **Prettier** - Code formatter
- **ESLint** - Code quality

### Useful Tailwind Classes
```jsx
// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Spacing
<div className="px-4 py-2 m-4 mb-8">

// Colors
<div className="bg-blue-50 text-blue-900 border border-blue-200">

// Flexbox
<div className="flex items-center justify-between gap-4">
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder via Netlify CLI or web
```

### GitHub Pages
Configure `vite.config.js`:
```js
export default {
  base: '/repo-name/',
}
```

### Traditional Server
```bash
npm run build
# Copy dist/ to web server
```

---

## Version Info

- **Vite:** 5.0+
- **React:** 18.2+
- **Tailwind CSS:** 3.3+
- **Node:** 16+

---

**Happy Coding! 🚀**

For more info, see README.md and COMPONENTS.md
