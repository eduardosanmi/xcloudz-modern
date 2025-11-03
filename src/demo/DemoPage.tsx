/**
 * Demo page showing Cloudz Visualizer usage
 */

import React, { useState } from 'react';
import { CloudzViewer } from '../components/CloudzViewer';
import { CloudzDataItem } from '../core/types';
import { registerBuiltInVisualizers } from '../visualizers/built-in';

// Register visualizers
registerBuiltInVisualizers();

// Example data: Tech links
const techData: CloudzDataItem[] = [
  {
    description: "React 19 - New Features",
    url: "https://react.dev",
    tags: ["react", "frontend", "javascript"]
  },
  {
    description: "TypeScript Documentation",
    url: "https://www.typescriptlang.org",
    tags: ["typescript", "javascript", "programming"]
  },
  {
    description: "Vite - Next Generation Frontend Tooling",
    url: "https://vitejs.dev",
    tags: ["vite", "frontend", "build-tools"]
  },
  {
    description: "D3.js - Data Visualization",
    url: "https://d3js.org",
    tags: ["d3", "visualization", "javascript"]
  },
  {
    description: "Three.js - 3D Graphics",
    url: "https://threejs.org",
    tags: ["threejs", "3d", "webgl"]
  },
  {
    description: "Node.js Runtime",
    url: "https://nodejs.org",
    tags: ["nodejs", "javascript", "backend"]
  },
  {
    description: "Next.js Framework",
    url: "https://nextjs.org",
    tags: ["nextjs", "react", "frontend"]
  },
  {
    description: "Tailwind CSS",
    url: "https://tailwindcss.com",
    tags: ["css", "frontend", "styling"]
  },
  {
    description: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    tags: ["documentation", "web", "reference"]
  },
  {
    description: "GitHub",
    url: "https://github.com",
    tags: ["git", "development", "tools"]
  }
];

// Example data: Simple concepts
const conceptData: CloudzDataItem[] = [
  {
    description: "Machine Learning",
    url: "#ml",
    tags: ["ai", "data", "algorithms"]
  },
  {
    description: "Neural Networks",
    url: "#nn",
    tags: ["ai", "deep-learning", "algorithms"]
  },
  {
    description: "Data Science",
    url: "#ds",
    tags: ["data", "statistics", "analysis"]
  },
  {
    description: "Cloud Computing",
    url: "#cloud",
    tags: ["infrastructure", "scalability", "distributed"]
  },
  {
    description: "Microservices",
    url: "#micro",
    tags: ["architecture", "distributed", "scalability"]
  },
  {
    description: "DevOps",
    url: "#devops",
    tags: ["automation", "infrastructure", "ci-cd"]
  }
];

