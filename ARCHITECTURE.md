# 🏗️ Architecture Documentation

## High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│                      (React Components)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CloudzViewer                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Props:                                                   │  │
│  │  • data: CloudzDataItem[]                                │  │
│  │  • config: CloudzConfig                                  │  │
│  │  • renderer: IRenderer                                   │  │
│  │  • onNodeClick, onLayoutComplete                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  State Management (React Hooks):                         │  │
│  │  • nodes: GraphNode[]                                    │  │
│  │  • transforms: Map<id, HyperbolicTransform>             │  │
│  │  • lensAugment, smoothness, isLoading                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────┬─────────────────────────────┬────────────────────────────┘
        │                             │
        ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  Main Thread     │          │  Web Worker      │
│  Computation     │          │  (Optional)      │
└───────┬──────────┘          └────────┬─────────┘
        │                              │
        ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Core Engines                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  GraphEngine     │  │ HyperbolicMath   │  │  IRenderer   │ │
│  │                  │  │                  │  │              │ │
│  │ • buildFromData  │  │ • mapToHyperbolic│  │ • DOMRenderer│ │
│  │ • computeLayout  │  │ • fisheyeIn/Out  │  │ • Canvas...  │ │
│  │ • serialize      │  │ • normalize      │  │              │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initialization Flow

```
User provides data
     │
     ▼
CloudzViewer receives CloudzDataItem[]
     │
     ▼
Decision: Use Web Worker?
     │
     ├─── YES ──▶ Post message to Worker
     │              │
     │              ▼
     │           Worker: GraphEngine.buildFromData()
     │              │
     │              ▼
     │           Worker: GraphEngine.computeLayout()
     │              │
     │              ▼
     │           Worker: Serialize nodes
     │              │
     │              ▼
     │           Post message back to main thread
     │              │
     │              └──────┐
     │                     │
     └─── NO ───▶ Main Thread: GraphEngine.buildFromData()
                   │         │
                   │         ▼
                   │      Main Thread: GraphEngine.computeLayout()
                   │         │
                   └─────────┘
                             │
                             ▼
                   HyperbolicMath.normalizeCoordinates()
                             │
                             ▼
                   setState(nodes)
                             │
                             ▼
                   Trigger transforms computation
```

### 2. Transform & Render Flow

```
nodes state updated
     │
     ▼
useEffect triggers
     │
     ▼
HyperbolicMath.computeTransforms()
     │
     ├─ For each node:
     │   │
     │   ▼
     │  mapToHyperbolic(x, y, width, height, lensAugment)
     │   │
     │   ├─ Normalize to [-1, 1]
     │   │
     │   ├─ Convert to polar (angle, radius)
     │   │
     │   ├─ Apply fisheyeIn(radius, magnification)
     │   │
     │   ├─ Convert back to Cartesian
     │   │
     │   └─ Denormalize to viewport coordinates
     │
     ▼
setState(transforms)
     │
     ▼
useEffect triggers
     │
     ▼
IRenderer.render(nodes, transforms)
     │
     ├─ DOMRenderer: Create/update div elements
     │   │
     │   ├─ Calculate scale = 1.01 - alpha
     │   ├─ Set position, size, fontSize, zIndex
     │   └─ Set content based on node type
     │
     └─ CanvasRenderer: Draw on canvas
         │
         ├─ Clear canvas
         ├─ Sort nodes by depth (alpha)
         ├─ For each node:
         │   ├─ Calculate dimensions
         │   ├─ Draw background box
         │   └─ Draw text/content
         └─ Store hit regions
```

### 3. Interaction Flow

