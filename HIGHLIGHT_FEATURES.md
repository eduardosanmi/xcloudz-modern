# Highlight Features Documentation

## Overview

The Xcloudz Modern Visualizer now includes interactive highlighting features that allow users to visually explore relationships between tags and URL nodes. When hovering over or clicking on nodes, related nodes are highlighted while unrelated nodes are dimmed.

## Features

### 1. Hover Highlighting (`highlightOnHover`)

When enabled, hovering over any node (tag or URL box) will:
- **Highlight** the hovered node and all related nodes
- **Dim** all unrelated nodes to 30% opacity with grayscale effect
- **Apply visual effects** to highlighted nodes:
  - 10% scale increase
  - 20% brightness increase
  - Blue color and glow effect on tag labels
  - Blue border and glow on URL boxes

**How it works:**
- Hover over a **tag** → highlights all URLs that use that tag
- Hover over a **URL box** → highlights the URL itself and all its tags

### 2. Click Highlighting (`highlightOnClick`)

When enabled, clicking on any node will:
- **Lock** the highlight state (persists even when mouse moves away)
- **Toggle** behavior: clicking the same node again will deselect it
- **Clear** by clicking on the background or clicking another node
- **Priority** over hover highlighting (click takes precedence)

**Use cases:**
- Compare which URLs share common tags
- Explore tag relationships
- Focus on specific content while navigating

## Configuration

Both features can be toggled independently via the `CloudzConfig` interface:

```typescript
const config: CloudzConfig = {
  // ... other config options
  highlightOnHover: true,   // Enable hover highlighting (default: false)
  highlightOnClick: true,   // Enable click highlighting (default: false)
};
```

### Demo Page Controls

The demo page includes checkbox controls for both features:
- ☑️ **Highlight on Hover** - Toggle hover highlighting
- ☑️ **Highlight on Click** - Toggle click/lock highlighting

## Technical Implementation

### Architecture

1. **State Management** (`CloudzViewer.tsx`):
   - `hoveredNodeId` - Tracks currently hovered node
   - `clickedNodeId` - Tracks clicked/locked node
   - `highlightedNodeIds` - Set of all nodes to highlight

2. **Relationship Calculation** (`getRelatedNodeIds`):
   - Traverses graph edges to find connected nodes
   - Returns a Set of related node IDs

3. **Renderer Integration** (`DOMRenderer.ts`):
   - `setHighlightedNodes()` - Updates which nodes should be highlighted
   - `setOnNodeHover()` - Callback when mouse enters/leaves a node
   - `setOnNodeClick()` - Callback when a node is clicked
   - `updateElement()` - Applies CSS classes based on highlight state

4. **CSS Styling** (`CloudzViewer.css`):
   - `.cloudz-highlighted` - Styling for highlighted nodes
   - `.cloudz-dimmed` - Styling for non-related nodes

### Visual Effects

**Highlighted Nodes:**
```css
.cloudz-highlighted {
  transform: scale(1.1);          /* Slightly larger */
  filter: brightness(1.2);        /* Brighter */
}

/* Tag-specific highlighting */
.cloudz-highlighted .cloudz-tag-label {
  color: #0066cc;                 /* Blue text */
  text-shadow: 0 0 10px rgba(0, 102, 204, 0.5); /* Glow */
}

/* URL box-specific highlighting */
.cloudz-highlighted .cloudz-url-content {
  box-shadow: 0 0 20px rgba(0, 102, 204, 0.6); /* Blue glow */
  border: 2px solid #0066cc;      /* Blue border */
}
```

**Dimmed Nodes:**
```css
.cloudz-dimmed {
  opacity: 0.3 !important;        /* Very transparent */
  filter: grayscale(0.5);         /* Partially gray */
}
```

## Usage Examples

### Example 1: Basic Usage

```typescript
import { CloudzViewer } from './components/CloudzViewer';
import { CloudzDataItem } from './core/types';

const data: CloudzDataItem[] = [
  { description: "React Docs", url: "https://react.dev", tags: ["react", "docs"] },
  { description: "Vite Docs", url: "https://vitejs.dev", tags: ["vite", "docs"] }
];

<CloudzViewer
  data={data}
  config={{
    width: 800,
    height: 600,
    graphCompression: 45,
    lensAugment: 4,
    highlightOnHover: true,   // Enable hover highlighting
    highlightOnClick: true    // Enable click highlighting
  }}
/>
```

### Example 2: Hover Only

```typescript
<CloudzViewer
  data={data}
  config={{
    // ... other config
    highlightOnHover: true,   // Show highlights on hover
    highlightOnClick: false   // Don't lock highlights on click
  }}
/>
```

### Example 3: Click Only (Lock Mode)

```typescript
<CloudzViewer
  data={data}
  config={{
    // ... other config
    highlightOnHover: false,  // No hover highlights
    highlightOnClick: true    // Only show highlights when clicked
  }}
/>
```

## User Interaction Flow

### Hover Mode
1. User moves mouse over a tag labeled "react"
2. System finds all URL nodes with "react" tag
3. Tag "react" + related URLs are highlighted with blue glow
4. All other nodes are dimmed to 30% opacity
5. User moves mouse away → all highlights clear

### Click Mode
1. User clicks on a tag labeled "react"
2. System finds all related nodes (same as hover)
3. Nodes are highlighted and **stay highlighted**
4. User can move mouse anywhere - highlights persist
5. User clicks background or another node → highlights clear

### Combined Mode (Both Enabled)
1. Click takes priority over hover
2. If a node is clicked (locked), hover doesn't override it
3. Clicking background clears the lock, hover works again

## Graph Relationship Logic

The highlighting follows the graph's edge structure:

```
Tag Node "react"
  └─ edges: [URL1, URL2, URL3]
  
URL Node "React Docs"
  └─ edges: [Tag "react", Tag "docs", Tag "frontend"]
```

When highlighting:
- **Tag → URLs**: Follow edges to connected URL nodes
- **URL → Tags**: Follow edges to connected tag nodes
- **Bidirectional**: The relationship is symmetric

## Performance Considerations

- **Set-based lookups** for O(1) highlighting checks
- **CSS transitions** provide smooth visual feedback
- **Minimal re-renders** - only when highlight state changes
- **Event delegation** - listeners attached at node creation

## Browser Compatibility

- ✅ Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- ✅ CSS transforms and filters
- ✅ CSS transitions for smooth effects
- ⚠️ IE11: Not supported (uses modern ES6+ features)

## Future Enhancements

Possible improvements:
- [ ] Configurable highlight colors
- [ ] Animation duration settings
- [ ] Different highlight styles (outline, glow, underline)
- [ ] Multi-select (Ctrl+Click to highlight multiple nodes)
- [ ] Highlight path visualization (draw lines between related nodes)
- [ ] Keyboard navigation (Tab to cycle through nodes)

## Troubleshooting

**Issue**: Highlights don't appear
- Check that `highlightOnHover` or `highlightOnClick` is `true`
- Verify CSS is loaded correctly
- Check browser console for errors

**Issue**: Highlights stuck on screen
- Click on the background to clear locked highlights
- Disable/re-enable the feature to reset state

**Issue**: Performance issues with large datasets
- Consider reducing visual effects complexity
- Use Canvas renderer for better performance (future enhancement)

## Related Files

- `src/core/types.ts` - CloudzConfig interface
- `src/components/CloudzViewer.tsx` - Main component with highlight logic
- `src/components/CloudzViewer.css` - Highlight styling
- `src/renderers/dom-renderer.ts` - DOM-based highlight implementation
- `src/demo/DemoPage.tsx` - Demo with UI controls

