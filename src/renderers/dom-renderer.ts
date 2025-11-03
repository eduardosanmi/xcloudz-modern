/**
 * DOM-based renderer implementation
 * Renders nodes as HTML div elements (legacy compatible)
 */

import { GraphNode, HyperbolicTransform, IRenderer, CloudzConfig } from '../core/types';

export class DOMRenderer implements IRenderer {
  private container: HTMLElement | null = null;
  private config: CloudzConfig | null = null;
  private nodeElements = new Map<string, HTMLDivElement>();
  private baseWidth = 250;
  private baseHeight = 150;
  private highlightedNodeIds = new Set<string>();
  private onNodeHover?: (nodeId: string | null) => void;
  private onNodeClick?: (nodeId: string | null) => void;
  
  initialize(container: HTMLElement, config: CloudzConfig): void {
    this.container = container;
    this.config = config;
    this.clear();
  }
  
  /**
   * Set highlighted node IDs
   */
  setHighlightedNodes(nodeIds: Set<string>): void {
    this.highlightedNodeIds = nodeIds;
  }
  
  /**
   * Set hover callback
   */
  setOnNodeHover(callback: (nodeId: string | null) => void): void {
    this.onNodeHover = callback;
  }
  
  /**
   * Set click callback
   */
  setOnNodeClick(callback: (nodeId: string | null) => void): void {
    this.onNodeClick = callback;
  }
  
  render(nodes: GraphNode[], transforms: Map<string, HyperbolicTransform>): void {
    if (!this.container || !this.config) {
      throw new Error('Renderer not initialized');
    }
    
    // Remove nodes that no longer exist
    this.nodeElements.forEach((element, id) => {
      if (!nodes.find(n => n.id === id)) {
        element.remove();
        this.nodeElements.delete(id);
      }
    });
    
    // Render each node
    nodes.forEach(node => {
      const transform = transforms.get(node.id);
      if (!transform) return;
      
      let element = this.nodeElements.get(node.id);
      
      if (!element) {
        // Create new element
        element = this.createElement(node);
        this.container!.appendChild(element);
        this.nodeElements.set(node.id, element);
      }
      
      // Update element
      this.updateElement(element, node, transform);
    });
  }
  
  updateNode(node: GraphNode, transform: HyperbolicTransform): void {
    const element = this.nodeElements.get(node.id);
    if (element) {
      this.updateElement(element, node, transform);
    }
  }
  
  clear(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.nodeElements.clear();
  }
  
  dispose(): void {
    this.clear();
    this.container = null;
    this.config = null;
  }
  
  getNodeAtPosition(x: number, y: number): string | null {
    // Check from top to bottom (highest z-index first)
    const elements = Array.from(this.nodeElements.entries())
      .sort((a, b) => {
        const zIndexA = parseInt(a[1].style.zIndex || '0');
        const zIndexB = parseInt(b[1].style.zIndex || '0');
        return zIndexB - zIndexA;
      });
    
    for (const [id, element] of elements) {
      const rect = element.getBoundingClientRect();
      const containerRect = this.container?.getBoundingClientRect();
      
      if (!containerRect) continue;
      
      const relativeX = x + containerRect.left;
      const relativeY = y + containerRect.top;
      
      if (
        relativeX >= rect.left &&
        relativeX <= rect.right &&
        relativeY >= rect.top &&
        relativeY <= rect.bottom
      ) {
        return id;
      }
    }
    
    return null;
  }
  
  private createElement(node: GraphNode): HTMLDivElement {
    const element = document.createElement('div');
    element.className = 'cloudz-node';
    element.setAttribute('data-node-id', node.id);
    element.setAttribute('data-node-type', node.type);
    
    // Add hover event listeners
    element.addEventListener('mouseenter', () => {
      if (this.onNodeHover) {
        this.onNodeHover(node.id);
      }
    });
    
    element.addEventListener('mouseleave', () => {
      if (this.onNodeHover) {
        this.onNodeHover(null);
      }
    });
    
    // Add click event listener
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onNodeClick) {
        this.onNodeClick(node.id);
      }
    });
    
    // Set content based on node type
    if (node.type === 'tag') {
      element.innerHTML = this.createTagContent(node);
    } else {
      element.innerHTML = this.createUrlContent(node);
    }
    
    return element;
  }
  
  private createTagContent(node: GraphNode): string {
    const tagCount = node.data?.tagCount || 0;
    const countText = tagCount > 1 ? ` <span class="tag-count">(${tagCount})</span>` : '';
    
    return `<div class="cloudz-tag-label">${node.id}${countText}</div>`;
  }
  
  private createUrlContent(node: GraphNode): string {
    const data = node.data;
    
    // Check if custom HTML content exists
    if (data?.attachedElementId) {
      const customElement = document.getElementById(data.attachedElementId);
      if (customElement) {
        return `<div class="cloudz-url-content">${customElement.innerHTML}</div>`;
      }
    }
    
    // Default content
    const url = data?.url || '';
    const description = data?.description || node.id;
    
    return `
      <div class="cloudz-url-content">
        <a href="${url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
          ${this.escapeHtml(description)}
        </a>
      </div>
    `;
  }
  
  private updateElement(
    element: HTMLDivElement,
    node: GraphNode,
    transform: HyperbolicTransform
  ): void {
    const [x, y] = transform.coord;
    const scale = 1.01 - transform.alpha;
    
    // Different dimensions for tags vs URLs
    // Tags: much smaller, just enough for text
    // URLs: larger boxes
    const baseWidth = node.type === 'tag' ? 80 : this.baseWidth;
    const baseHeight = node.type === 'tag' ? 40 : this.baseHeight;
    
    // Calculate dimensions
    const width = baseWidth * scale;
    const height = baseHeight * scale;
    
    // Different base font sizes for tags vs URLs
    const baseFontSize = node.type === 'tag' ? 32 : 16;
    const fontSize = Math.min(baseFontSize, baseFontSize * 1.75 * scale);
    
    // Check if this node is highlighted
    const isHighlighted = this.highlightedNodeIds.has(node.id);
    const hasHighlights = this.highlightedNodeIds.size > 0;
    
    // Tags get higher z-index range (100-110) to always be on top of URLs (0-10)
    // But when highlighted, both get even higher z-index to be salient (200+)
    let baseZIndex: number;
    
    if (isHighlighted) {
      // Highlighted nodes get very high z-index (200+) to be on top
      baseZIndex = 200 + (node.type === 'tag' ? 10 : 0);
    } else {
      // Normal z-index: tags above URLs
      baseZIndex = node.type === 'tag' ? 100 : 0;
    }
    
    const zIndex = baseZIndex + Math.floor(10 - transform.alpha * 10);
    
    // Apply styles
    element.style.position = 'absolute';
    element.style.left = `${x - width / 2}px`;
    element.style.top = `${y - height / 2}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.fontSize = `${fontSize}px`;
    element.style.zIndex = `${zIndex}`;
    element.style.opacity = scale > 0.1 ? '1' : '0';
    element.style.pointerEvents = scale > 0.1 ? 'auto' : 'none';
    
    // Apply highlight/dim classes
    if (hasHighlights) {
      if (isHighlighted) {
        element.classList.add('cloudz-highlighted');
        element.classList.remove('cloudz-dimmed');
      } else {
        element.classList.add('cloudz-dimmed');
        element.classList.remove('cloudz-highlighted');
      }
    } else {
      element.classList.remove('cloudz-highlighted', 'cloudz-dimmed');
    }
  }
  
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

