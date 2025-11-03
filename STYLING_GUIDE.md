# Styling Guide for Xcloudz Modern

## Current Approach: CSS Classes

The visualization uses standard CSS classes that you can override. This is the simplest and most performant approach.

### Customizing Highlight Colors

Edit `src/components/CloudzViewer.css`:

```css
/* Tag highlighting - currently blue */
.cloudz-highlighted .cloudz-tag-label {
  color: #0066cc;  /* Change this */
  text-shadow: 0 0 10px rgba(0, 102, 204, 0.5);  /* And this */
}

/* Box highlighting - currently orange */
.cloudz-highlighted .cloudz-url-content {
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.6);  /* Change this */
  border: 2px solid #ff8c00;  /* And this */
}
```

---

## Alternative: CSS Variables (More Flexible)

For better customization without editing CSS files, we could use CSS variables:

### Implementation

**1. Update CloudzViewer.css:**

```css
.cloudz-viewer {
  /* Define default theme colors */
  --cloudz-tag-highlight-color: #0066cc;
  --cloudz-tag-highlight-glow: rgba(0, 102, 204, 0.5);
  --cloudz-box-highlight-color: #ff8c00;
  --cloudz-box-highlight-glow: rgba(255, 140, 0, 0.6);
  --cloudz-dimmed-opacity: 0.3;
  --cloudz-highlight-scale: 1.1;
}

.cloudz-highlighted .cloudz-tag-label {
  color: var(--cloudz-tag-highlight-color);
  text-shadow: 0 0 10px var(--cloudz-tag-highlight-glow);
}

.cloudz-highlighted .cloudz-url-content {
  box-shadow: 0 0 20px var(--cloudz-box-highlight-glow);
  border: 2px solid var(--cloudz-box-highlight-color);
}

.cloudz-dimmed {
  opacity: var(--cloudz-dimmed-opacity) !important;
}
```

**2. Usage in your app:**

```jsx
<CloudzViewer
  data={data}
  config={config}
  style={{
    '--cloudz-tag-highlight-color': '#ff0000',  // Red tags
    '--cloudz-box-highlight-color': '#00ff00',  // Green boxes
    '--cloudz-dimmed-opacity': '0.2'
  }}
/>
```

Or via CSS:

```css
.my-custom-cloudz {
  --cloudz-tag-highlight-color: #9b59b6;  /* Purple tags */
  --cloudz-box-highlight-color: #e74c3c;  /* Red boxes */
}
```

---

## Alternative: Theme Config Object (Most Flexible)

For maximum flexibility, we could add a theme configuration object:

### Implementation

**1. Add to types.ts:**

```typescript
export interface CloudzTheme {
  tagHighlight?: {
    color?: string;
    glowColor?: string;
    scale?: number;
  };
  boxHighlight?: {
    borderColor?: string;
    glowColor?: string;
    scale?: number;
  };
  dimmed?: {
    opacity?: number;
    grayscale?: number;
  };
}

export interface CloudzConfig {
  // ... existing config
  theme?: CloudzTheme;
}
```

**2. Apply in DOMRenderer:**

```typescript
private applyTheme(element: HTMLElement, node: GraphNode, isHighlighted: boolean) {
  if (isHighlighted) {
    const theme = this.config?.theme;
    
    if (node.type === 'tag') {
      const tagTheme = theme?.tagHighlight;
      if (tagTheme?.color) {
        element.style.color = tagTheme.color;
      }
      if (tagTheme?.scale) {
        element.style.transform = `scale(${tagTheme.scale})`;
      }
    } else {
      const boxTheme = theme?.boxHighlight;
      if (boxTheme?.borderColor) {
        element.style.borderColor = boxTheme.borderColor;
      }
    }
  }
}
```

**3. Usage:**

```typescript
<CloudzViewer
  data={data}
  config={{
    width: 800,
    height: 600,
    theme: {
      tagHighlight: {
        color: '#9b59b6',
        glowColor: 'rgba(155, 89, 182, 0.5)',
        scale: 1.15
      },
      boxHighlight: {
        borderColor: '#e74c3c',
        glowColor: 'rgba(231, 76, 60, 0.6)',
        scale: 1.1
      },
      dimmed: {
        opacity: 0.2,
        grayscale: 0.7
      }
    }
  }}
/>
```

---

## Comparison

| Approach | Ease of Use | Flexibility | Performance | Best For |
|----------|-------------|-------------|-------------|----------|
| **Pure CSS** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | Single theme apps |
| **CSS Variables** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Multiple themes |
| **Config Object** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Per-instance themes |

---

## Recommendation

For most use cases, **CSS Variables** offer the best balance:
- Easy to use
- Good performance
- Flexible per-instance customization
- Standard web practice
- Works with CSS preprocessors

Would you like me to implement CSS variables for the highlight styling?