// Example data: Dark Triad psychology
const darkTriadData: CloudzDataItem[] = [
  // --- CORE CONCEPTS ---
  {
    description: "Dark Triad",
    url: "#darktriad",
    tags: ["personality", "antisocial", "low-empathy", "manipulation", "self-focus"]
  },
  {
    description: "Light Triad",
    url: "#lighttriad",
    tags: ["personality", "prosocial", "empathy", "compassion", "honesty", "humility"]
  },

  // --- DARK TRIAD TRAITS ---
  {
    description: "Narcissism",
    url: "#narcissism",
    tags: ["ego", "admiration", "status", "self-enhancement", "low-empathy"]
  },
  {
    description: "Grandiose Narcissism",
    url: "#grandiose",
    tags: ["dominance", "confidence", "attention-seeking", "status"]
  },
  {
    description: "Vulnerable Narcissism",
    url: "#vulnerable",
    tags: ["insecurity", "sensitivity", "defensiveness", "self-focus"]
  },
  {
    description: "Machiavellianism",
    url: "#machiavellianism",
    tags: ["manipulation", "strategy", "cynicism", "goal-oriented", "coldness"]
  },
  {
    description: "Psychopathy",
    url: "#psychopathy",
    tags: ["impulsivity", "callousness", "risk-taking", "fearlessness", "emotional-detachment"]
  },

  // --- DARK TRIAD FACETS ---
  {
    description: "Callous-Unemotional Traits",
    url: "#callous",
    tags: ["emotional-detachment", "coldness", "lack-of-guilt", "low-empathy"]
  },
  {
    description: "Manipulativeness",
    url: "#manipulativeness",
    tags: ["deception", "instrumental-behavior", "goal-oriented", "social-influence"]
  },
  {
    description: "Egocentrism",
    url: "#egocentrism",
    tags: ["self-focus", "entitlement", "status", "self-importance"]
  },
  {
    description: "Moral Disengagement",
    url: "#morals",
    tags: ["justification", "ethical-flexibility", "rationalization", "goal-oriented"]
  },
  {
    description: "Empathy Deficit",
    url: "#empathydeficit",
    tags: ["low-empathy", "coldness", "emotional-distance", "moral-blindness"]
  },

  // --- LIGHT TRIAD TRAITS ---
  {
    description: "Kantianism",
    url: "#kantianism",
    tags: ["respect", "autonomy", "ethics", "prosocial", "moral"]
  },
  {
    description: "Humanism",
    url: "#humanism",
    tags: ["dignity", "compassion", "altruism", "empathy"]
  },
  {
    description: "Faith in Humanity",
    url: "#faithinhumanity",
    tags: ["trust", "benevolence", "optimism", "connection"]
  },

  // --- LIGHT TRIAD FACETS ---
  {
    description: "Empathy",
    url: "#empathy",
    tags: ["compassion", "understanding", "emotional-awareness", "connection"]
  },
  {
    description: "Emotional Intelligence",
    url: "#emotionalintelligence",
    tags: ["empathy", "self-awareness", "emotional-regulation", "balance"]
  },
  {
    description: "Humility",
    url: "#humility",
    tags: ["self-awareness", "modesty", "gratitude", "prosocial"]
  },
  {
    description: "Honesty",
    url: "#honesty",
    tags: ["truthfulness", "integrity", "trustworthiness", "moral"]
  },
  {
    description: "Compassion",
    url: "#compassion",
    tags: ["care", "altruism", "empathy", "connection"]
  },
  {
    description: "Altruism",
    url: "#altruism",
    tags: ["helping", "benevolence", "selflessness", "prosocial"]
  },

  // --- MEASUREMENT / CONTEXT ---
  {
    description: "Personality Assessment",
    url: "#assessment",
    tags: ["psychometrics", "measurement", "traits", "diagnosis"]
  },
  {
    description: "Subclinical Traits",
    url: "#subclinical",
    tags: ["nonpathological", "everyday-behavior", "personality", "normal-variation"]
  }
];



// Example data: Large dataset (100 items)
const largeData: CloudzDataItem[] = Array.from({ length: 100 }, (_, i) => {
  const categories = ['technology', 'science', 'business', 'art', 'music', 'sports', 'education', 'health'];
  const subcategories = ['beginner', 'intermediate', 'advanced', 'expert'];
  const types = ['tutorial', 'article', 'video', 'course', 'book', 'tool', 'framework', 'library'];
  
  const category = categories[i % categories.length];
  const subcategory = subcategories[Math.floor(i / 25) % subcategories.length];
  const type = types[Math.floor(i / 12) % types.length];
  
  return {
    description: `Item ${i + 1}: ${type} on ${category}`,
    url: `https://example.com/item-${i + 1}`,
    tags: [category, subcategory, type]
  };
});

