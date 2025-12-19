# 📄 Paperflow

A professional-grade, client-side PDF workspace for splitting, merging, and reordering PDF documents. Built with React, TypeScript, and Tailwind CSS.

## 🎯 Overview

Paperflow is a modern web application that allows users to visually manipulate PDF documents entirely in the browser. No server uploads, no data leaving your device—everything happens client-side for maximum privacy and speed.

### Key Features

- **📤 Upload Multiple PDFs** - Drag & drop or click to upload PDF files
- **🖼️ Visual Page Thumbnails** - See all pages at a glance with high-quality previews
- **🔄 Drag & Drop Reordering** - Intuitively reorder pages by dragging
- **🔄 Rotate Pages** - Rotate pages 90° at a time with visual feedback
- **✂️ Split & Merge** - Select pages and export them as separate PDFs
- **↩️ Undo/Redo** - Full history support with keyboard shortcuts
- **⌨️ Keyboard Navigation** - Efficient workflows with keyboard shortcuts
- **📱 Responsive Design** - Works beautifully on all screen sizes

## 🧠 Design Philosophy

Paperflow is built with these core principles:

- **Client-Side Only** - All processing happens in your browser
- **Visual Manipulation** - See what you're doing, not form inputs
- **Immediate Feedback** - Every action provides instant visual response
- **Minimal UI** - Clean, uncluttered interface focused on your work
- **Predictable Interactions** - Consistent behavior throughout
- **Professional Quality** - Built as if it were a paid productivity tool

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 3
- **PDF Processing**: pdf-lib (client-side PDF manipulation)
- **Thumbnails**: pdfjs-dist (PDF.js for rendering)
- **Drag & Drop**: @dnd-kit (modern, accessible drag & drop)
- **Build Tool**: Vite 7
- **State Management**: React hooks with centralized reducer

## 📁 Project Structure

```
src/
 ├─ components/
 │   ├─ PageGrid/        # Main grid view with drag & drop
 │   ├─ PageTile/         # Individual page thumbnail component
 │   ├─ Toolbar/          # Top toolbar with actions
 │   └─ UploadZone/       # File upload area
 ├─ state/
 │   └─ workspaceStore.ts # Centralized state management
 ├─ pdf/
 │   ├─ parser.ts         # PDF parsing and page extraction
 │   ├─ exporter.ts       # PDF generation and export
 │   └─ thumbnails.ts     # Thumbnail generation
 ├─ types.ts              # TypeScript type definitions
 └─ App.tsx               # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 Usage

### Uploading PDFs

1. **Drag & Drop**: Drag PDF files onto the upload zone
2. **Click to Upload**: Click the upload zone to select files
3. **Add More**: Use the floating "+" button to add more PDFs to your workspace

### Working with Pages

- **Select**: Click a page to select it
- **Multi-Select**: Shift+Click to select a range
- **Reorder**: Drag pages to reorder them
- **Rotate**: Hover over a page and click the rotate button
- **Delete**: Hover over a page and click the delete button, or select pages and press Delete/Backspace

### Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` - Redo
- `Delete` or `Backspace` - Delete selected pages
- `Escape` - Clear selection

### Exporting

- **Export All**: Click "Export PDF" in the toolbar
- **Export Selected**: Select pages and click "Export Selected"

## 🏗️ Architecture

### State Management

The application uses a centralized reducer pattern with immutable state updates:

- **Workspace State**: Contains all documents, pages, selections, and history
- **Actions**: Pure action objects that describe state changes
- **History Stack**: Maintains undo/redo history (max 50 actions)

### PDF Processing

1. **Parsing**: PDFs are loaded using pdf-lib and parsed into individual pages
2. **Thumbnails**: Each page is rendered to a canvas using PDF.js
3. **Export**: Pages are copied from source documents, rotated if needed, and combined into a new PDF

### Performance Considerations

- Thumbnails are generated asynchronously
- Large PDFs (100+ pages) are supported
- Memory is managed by cleaning up blob URLs
- Drag & drop uses efficient collision detection

## 🧪 Quality Assurance

The application has been tested with:

- ✅ Large PDFs (100+ pages)
- ✅ Multiple PDF uploads
- ✅ Undo/redo reliability
- ✅ Drag & drop edge cases
- ✅ Export correctness
- ✅ Memory leak prevention
- ✅ Layout stability

## 🎨 Design System

- **Font**: Inter (with system font fallback)
- **Colors**: Neutral gray palette with blue accent (#3b82f6)
- **Spacing**: Consistent Tailwind spacing scale
- **Shadows**: Subtle shadows for depth
- **Animations**: Fast micro-animations (150ms transitions)

## ♿ Accessibility

- Keyboard navigation support
- Focus indicators on interactive elements
- ARIA labels where needed
- High contrast mode compatibility
- Screen reader friendly

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or issues, please contact the maintainer.

## 📚 Technical Decisions

### Why pdf-lib?

- Pure JavaScript, works client-side
- No server required
- Good performance
- Active maintenance

### Why @dnd-kit?

- Modern, accessible drag & drop
- Better than react-dnd for this use case
- Supports keyboard navigation
- Smooth animations

### Why Vite?

- Fast development server
- Optimized production builds
- Great TypeScript support
- Modern tooling

## 🐛 Known Limitations

- PDF.js worker must be loaded from CDN (can be self-hosted)
- Very large PDFs (>500 pages) may take time to process
- Complex PDFs with embedded fonts may render differently

## 🔮 Future Enhancements

Potential improvements:

- [ ] Page annotations/notes
- [ ] PDF compression options
- [ ] Batch operations
- [ ] Custom page sizes
- [ ] Watermark support
- [ ] Page numbering options

---

Built with ❤️ for professional PDF workflows.
