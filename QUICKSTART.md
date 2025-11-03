# 🚀 Quick Start Guide

Get up and running with Xcloudz Modern in 5 minutes!

## 📥 Installation

```bash
cd xcloudz-modern
npm install
```

## ▶️ Run the Demo

```bash
npm run dev
```

Open your browser to **http://localhost:5173**

You'll see an interactive visualization with drag, zoom, and click controls!

## 🎯 Basic Usage

### 1. Simple Example

```typescript
import { CloudzViewer } from './components/CloudzViewer';

const data = [
  {
    description: "React 19",
    url: "https://react.dev",
    tags: ["react", "frontend"]
  },
  {
    description: "TypeScript",
    url: "https://typescriptlang.org",
    tags: ["typescript", "language"]
  }
];

function App() {
  return <CloudzViewer data={data} />;
}
```

### 2. With Configuration

```typescript
<CloudzViewer
  data={data}
  config={{
    width: 800,
    height: 600,
    lensAugment: 4,          // Magnification strength
    enableAutoAnimation: true,
    useWebWorker: true        // Background processing
  }}
  onNodeClick={(node) => {
    console.log('Clicked:', node);
  }}
/>
```

### 3. With Canvas Renderer (Better Performance)

```typescript
import { CloudzViewer } from './components/CloudzViewer';
import { CanvasRenderer } from './renderers/canvas-renderer';

const canvasRenderer = new CanvasRenderer();

<CloudzViewer
  data={largeDataset}
  renderer={canvasRenderer}
/>
```

## 🎮 Controls

- **Drag**: Click and drag to pan
- **Scroll**: Mouse wheel to zoom
- **Double-click**: Center on nearest node
- **Click**: Trigger onNodeClick callback

## 📊 Data Format

Your data should follow this structure:

```typescript
interface CloudzDataItem {
  description: string;   // Display text
  url: string;          // Link or identifier
  tags: string[];       // Category tags
  id?: string;          // Optional unique ID
  dateTime?: string;    // Optional ISO date
}
```

**Example**:

```typescript
const myData = [
  {
    description: "Machine Learning Guide",
    url: "https://example.com/ml",
    tags: ["ai", "machine-learning", "guide"]
  },
  {
    description: "React Tutorial",
    url: "https://example.com/react",
    tags: ["react", "tutorial", "frontend"]
  }
];
```

## 🧪 Run Tests

```bash
npm test          # Run once
npm run test:ui   # Interactive UI
npm run test:coverage  # With coverage
```

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 🎨 Customize Appearance

Edit `src/components/CloudzViewer.css`:

```css
.cloudz-tag-label {
  font-size: 32px;
  color: #your-color;
}

.cloudz-url-content {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
}
```

## 🔌 Add Custom Visualizer

```typescript
import { visualizerRegistry } from './visualizers/registry';

visualizerRegistry.register({
  id: 'my-viz',
  name: 'My Custom Visualizer',
  render: (params) => {
    return (
      <div style={{ padding: '10px' }}>
        {params.node.id}
      </div>
    );
  }
});
```

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed API documentation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Explore [src/demo/DemoPage.tsx](./src/demo/DemoPage.tsx) for advanced examples
- Review [tests](./src/test/) to understand the API

## 💡 Common Customizations

### Change Magnification

```typescript
config={{ lensAugment: 6 }}  // Higher = more zoom
```

### Disable Auto-Animation

```typescript
config={{ enableAutoAnimation: false }}
```

### Increase Layout Iterations (Better Quality)

```typescript
config={{ springIterations: 1000 }}  // Default: 500
```

### Adjust Viewport Size

```typescript
config={{ width: 1200, height: 800 }}
```

### Use Main Thread (No Web Worker)

```typescript
config={{ useWebWorker: false }}
```

## 🐛 Troubleshooting

### Issue: Nodes overlap too much
**Solution**: Increase `springIterations` in config

### Issue: Performance is slow
**Solution**: Use CanvasRenderer or disable auto-animation

### Issue: Layout looks compressed
**Solution**: Adjust `graphCompression` (default: 45)

### Issue: Web Worker not working
**Solution**: Set `useWebWorker: false` to use main thread

## 🆘 Need Help?

- Check the [README.md](./README.md) for full documentation
- Review the [demo source code](./src/demo/DemoPage.tsx)
- Run tests to see API usage: `npm test`
- Open an issue on GitHub (if applicable)

## ✨ You're Ready!

Start building your interactive visualizations with Xcloudz Modern!

Happy coding! 🎉

