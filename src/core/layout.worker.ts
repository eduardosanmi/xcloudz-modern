/**
 * Web Worker for computing graph layout and transforms
 * Offloads expensive computations from main thread
 */

import { GraphEngine } from './graph';
import { HyperbolicMath } from './transforms';
import {
  WorkerMessageType,
  WorkerRequest,
  WorkerResponse,
  LayoutComputePayload,
  LayoutCompletePayload,
  TransformComputePayload,
  TransformCompletePayload
} from './types';

// Web Worker message handler
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case WorkerMessageType.COMPUTE_LAYOUT:
        handleComputeLayout(payload as LayoutComputePayload);
        break;
        
      case WorkerMessageType.COMPUTE_TRANSFORMS:
        handleComputeTransforms(payload as TransformComputePayload);
        break;
        
      default:
        throw new Error(`Unknown worker message type: ${type}`);
    }
  } catch (error) {
    const response: WorkerResponse = {
      type,
      payload: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    self.postMessage(response);
  }
};

/**
 * Handle layout computation request
 */
function handleComputeLayout(payload: LayoutComputePayload): void {
  const { data, config } = payload;
  
  // Create graph engine
  const engine = new GraphEngine();
  engine.setIterations(config.iterations);
  
  // Build graph from data
  engine.buildFromData(data);
  
  // Compute spring layout
  engine.computeLayout();
  
  // Get nodes
  const nodes = engine.getNodes();
  
  // Normalize coordinates to viewport
  HyperbolicMath.normalizeCoordinates(
    nodes,
    config.width,
    config.height,
    config.compression
  );
  
  // Serialize for transfer
  const serializedNodes = engine.serializeNodes();
  
  const response: WorkerResponse = {
    type: WorkerMessageType.LAYOUT_COMPLETE,
    payload: { nodes: serializedNodes } as LayoutCompletePayload
  };
  
  self.postMessage(response);
}

/**
 * Handle transform computation request
 */
function handleComputeTransforms(payload: TransformComputePayload): void {
  const { nodes, width, height, lensAugment } = payload;
  
  // Compute transforms for all nodes
  const transforms = HyperbolicMath.computeTransforms(
    nodes,
    width,
    height,
    lensAugment
  );
  
  // Convert Map to plain object for transfer
  const transformsObj: Record<string, any> = {};
  transforms.forEach((transform, id) => {
    transformsObj[id] = transform;
  });
  
  const response: WorkerResponse = {
    type: WorkerMessageType.TRANSFORMS_COMPLETE,
    payload: { transforms: transformsObj } as TransformCompletePayload
  };
  
  self.postMessage(response);
}

export {};

