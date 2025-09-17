// ThreeArViewer.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

/**
 * Props:
 *  - modelUrl: string (path to .glb)
 *  - fallbackUi?: React node displayed when WebXR unsupported
 */
export default function ThreeArViewer({ modelUrl, fallbackUi = null }) {
  const containerRef = useRef(null);
  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    reticle: null,
    model: null,
    session: null,
    placed: false,
    lastTouchDistance: null,
    lastTouchX: null,
    lastTouchY: null,
  });

  useEffect(() => {
    let mounted = true;
    const container = containerRef.current;
    if (!container) return;

    // Basic Three.js scene
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.01,
      20
    );

    // Renderer with WebXR enabled
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");
    container.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.0);
    scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(0.5, 2, 1);
    scene.add(dirLight);

    // Reticle for placement (simple ring)
    const ringGeometry = new THREE.RingGeometry(0.07, 0.12, 32).rotateX(-Math.PI / 2);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const reticle = new THREE.Mesh(ringGeometry, ringMaterial);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // Load model but keep it invisible until placed
    const gltfLoader = new GLTFLoader();
    let loadedModel = null;
    gltfLoader.load(
      modelUrl,
      (gltf) => {
        if (!mounted) return;
        loadedModel = gltf.scene;
        // initial tiny scale; you will scale after placement
        loadedModel.scale.set(0.1, 0.1, 0.1);
        loadedModel.visible = false;
        scene.add(loadedModel);
        stateRef.current.model = loadedModel;
      },
      (xhr) => {
        // optional progress: console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (err) => {
        console.error("GLTF load error:", err);
      }
    );

    // Animation loop
    function animate() {
      renderer.setAnimationLoop(render);
    }

    function render(timestamp, frame) {
      if (frame) {
        const session = renderer.xr.getSession();
        const referenceSpace = renderer.xr.getReferenceSpace();
        // Hit test logic lives in onSessionStarted as an event; reticle matrix updated there.
      }
      renderer.render(scene, camera);
    }

    // Request hit test source / set up session start handler
    async function onSessionStarted(session) {
      stateRef.current.session = session;
      // enable touch input on canvas
      renderer.domElement.style.touchAction = "none";
      renderer.xr.setSession(session);

      // Hit testing
      const viewerRefSpace = await session.requestReferenceSpace("viewer");
      const hitTestSource = await session.requestHitTestSource({ space: viewerRefSpace });

      session.addEventListener("select", (ev) => {
        // On select, place the model at reticle position if available
        if (!reticle.visible || !stateRef.current.model) return;
        const model = stateRef.current.model;
        model.position.setFromMatrixPosition(reticle.matrix);
        // align orientation of model to camera yaw (optional)
        const camQuat = new THREE.Quaternion();
        renderer.xr.getCamera(camera).getWorldQuaternion(camQuat);
        // keep only yaw
        const euler = new THREE.Euler().setFromQuaternion(camQuat, "YXZ");
        model.rotation.set(0, euler.y, 0);
        model.visible = true;
        stateRef.current.placed = true;
      });

      // Each frame, update reticle with hit test results
      session.requestAnimationFrame(function onXRFrame(time, xrFrame) {
        if (!mounted) return;
        const pose = xrFrame.getViewerPose(renderer.xr.getReferenceSpace());
        if (pose) {
          const hitTestResults = xrFrame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const hitPose = hit.getPose(renderer.xr.getReferenceSpace());
            reticle.visible = true;
            reticle.matrix.fromArray(hitPose.transform.matrix);
          } else {
            reticle.visible = false;
          }
        }
        session.requestAnimationFrame(onXRFrame);
      });
    }

    // For browsers that support WebXR immersive-ar
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
        if (supported) {
          const arButton = ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] });
          container.appendChild(arButton);
          // ARButton handles session start; hook in onSessionStarted via renderer.xr.setSession monitoring
          // We'll add an event listener to detect when session starts
          const originalSetSession = renderer.xr.setSession.bind(renderer.xr);
          renderer.xr.setSession = async (session) => {
            await originalSetSession(session);
            onSessionStarted(session);
          };
        } else {
          // WebXR not supported: show fallback UI
          console.warn("WebXR immersive-ar not supported on this device.");
        }
      });
    } else {
      console.warn("WebXR not available on navigator.");
    }

    // Handle basic touch gestures for rotate/scale when model is placed
    function getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e) {
      if (!stateRef.current.placed || !stateRef.current.model) return;
      if (e.touches.length === 1) {
        stateRef.current.lastTouchX = e.touches[0].clientX;
        stateRef.current.lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        stateRef.current.lastTouchDistance = getDistance(e.touches[0], e.touches[1]);
      }
    }

    function onTouchMove(e) {
      if (!stateRef.current.placed || !stateRef.current.model) return;
      const model = stateRef.current.model;
      if (e.touches.length === 1 && stateRef.current.lastTouchX !== null) {
        // rotate based on horizontal movement
        const deltaX = e.touches[0].clientX - stateRef.current.lastTouchX;
        const rotationSpeed = 0.005; // tweak
        model.rotation.y -= deltaX * rotationSpeed;
        stateRef.current.lastTouchX = e.touches[0].clientX;
        stateRef.current.lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const distance = getDistance(e.touches[0], e.touches[1]);
        if (stateRef.current.lastTouchDistance) {
          const scaleFactor = distance / stateRef.current.lastTouchDistance;
          // clamp scale
          const newScale = THREE.MathUtils.clamp(
            model.scale.x * scaleFactor,
            0.01,
            10
          );
          model.scale.set(newScale, newScale, newScale);
        }
        stateRef.current.lastTouchDistance = distance;
      }
      e.preventDefault();
    }

    function onTouchEnd(e) {
      // reset trackers when touches end
      if (e.touches.length === 0) {
        stateRef.current.lastTouchDistance = null;
        stateRef.current.lastTouchX = null;
        stateRef.current.lastTouchY = null;
      }
    }

    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: false });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: false });
    renderer.domElement.addEventListener("touchend", onTouchEnd);

    // Resize handling
    function onWindowResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", onWindowResize);

    // Save stateRef
    stateRef.current.renderer = renderer;
    stateRef.current.scene = scene;
    stateRef.current.camera = camera;
    stateRef.current.reticle = reticle;

    animate();

    // Cleanup
    return () => {
      mounted = false;
      // Stop XR session if running
      if (stateRef.current.session) {
        stateRef.current.session.end().catch(() => {});
      }
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);
      renderer.domElement.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onWindowResize);
      if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      // dispose scene children etc. (basic)
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose && m.dispose());
          } else obj.material.dispose && obj.material.dispose();
        }
      });
    };
  }, [modelUrl]);

  // Render fallback notice or the canvas container
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}
      />
      {/* Optionally render fallback UI if browser doesn't support WebXR */}
      {/* The ARButton from three will be inserted into the container automatically when supported */}
      {fallbackUi}
    </div>
  );
}