```
User interacts
     │
     ├─── Mouse Wheel ───▶ handleWheel()
     │                      │
     │                      ├─ delta = e.deltaY > 0 ? -1 : 1
     │                      ├─ setLensAugment(prev + delta)
     │                      └─ Triggers re-transform & re-render
     │
     ├─── Mouse Down ────▶ handleMouseDown()
     │                      │
     │                      └─ dragState.isDragging = true
     │
     ├─── Mouse Move ────▶ handleMouseMove()
     │                      │
     │                      ├─ If dragging:
     │                      │   ├─ Calculate deltaX, deltaY
     │                      │   ├─ Update all node positions
     │                      │   └─ Triggers re-transform & re-render
     │                      │
     │                      └─ Else: no-op
     │
     ├─── Mouse Up ──────▶ handleMouseUp()
     │                      │
     │                      └─ dragState.isDragging = false
     │
     └─── Double Click ──▶ handleDoubleClick()
                            │
                            ├─ Find nearest node (renderer.getNodeAtPosition)
                            │
                            ├─ centerOnNode(node)
                            │   │
                            │   ├─ Calculate delta to center
                            │   ├─ Animate in 20 steps
                            │   └─ Update node positions each frame
                            │
                            └─ Call onNodeClick callback
```

## Module Breakdown

### Core (`src/core/`)

#### `types.ts`
- **Purpose**: Central type definitions
- **Exports**: 
  - Interfaces: CloudzDataItem, GraphNode, Graph, HyperbolicTransform, CloudzConfig
  - Enums: WorkerMessageType
  - Type guards: TypeGuards namespace
- **Dependencies**: None (pure types)

#### `graph.ts`
- **Purpose**: Graph data structure and spring layout algorithm
- **Key Classes**: 
  - `GraphEngine`: Builds graph, computes layout, serialization
- **Algorithm**: Force-directed spring layout
  - Repulsive forces between all node pairs
  - Attractive forces along edges
  - Iterative position updates with damping
- **Dependencies**: types.ts

#### `transforms.ts`
- **Purpose**: Hyperbolic/fisheye mathematics
- **Key Class**: `HyperbolicMath` (static methods)
- **Key Functions**:
  - `fisheyeIn/Out`: Distortion functions
  - `toPolar/toCartesian`: Coordinate conversion
  - `mapToHyperbolic`: Main transformation
  - `normalizeCoordinates`: Viewport fitting
  - `computeTransforms`: Batch processing
- **Dependencies**: types.ts

#### `layout.worker.ts`
- **Purpose**: Web Worker for background computation
- **Message Types**:
  - COMPUTE_LAYOUT: Request layout computation
  - LAYOUT_COMPLETE: Return computed nodes
  - COMPUTE_TRANSFORMS: Request transform computation
  - TRANSFORMS_COMPLETE: Return transforms
- **Dependencies**: graph.ts, transforms.ts, types.ts

### Renderers (`src/renderers/`)

#### `dom-renderer.ts`
- **Purpose**: HTML/DOM-based rendering
- **Implements**: IRenderer interface
- **Features**:
  - Creates div elements for each node
  - Updates positions via style attributes
  - Supports custom HTML content injection
  - Legacy-compatible output
- **Performance**: Good for <100 nodes
- **Dependencies**: types.ts

#### `canvas-renderer.ts`
- **Purpose**: Canvas 2D rendering
- **Implements**: IRenderer interface
- **Features**:
  - Draws on single canvas element
  - Text wrapping and rounded rectangles
  - Hit region tracking for interactions
  - Z-order sorting
- **Performance**: Excellent for 100+ nodes
- **Dependencies**: types.ts

### Visualizers (`src/visualizers/`)

#### `registry.ts`
- **Purpose**: Type-safe visualizer plugin system
- **Key Class**: `VisualizerRegistry`
- **Features**:
  - Generic type parameters for type safety
  - Validation support
  - Global singleton instance
  - Decorator support (experimental)
- **Dependencies**: types.ts

#### `built-in.tsx`
- **Purpose**: Default visualizers
- **Exports**:
  - defaultNodeVisualizer: Standard node rendering
  - tagVisualizer: Enhanced tag display
  - urlVisualizer: URL content with thumbnails
  - barChartVisualizer: Example custom visualizer
  - registerBuiltInVisualizers(): Registration function
- **Dependencies**: types.ts, registry.ts, React

### Components (`src/components/`)

#### `CloudzViewer.tsx`
- **Purpose**: Main viewer component
- **React Hooks Used**:
  - `useState`: nodes, transforms, lensAugment, smoothness, isLoading
  - `useEffect`: Initialize renderer, worker, compute layout, transforms, auto-animation
  - `useCallback`: Event handlers (memoized)
  - `useMemo`: Config merging
  - `useRef`: containerRef, workerRef, rendererRef, dragState
