# Contributing to Xcloudz Modern

Thank you for your interest in contributing to Xcloudz Modern! This document provides guidelines for contributing to the project.

## 🎯 Project Overview

Xcloudz Modern is a TypeScript/React reimplementation of the original Xcloudz hyperbolic visualization framework. We aim to preserve the mathematical elegance of the original algorithms while leveraging modern web technologies.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Setup Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/xcloudz-modern.git
   cd xcloudz-modern
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
5. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

## 📝 How to Contribute

### Reporting Issues

Before creating an issue, please:
- Check if the issue already exists
- Use the appropriate issue template
- Provide clear reproduction steps
- Include relevant system information

### Submitting Pull Requests

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Add tests** for new functionality

4. **Run the test suite**:
   ```bash
   npm test
   npm run build  # Ensure it builds successfully
   ```

5. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat: add new visualization feature"
   ```

6. **Push to your fork** and create a pull request

## 🎨 Coding Standards

### TypeScript Guidelines

- Use **strict TypeScript** - all code must pass `tsc --noEmit`
- Prefer **interfaces over types** for object shapes
- Use **explicit return types** for public functions
- Add **JSDoc comments** for public APIs

```typescript
/**
 * Computes hyperbolic transformation for a set of nodes
 * @param nodes - Array of graph nodes to transform
 * @param config - Transformation configuration
 * @returns Map of node IDs to their hyperbolic transforms
 */
export function computeTransforms(
  nodes: GraphNode[],
  config: TransformConfig
): Map<string, HyperbolicTransform> {
  // Implementation
}
```

### React Guidelines

- Use **functional components** with hooks
- Prefer **useCallback** and **useMemo** for performance
- Keep components **focused and single-purpose**
- Use **TypeScript interfaces** for props

```typescript
interface CloudzViewerProps {
  data: CloudzDataItem[];
  config?: Partial<CloudzConfig>;
  onNodeClick?: (node: GraphNode) => void;
}

export const CloudzViewer: React.FC<CloudzViewerProps> = ({
  data,
  config,
  onNodeClick
}) => {
  // Implementation
};
```

### File Organization

```
src/
├── core/           # Core algorithms and types
├── renderers/      # Rendering implementations
├── components/     # React components
├── visualizers/    # Plugin system
├── demo/          # Demo and examples
└── test/          # Unit tests
```

### Naming Conventions

- **Files**: `kebab-case.ts` or `PascalCase.tsx` for components
- **Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)

## 🧪 Testing Guidelines

### Writing Tests

- Place tests in `src/test/` directory
- Use descriptive test names
- Test both happy path and edge cases
- Mock external dependencies

```typescript
describe('HyperbolicMath', () => {
  it('should transform coordinates to hyperbolic space', () => {
    const result = HyperbolicMath.mapToHyperbolic(400, 300, 800, 600, 4);
    
    expect(result.coord).toHaveLength(2);
    expect(result.alpha).toBeGreaterThanOrEqual(0);
    expect(result.alpha).toBeLessThanOrEqual(1);
  });
});
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:ui       # Interactive test UI
npm run test:coverage # Generate coverage report
```

## 📚 Documentation

### Code Documentation

- Add **JSDoc comments** for all public APIs
- Include **usage examples** in documentation
- Document **complex algorithms** with inline comments
- Update **README.md** for new features

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add canvas renderer for better performance
fix: resolve memory leak in web worker
docs: update API documentation for transforms
test: add unit tests for graph engine
refactor: simplify hyperbolic math calculations
```

## 🎯 Areas for Contribution

### High Priority

- **WebGL Renderer** - For handling 1000+ nodes
- **3D Visualization** - Hyperbolic 3-space support
- **Performance Optimization** - Algorithm improvements
- **Accessibility** - ARIA labels and keyboard navigation

### Medium Priority

- **Additional Layouts** - Radial, hierarchical, circular
- **Export Features** - SVG, PNG, PDF output
- **Animation System** - Smooth layout transitions
- **Search/Filter** - Find nodes by query

### Documentation & Examples

- **Tutorial Series** - Step-by-step guides
- **Code Examples** - Real-world use cases
- **Performance Guides** - Optimization strategies
- **Migration Guides** - From legacy Xcloudz

## 🔍 Code Review Process

### What We Look For

- **Correctness** - Does the code work as intended?
- **Performance** - Are there any performance implications?
- **Maintainability** - Is the code easy to understand and modify?
- **Testing** - Are there adequate tests?
- **Documentation** - Is the code properly documented?

### Review Timeline

- Initial review within **48 hours**
- Follow-up reviews within **24 hours**
- Merge after **2 approvals** from maintainers

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment** (OS, browser, Node.js version)
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** or **code snippets** if applicable
- **Console errors** or **stack traces**

## 💡 Feature Requests

For new features, please:

- **Check existing issues** to avoid duplicates
- **Describe the use case** and motivation
- **Provide examples** of how it would be used
- **Consider implementation complexity**
- **Discuss with maintainers** before starting work

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and ideas
- **Code Review** - For implementation feedback

## 🏆 Recognition

Contributors will be:
- **Listed in README.md** acknowledgments
- **Tagged in release notes** for their contributions
- **Invited as collaborators** for significant contributions

## 📄 License

By contributing to Xcloudz Modern, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make Xcloudz Modern better! 🎉