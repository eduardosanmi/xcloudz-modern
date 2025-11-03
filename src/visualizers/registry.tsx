/**
 * Type-safe visualizer registry
 * Allows registering custom visualization renderers with full type safety
 */

import * as React from 'react';
import { Visualizer } from '../core/types';

/**
 * Registry for managing visualizers
 * Supports generic type parameters for type-safe parameter passing
 */
export class VisualizerRegistry {
  private visualizers = new Map<string, Visualizer<any>>();
  
  /**
   * Register a new visualizer
   * 
   * @example
   * registry.register<BarChartParams>({
   *   id: 'barchart',
   *   name: 'Bar Chart',
   *   render: (params) => <BarChart {...params} />
   * });
   */
  register<TParams = unknown>(visualizer: Visualizer<TParams>): void {
    if (this.visualizers.has(visualizer.id)) {
      console.warn(`Visualizer with id "${visualizer.id}" already registered. Overwriting.`);
    }
    
    this.visualizers.set(visualizer.id, visualizer);
  }
  
  /**
   * Get a registered visualizer by ID
   */
  get<TParams = unknown>(id: string): Visualizer<TParams> | undefined {
    return this.visualizers.get(id) as Visualizer<TParams> | undefined;
  }
  
  /**
   * Check if a visualizer is registered
   */
  has(id: string): boolean {
    return this.visualizers.has(id);
  }
  
  /**
   * Unregister a visualizer
   */
  unregister(id: string): boolean {
    return this.visualizers.delete(id);
  }
  
  /**
   * Get all registered visualizer IDs
   */
  list(): string[] {
    return Array.from(this.visualizers.keys());
  }
  
  /**
   * Get all visualizers with metadata
   */
  listAll(): Array<{ id: string; name: string; description?: string }> {
    return Array.from(this.visualizers.values()).map(v => ({
      id: v.id,
      name: v.name,
      description: v.description
    }));
  }
  
  /**
   * Render using a specific visualizer
   * Validates parameters if validator is provided
   */
  render<TParams = unknown>(id: string, params: TParams): React.ReactElement | null {
    const visualizer = this.get<TParams>(id);
    
    if (!visualizer) {
      console.error(`Visualizer "${id}" not found`);
      return null;
    }
    
    // Validate parameters if validator exists
    if (visualizer.validateParams && !visualizer.validateParams(params)) {
      console.error(`Invalid parameters for visualizer "${id}"`);
      return null;
    }
    
    try {
      return visualizer.render(params);
    } catch (error) {
      console.error(`Error rendering visualizer "${id}":`, error);
      return null;
    }
  }
  
  /**
   * Clear all visualizers
   */
  clear(): void {
    this.visualizers.clear();
  }
}

/**
 * Global visualizer registry instance
 */
export const visualizerRegistry = new VisualizerRegistry();

/**
 * Decorator for auto-registering visualizers (TypeScript experimental feature)
 * 
 * @example
 * @RegisterVisualizer({ id: 'my-viz', name: 'My Viz' })
 * class MyViz extends React.Component<MyParams> { ... }
 */
export function RegisterVisualizer<TParams = unknown>(
  metadata: { id: string; name: string; description?: string }
) {
  return function (target: any) {
    visualizerRegistry.register<TParams>({
      ...metadata,
      render: (params: TParams) => {
        const Component = target;
        return <Component {...(params as any)} />;
      }
    });
  };
}

