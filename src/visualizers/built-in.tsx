/**
 * Built-in visualizers for common use cases
 */

import React from 'react';
import { visualizerRegistry } from './registry.tsx';
import {
  Visualizer,
  DefaultNodeParams,
  TagVisualizerParams,
  UrlVisualizerParams,
  BarChartParams
} from '../core/types';

/**
 * Default node visualizer (legacy compatible)
 */
export const defaultNodeVisualizer: Visualizer<DefaultNodeParams> = {
  id: 'default-node',
  name: 'Default Node',
  description: 'Standard node visualization with automatic type detection',
  
  render: (params) => {
    const { node, transform, baseWidth, baseHeight, onClick } = params;
    const [x, y] = transform.coord;
    const scale = 1.01 - transform.alpha;
    const width = baseWidth * scale;
    const height = baseHeight * scale;
    const fontSize = Math.min(16, 28 * scale);
    const zIndex = Math.floor(10 - transform.alpha * 10);
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${x - width / 2}px`,
      top: `${y - height / 2}px`,
      width: `${width}px`,
      height: `${height}px`,
      fontSize: `${fontSize}px`,
      zIndex,
      opacity: scale > 0.1 ? 1 : 0,
      pointerEvents: scale > 0.1 ? 'auto' : 'none'
    };
    
    return (
      <div
        key={node.id}
        className="cloudz-node"
        style={style}
        onClick={() => onClick?.(node)}
      >
        {node.type === 'tag' ? (
          <div className="cloudz-tag-label">
            {node.id}
            {node.data?.tagCount && node.data.tagCount > 1 && (
              <span className="tag-count">({node.data.tagCount})</span>
            )}
          </div>
        ) : (
          <div className="cloudz-url-content">
            {node.data?.attachedElementId ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: document.getElementById(node.data.attachedElementId)?.innerHTML || 
                          node.data.description || 
                          node.id
                }}
              />
            ) : (
              <a 
                href={node.data?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {node.data?.description || node.id}
              </a>
            )}
          </div>
        )}
      </div>
    );
  },
  
  validateParams: (params): params is DefaultNodeParams => {
    return (
      typeof params === 'object' &&
      params !== null &&
      'node' in params &&
      'transform' in params &&
      'baseWidth' in params &&
      'baseHeight' in params
    );
  }
};

/**
 * Enhanced tag visualizer with customization
 */
export const tagVisualizer: Visualizer<TagVisualizerParams> = {
  id: 'enhanced-tag',
  name: 'Enhanced Tag',
  description: 'Tag visualization with color and styling options',
  
  render: (params) => {
    const { node, transform, baseWidth, baseHeight, showCount, color, onClick } = params;
    const [x, y] = transform.coord;
    const scale = 1.01 - transform.alpha;
    const width = baseWidth * scale;
    const height = baseHeight * scale;
    const fontSize = Math.min(16, 28 * scale);
    const zIndex = Math.floor(10 - transform.alpha * 10);
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${x - width / 2}px`,
      top: `${y - height / 2}px`,
      width: `${width}px`,
      height: `${height}px`,
      fontSize: `${fontSize}px`,
      zIndex,
      opacity: scale > 0.1 ? 1 : 0,
      color: color || '#333'
    };
    
    return (
      <div
        key={node.id}
        className="cloudz-node cloudz-tag-enhanced"
        style={style}
        onClick={() => onClick?.(node)}
      >
        <div className="cloudz-tag-label">
          <span className="tag-text">{node.id}</span>
          {showCount && node.data?.tagCount && node.data.tagCount > 1 && (
            <span className="tag-count" style={{ fontSize: `${fontSize * 0.6}px` }}>
              ({node.data.tagCount})
            </span>
          )}
        </div>
      </div>
    );
  }
};

/**
 * URL visualizer with thumbnail support
 */
export const urlVisualizer: Visualizer<UrlVisualizerParams> = {
  id: 'url-content',
  name: 'URL Content',
  description: 'URL visualization with optional thumbnail',
  
  render: (params) => {
    const { node, transform, baseWidth, baseHeight, showThumbnail, maxLines, onClick } = params;
    const [x, y] = transform.coord;
    const scale = 1.01 - transform.alpha;
    const width = baseWidth * scale;
    const height = baseHeight * scale;
    const fontSize = Math.min(16, 28 * scale);
    const zIndex = Math.floor(10 - transform.alpha * 10);
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${x - width / 2}px`,
      top: `${y - height / 2}px`,
      width: `${width}px`,
      height: `${height}px`,
      fontSize: `${fontSize}px`,
      zIndex,
      opacity: scale > 0.1 ? 1 : 0,
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: maxLines || 3,
      WebkitBoxOrient: 'vertical'
    };
    
    return (
      <div
        key={node.id}
        className="cloudz-node cloudz-url-enhanced"
        style={style}
        onClick={() => onClick?.(node)}
      >
        <div className="cloudz-url-content">
          {showThumbnail && node.data?.url && (
            <img 
              src={node.data.url} 
              alt={node.data.description || ''}
              style={{ 
                maxWidth: '100%', 
                maxHeight: `${height * 0.7}px`,
                objectFit: 'contain' 
              }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          )}
          <a 
            href={node.data?.url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {node.data?.description || node.id}
          </a>
        </div>
      </div>
    );
  }
};

/**
 * Simple bar chart visualizer (example custom visualizer)
 */
export const barChartVisualizer: Visualizer<BarChartParams> = {
  id: 'barchart',
  name: 'Bar Chart',
  description: 'Simple horizontal bar chart',
  
  render: (params) => {
    const { value, maxValue, label, color, width, height } = params;
    const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
    
    return (
      <div style={{ width: `${width}px`, height: `${height}px`, position: 'relative' }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: '#eee',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: color || 'steelblue',
            transition: 'width 0.3s ease'
          }} />
        </div>
        {label && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: percentage > 50 ? 'white' : '#333',
            fontWeight: 'bold',
            fontSize: '14px',
            pointerEvents: 'none'
          }}>
            {label}
          </div>
        )}
      </div>
    );
  },
  
  validateParams: (params): params is BarChartParams => {
    return (
      typeof params === 'object' &&
      params !== null &&
      'value' in params &&
      'maxValue' in params &&
      typeof (params as BarChartParams).value === 'number' &&
      typeof (params as BarChartParams).maxValue === 'number'
    );
  }
};

/**
 * Register all built-in visualizers
 */
export function registerBuiltInVisualizers(): void {
  visualizerRegistry.register(defaultNodeVisualizer);
  visualizerRegistry.register(tagVisualizer);
  visualizerRegistry.register(urlVisualizer);
  visualizerRegistry.register(barChartVisualizer);
}

