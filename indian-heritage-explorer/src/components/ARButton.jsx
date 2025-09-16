import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';

function ARButton({ modelUrl }) {
  const [isARSupported, setIsARSupported] = useState(false);

  useEffect(() => {
    // Check for WebXR support on page load
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => {
          setIsARSupported(supported);
        });
    }
  }, []);

  const handleARClick = () => {
    // This is the AR functionality trigger
    // The <model-viewer> component handles the AR session
    // This button will trigger the 'ar' mode of the model-viewer
    // A simple way to do this is to add the 'ar' attribute and have the model-viewer already on the page.
    const modelViewer = document.querySelector('model-viewer');
    if (modelViewer) {
      modelViewer.activateAR();
    } else {
      alert("No 3D model found to activate AR on.");
    }
  };

  if (!isMobile) {
    return <span className="text-sm text-gray-500">AR is only available on mobile devices.</span>;
  }

  if (!isARSupported) {
    return <span className="text-sm text-gray-500">Your device does not support Augmented Reality.</span>;
  }

  return (
    <button
      onClick={handleARClick}
      className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 font-semibold transition"
    >
      View in AR
    </button>
  );
}

export default ARButton;