export const DemoPage: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<'tech' | 'concepts' | 'darktriad' | 'large'>('tech');
  const [config, setConfig] = useState({
    width: 800,
    height: 300,  // Changed default height to 300
    graphCompression: 45,
    lensAugment: 64,  // Increased default magnification to 24
    springIterations: 500,
    enableAutoAnimation: false,  // Disabled by default for better UX
    useWebWorker: true,
    highlightOnHover: false,  // Enable hover highlighting by default
    highlightOnClick: true,   // Enable click highlighting by default
    enableInitialZoomAnimation: true,  // Enable initial zoom animation by default
    initialZoomDuration: 2000  // 2 second animation
  });
  
  const currentData = selectedDataset === 'tech' ? techData : 
                      selectedDataset === 'concepts' ? conceptData :
                      selectedDataset === 'darktriad' ? darkTriadData :
                      largeData;
  
  const handleNodeClick = (node: any) => {
    console.log('Node clicked:', node);
    if (node.type === 'url' && node.data?.url) {
      console.log(`URL Node: ${node.data.description || node.data.url}`);
    } else if (node.type === 'tag') {
      console.log(`Tag: ${node.id} (used by ${node.data?.tagCount || 0} items)`);
    }
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          🌐 Xcloudz Modern Visualizer
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          A modern reimplementation of the Xcloudz hyperbolic/fisheye visualization framework
        </p>
      </header>
      
      <div style={{ 
        background: '#fff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ marginTop: 0, color: '#333', fontSize: '16px' }}>📝 Instructions:</h3>
        <ul style={{ marginTop: '10px', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>Initial Load</strong>: Watch the smooth zoom-in animation on first load (if enabled)</li>
          <li><strong>Drag</strong>: Click and drag to pan the visualization</li>
          <li><strong>Scroll</strong>: Mouse wheel to zoom in/out (adjust lens magnification)</li>
          <li><strong>Double-click</strong>: Center on nearest node</li>
          <li><strong>Hover</strong>: Hover over tags or boxes to highlight related nodes</li>
          <li><strong>Click node</strong>: Lock the highlight on that node and its related nodes</li>
          <li><strong>Click anywhere else</strong>: Clear the locked highlight</li>
          <li><strong>Console</strong>: Check browser console for node info when clicked</li>
        </ul>
      </div>
      
      <div style={{ 
        background: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ marginTop: 0, color: '#333', fontSize: '18px' }}>Controls</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Dataset:</span>
            <select 
              value={selectedDataset} 
              onChange={e => setSelectedDataset(e.target.value as 'tech' | 'concepts' | 'darktriad' | 'large')}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="tech">Tech Stack (10 items)</option>
              <option value="concepts">Concepts (6 items)</option>
              <option value="darktriad">Dark Triad Psychology (12 items)</option>
              <option value="large">Large Dataset (100 items)</option>
            </select>
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Width:</span>
            <input
              type="number"
              value={config.width}
              onChange={e => setConfig({ ...config, width: parseInt(e.target.value) || 800 })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              min="400"
              max="1600"
            />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Height:</span>
            <input
              type="number"
              value={config.height}
              onChange={e => setConfig({ ...config, height: parseInt(e.target.value) || 600 })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              min="300"
              max="1200"
            />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
              Magnification: {config.lensAugment}
            </span>
            <input
              type="range"
              min="1"
              max="128"
              step="1"
              value={config.lensAugment}
              onChange={e => setConfig({ ...config, lensAugment: parseFloat(e.target.value) })}
              style={{ padding: '8px' }}
            />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
              Graph Compression: {config.graphCompression}%
            </span>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={config.graphCompression}
              onChange={e => setConfig({ ...config, graphCompression: parseInt(e.target.value) })}
              style={{ padding: '8px' }}
            />
          </label>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
              Spring Iterations: {config.springIterations || 500}
            </span>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={config.springIterations || 500}
              onChange={e => setConfig({ ...config, springIterations: parseInt(e.target.value) })}
              style={{ padding: '8px' }}
            />
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={config.enableAutoAnimation}
              onChange={e => setConfig({ ...config, enableAutoAnimation: e.target.checked })}
            />
            <span style={{ fontSize: '14px' }}>Auto-animate</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={config.useWebWorker}
              onChange={e => setConfig({ ...config, useWebWorker: e.target.checked })}
            />
            <span style={{ fontSize: '14px' }}>Use Web Worker</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={config.highlightOnHover}
              onChange={e => setConfig({ ...config, highlightOnHover: e.target.checked })}
            />
            <span style={{ fontSize: '14px' }}>Highlight on Hover</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={config.highlightOnClick}
              onChange={e => setConfig({ ...config, highlightOnClick: e.target.checked })}
            />
            <span style={{ fontSize: '14px' }}>Highlight on Click</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={config.enableInitialZoomAnimation}
              onChange={e => setConfig({ ...config, enableInitialZoomAnimation: e.target.checked })}
            />
            <span style={{ fontSize: '14px' }}>Initial Zoom Animation</span>
          </label>
          
          {config.enableInitialZoomAnimation && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                Animation Duration: {config.initialZoomDuration}ms
              </span>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={config.initialZoomDuration}
                onChange={e => setConfig({ ...config, initialZoomDuration: parseInt(e.target.value) })}
                style={{ padding: '8px' }}
              />
            </label>
          )}
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px',
        padding: '20px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <CloudzViewer
          data={currentData}
          config={config}
          onNodeClick={handleNodeClick}
          onLayoutComplete={() => console.log('Layout complete!')}
        />
      </div>
      
      <div style={{ 
        background: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>🎯 About This Visualization</h2>
        <p style={{ lineHeight: '1.6', color: '#555' }}>
          This is a modern reimplementation of the <strong>Xcloudz hyperbolic/fisheye visualization framework</strong>.
          It preserves the original algorithms while using modern web technologies.
        </p>
        
        <h3 style={{ color: '#333', marginTop: '20px' }}>Key Features:</h3>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li><strong>Force-directed graph layout</strong> - Positions nodes using spring physics simulation</li>
          <li><strong>Hyperbolic transformation</strong> - Creates a lens effect for focus+context viewing</li>
          <li><strong>Tag-URL bipartite graph</strong> - Shows relationships between tags and content</li>
          <li><strong>Interactive navigation</strong> - Drag, zoom, and click to explore</li>
          <li><strong>Web Workers</strong> - Offloads layout computation for better performance</li>
          <li><strong>TypeScript</strong> - Full type safety and better developer experience</li>
          <li><strong>React 19</strong> - Modern component-based architecture</li>
          <li><strong>Pluggable renderers</strong> - Support for DOM, Canvas, or WebGL rendering</li>
        </ul>
        
        <h3 style={{ color: '#333', marginTop: '20px' }}>Technology Stack:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          {['React 19', 'TypeScript', 'Vite', 'Web Workers', 'Vitest', 'CSS3'].map(tech => (
            <span 
              key={tech}
              style={{
                padding: '6px 12px',
                background: '#0066cc',
                color: 'white',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {tech}
            </span>
          ))}
        </div>
        
        <h3 style={{ color: '#333', marginTop: '20px' }}>🎨 Customizing Highlight Colors:</h3>
        <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '10px' }}>
          You can customize highlight colors using CSS variables. All related nodes use matching colors:
        </p>
        <pre style={{
          background: '#2d2d2d',
          color: '#f8f8f2',
          padding: '15px',
          borderRadius: '6px',
          fontSize: '13px',
          overflow: 'auto',
          lineHeight: '1.5'
        }}>
{`<CloudzViewer
  data={data}
  config={config}
  style={{
    // When clicking a TAG, everything (tag + related boxes) uses blue:
    '--cloudz-tag-source-highlight-color': '#0066cc',
    '--cloudz-tag-source-highlight-glow': 'rgba(0, 102, 204, 0.5)',
    
    // When clicking a BOX, everything (box + related tags) uses purple:
    '--cloudz-box-source-highlight-color': '#9b59b6',
    '--cloudz-box-source-highlight-glow': 'rgba(155, 89, 182, 0.5)'
  }}
/>`}
        </pre>
        <div style={{ lineHeight: '1.6', color: '#555', fontSize: '14px', marginTop: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '6px' }}>
          <strong>Current behavior:</strong>
          <ul style={{ marginTop: '5px', marginBottom: '5px' }}>
            <li>Click a <strong style={{color: '#0066cc'}}>TAG</strong> → Tag + all related boxes turn <strong style={{color: '#0066cc'}}>BLUE</strong></li>
            <li>Click a <strong style={{color: '#9b59b6'}}>BOX</strong> → Box + all related tags turn <strong style={{color: '#9b59b6'}}>PURPLE</strong></li>
          </ul>
        </div>
      </div>
      
      <footer style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #ddd', textAlign: 'center', color: '#999' }}>
        <p>Modernized from the original Xcloudz project (2012) • Built with ❤️ and modern web standards</p>
      </footer>
    </div>
  );
};

