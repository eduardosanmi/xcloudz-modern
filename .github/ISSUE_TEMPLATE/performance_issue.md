---
name: Performance issue
about: Report performance problems or optimization suggestions
title: '[PERFORMANCE] '
labels: performance
assignees: ''

---

## ⚡ Performance Issue Description

A clear and concise description of the performance problem.

## 📊 Performance Metrics

**Current Performance:**
- Rendering FPS: [e.g. 30 FPS, choppy, smooth]
- Layout computation time: [e.g. 2 seconds, 500ms]
- Memory usage: [e.g. 500MB, growing over time]
- CPU usage: [e.g. 80%, spikes to 100%]

**Expected Performance:**
- Target FPS: [e.g. 60 FPS]
- Target layout time: [e.g. under 1 second]
- Target memory usage: [e.g. under 200MB]

## 🔢 Dataset Information

- **Number of nodes**: [e.g. 100, 500, 1000+]
- **Number of edges**: [e.g. 200, 1000, 5000+]
- **Data complexity**: [e.g. simple tags, complex metadata]
- **Update frequency**: [e.g. static, real-time updates]

## ⚙️ Configuration

```typescript
const config = {
  width: 800,
  height: 600,
  springIterations: 500,
  useWebWorker: true,
  // ... other relevant config
};
```

**Renderer Used:**
- [ ] DOM Renderer
- [ ] Canvas Renderer
- [ ] Custom Renderer

## 🖥️ Environment

- **OS**: [e.g. Windows 10, macOS 12.0, Ubuntu 20.04]
- **Browser**: [e.g. Chrome 120, Firefox 119, Safari 16]
- **Device**: [e.g. Desktop, Laptop, Mobile]
- **CPU**: [e.g. Intel i7, M1 Mac, AMD Ryzen]
- **RAM**: [e.g. 8GB, 16GB, 32GB]
- **GPU**: [e.g. Integrated, NVIDIA GTX 1060, AMD RX 580]

## 🔍 Profiling Data

If you have profiling data, please include:

**Browser DevTools Performance:**
- Screenshots of performance timeline
- Memory snapshots
- CPU profiling results

**Console Timing:**
```
Layout computation: 1.2s
Transform calculation: 300ms
Rendering: 150ms
```

## 🎯 Specific Scenarios

**When does the performance issue occur?**
- [ ] Initial load
- [ ] During interactions (drag, zoom)
- [ ] With large datasets
- [ ] After extended use
- [ ] During animations
- [ ] Other: ___________

## 🔧 Attempted Solutions

What have you tried to improve performance?
- [ ] Enabled Web Worker
- [ ] Switched to Canvas renderer
- [ ] Reduced spring iterations
- [ ] Disabled auto-animation
- [ ] Other: ___________

## 💡 Optimization Suggestions

If you have ideas for performance improvements:

- Algorithm optimizations
- Rendering optimizations
- Memory management improvements
- Configuration recommendations

## 📈 Benchmarking

**Test Case:**
```typescript
// Provide a minimal test case that reproduces the performance issue
const testData = [
  // ... sample data
];
```

**Measurement Method:**
- [ ] Browser DevTools
- [ ] Custom timing code
- [ ] External profiling tools
- [ ] User experience observation

## 🎯 Impact

**How does this affect your use case?**
- [ ] Blocks development
- [ ] Poor user experience
- [ ] Limits dataset size
- [ ] Prevents production use

## 🔍 Additional Context

Any other context about the performance issue:
- Comparison with other visualization libraries
- Specific user workflows affected
- Business impact