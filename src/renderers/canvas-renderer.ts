/**
 * Canvas-based renderer implementation
 * Higher performance for large datasets
 */

import { GraphNode, HyperbolicTransform, IRenderer, CloudzConfig } from '../core/types';

export class CanvasRenderer implements IRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private baseWidth = 250;
  private baseHeight = 150;
  
  // Cache for hit testing
  private hitRegions = new Map<string, { x: number; y: number; width: number; height: number }>();
  
  initialize(container: HTMLElement, config: CloudzConfig): void {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    this.canvas.style.display = 'block';
    
    container.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Could not get 2D context');
    }
  }
  
  render(nodes: GraphNode[], transforms: Map<string, HyperbolicTransform>): void {
    if (!this.ctx || !this.canvas) {
      throw new Error('Renderer not initialized');
    }
    
    this.hitRegions.clear();
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Sort nodes by z-index (alpha) for proper rendering order
    const sortedNodes = [...nodes].sort((a, b) => {
      const transformA = transforms.get(a.id);
      const transformB = transforms.get(b.id);
      if (!transformA || !transformB) return 0;
      return transformB.alpha - transformA.alpha; // Far to near
    });
    
    // Render each node
    sortedNodes.forEach(node => {
      const transform = transforms.get(node.id);
      if (!transform) return;
      
      this.renderNode(node, transform);
    });
  }
  
  clear(): void {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.hitRegions.clear();
  }
  
  dispose(): void {
    this.clear();
    if (this.canvas) {
      this.canvas.remove();
    }
    this.canvas = null;
    this.ctx = null;
  }
  
  getNodeAtPosition(x: number, y: number): string | null {
    // Check hit regions from top to bottom
    for (const [id, region] of this.hitRegions) {
      if (
        x >= region.x &&
        x <= region.x + region.width &&
        y >= region.y &&
        y <= region.y + region.height
      ) {
        return id;
      }
    }
    return null;
  }
  
  private renderNode(node: GraphNode, transform: HyperbolicTransform): void {
    if (!this.ctx) return;
    
    const [x, y] = transform.coord;
    const scale = 1.01 - transform.alpha;
    
    if (scale <= 0.1) return; // Skip very small nodes
    
    const width = this.baseWidth * scale;
    const height = this.baseHeight * scale;
    const fontSize = Math.min(16, 28 * scale);
    
    const boxX = x - width / 2;
    const boxY = y - height / 2;
    
    // Store hit region
    this.hitRegions.set(node.id, { x: boxX, y: boxY, width, height });
    
    this.ctx.save();
    
    if (node.type === 'tag') {
      this.renderTag(node, boxX, boxY, width, height, fontSize);
    } else {
      this.renderUrl(node, boxX, boxY, width, height, fontSize);
    }
    
    this.ctx.restore();
  }
  
  private renderTag(
    node: GraphNode,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize: number
  ): void {
    if (!this.ctx) return;
    
    // Draw text (centered)
    this.ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    this.ctx.fillStyle = '#333';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Text shadow
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    this.ctx.shadowBlur = 2;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;
    
    const tagCount = node.data?.tagCount || 0;
    const text = tagCount > 1 ? `${node.id} (${tagCount})` : node.id;
    
    this.ctx.fillText(text, x + width / 2, y + height / 2, width * 0.9);
  }
  
  private renderUrl(
    node: GraphNode,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize: number
  ): void {
    if (!this.ctx) return;
    
    // Draw background box
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 1;
    
    // Rounded rectangle
    const radius = 8 * (fontSize / 16);
    this.drawRoundedRect(x, y, width, height, radius);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    // Draw text
    this.ctx.shadowColor = 'transparent';
    this.ctx.font = `${fontSize}px Arial, sans-serif`;
    this.ctx.fillStyle = '#0066cc';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    const description = node.data?.description || node.id;
    const padding = 8;
    
    // Word wrap text
    this.wrapText(description, x + padding, y + padding, width - 2 * padding, fontSize * 1.2);
  }
  
  private drawRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
  
  private wrapText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    if (!this.ctx) return;
    
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        this.ctx.fillText(line, x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    this.ctx.fillText(line, x, currentY);
  }
}

