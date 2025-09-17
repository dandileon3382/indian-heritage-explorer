import React from 'react';

// You will need to install the model-viewer package
// npm install @google/model-viewer
// This is an external library that is perfect for this use case.
import '@google/model-viewer';

function ModelViewer({ modelUrl }) {
  return (
    <model-viewer
      src={modelUrl}
      camera-controls
      ar
      ar-modes="webxr scene-viewer quick-look"
      ar-scale="auto"
      shadow-intensity="1"
      auto-rotate
      class="w-full h-full rounded-lg"
    ></model-viewer>
  );
}

export default ModelViewer;