- **Props**: data, config, renderer, onNodeClick, onLayoutComplete
- **Features**:
  - Automatic Web Worker initialization
  - Fallback to main thread
  - Interactive controls
  - Loading state management
- **Dependencies**: All core modules, renderers, types, React

## Performance Considerations

### Bottlenecks

1. **Layout Computation** - O(n²) for repulsive forces
   - **Solution**: Web Worker offloading
   - **Alternative**: Barnes-Hut approximation (future)

2. **Transform Computation** - O(n) but frequent
   - **Solution**: Batch processing in HyperbolicMath.computeTransforms
   - **Alternative**: Incremental updates for visible nodes only

3. **Rendering** - O(n) DOM updates
   - **Solution**: Canvas renderer for large datasets
   - **Alternative**: WebGL renderer (future)

### Optimization Strategies

| Optimization | Trade-off | When to Use |
|-------------|-----------|-------------|
| Web Worker | Serialization overhead | >50 nodes |
| Canvas Renderer | No HTML content | >100 nodes |
| Reduce iterations | Layout quality | Interactive editing |
| Disable auto-animation | Less engaging | Static visualizations |
| Lower smoothness | Jittery drag | High-end devices |

### Memory Profile

```
Small dataset (10 nodes):
  - Graph: ~5 KB
  - Transforms: ~1 KB
  - DOM elements: ~10 KB
  Total: ~16 KB

Large dataset (500 nodes):
  - Graph: ~250 KB
  - Transforms: ~50 KB
  - DOM elements: ~500 KB
  - Canvas buffer: ~2 MB
  Total: ~2.8 MB
```

## Extension Points

### 1. Custom Renderers

Implement `IRenderer` interface:
```typescript
interface IRenderer {
  initialize(container: HTMLElement, config: CloudzConfig): void;
  render(nodes: GraphNode[], transforms: Map<string, HyperbolicTransform>): void;
  clear(): void;
  dispose(): void;
  getNodeAtPosition(x: number, y: number): string | null;
}
```

Examples:
- WebGLRenderer: GPU-accelerated rendering
- SVGRenderer: Scalable vector graphics
- VirtualDOMRenderer: React-based virtual nodes

### 2. Custom Visualizers

Register with `visualizerRegistry`:
```typescript
visualizerRegistry.register<YourParamsType>({
  id: 'your-viz',
  name: 'Your Visualizer',
  render: (params) => <YourComponent {...params} />,
  validateParams: (params): params is YourParamsType => { /* ... */ }
});
```

### 3. Custom Layout Algorithms

Extend `GraphEngine` or create new engine:
```typescript
class CustomLayoutEngine extends GraphEngine {
  computeLayout(): void {
    // Your algorithm here
  }
}
```

Examples:
- Radial layout
- Hierarchical layout
- Circular layout
- Geographic layout

### 4. Custom Transform Functions

Add to `HyperbolicMath` or create new class:
```typescript
class CustomTransforms {
  static customMap(x, y, config): Transform {
    // Your transformation
  }
}
```

Examples:
- 3D hyperbolic space
- Spherical projection
- Mercator-style distortion

## Testing Strategy

### Unit Tests
- Core algorithms (graph, transforms)
- Pure functions only
- Fast execution (<100ms)

### Integration Tests
- Component rendering
- User interactions
- State management

### Performance Tests
- Layout computation timing
- Render frame rate
- Memory usage

### Visual Regression Tests
- Screenshot comparison
- Layout consistency
- Cross-browser rendering

## Future Enhancements

1. **WebGL Renderer** - 10,000+ nodes
2. **3D Visualization** - Hyperbolic 3-space
3. **Clustering** - Group related nodes
4. **Search/Filter** - Find nodes by query
5. **Export** - SVG/PNG/PDF output
6. **Animations** - Smooth layout transitions
7. **Undo/Redo** - State history
8. **Collaborative** - Multi-user editing

---

*This architecture preserves the elegance of the original Xcloudz while embracing modern patterns and performance optimizations.*

