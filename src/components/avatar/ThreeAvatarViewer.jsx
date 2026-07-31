import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { loadGLBModel, createGLBCharacterSystem } from './glbAvatarPipeline.js';
import { DEFAULT_AVATAR_CONFIG } from './avatarOptionsData.js';

/**
 * ThreeAvatarViewer — Organic Human Head & Bust Renderer (v2.1 Fresh Cache)
 * Seamless scalp fitting (ZERO forehead gap), contoured face shape, almond eyes,
 * human neck & shoulder bust, PBR lighting, and self-hosted GLB loading pipeline.
 */
export function ThreeAvatarViewer({ config = DEFAULT_AVATAR_CONFIG, width = '100%', height = '100%' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const c = { ...DEFAULT_AVATAR_CONFIG, ...config };

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 500;

    let isDisposed = false;

    // 1. SCENE & CAMERA SETUP
    const scene = new THREE.Scene();

    // Perspective Camera: un-zoomed framing showing Head, Neck, and Shoulders
    const camera = new THREE.PerspectiveCamera(22, w / h, 0.1, 100);
    camera.position.set(0, -0.12, 4.8);
    camera.lookAt(0, -0.15, 0);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. STUDIO PBR LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
    keyLight.position.set(2.8, 3.8, 3.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xebd5c1, 0.45);
    fillLight.position.set(-2.8, 1.8, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(0, 3, -3.5);
    scene.add(rimLight);

    // 3. CHARACTER RIG SETUP
    const glbSystem = createGLBCharacterSystem(c, scene);
    const avatarGroup = glbSystem.rootGroup;
    scene.add(avatarGroup);

    const geometries = [];
    const materials = [];
    const trackObj = (obj) => {
      if (obj.geometry) geometries.push(obj.geometry);
      if (obj.material) materials.push(obj.material);
    };

    // Colors & Materials
    const skinHex = c.skinTone || '#E2A77F';
    const hairHex = c.hairColor || '#1A1412';
    const eyeHex  = c.eyeColor || '#5C3A21';
    const topHex  = c.outfitTopColor || '#6F405F';
    const isFemale = c.gender === 'female';

    // Local GLB Loading (when user places base character GLB in /public/avatar-assets/)
    if (c.glbUrl) {
      loadGLBModel(c.glbUrl).then((glbScene) => {
        if (isDisposed || !glbScene) return;

        glbScene.position.set(0, -1.45, 0);
        glbScene.scale.setScalar(1.0);

        glbScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            trackObj(child);

            const name = (child.name || '').toLowerCase();
            const matName = (child.material?.name || '').toLowerCase();

            if (child.material) {
              child.material = child.material.clone();
              materials.push(child.material);
            }

            if (name.includes('head') || name.includes('body') || name.includes('skin') || matName.includes('skin')) {
              if (child.material?.color) child.material.color.set(skinHex);
            } else if (name.includes('hair') || matName.includes('hair')) {
              if (child.material?.color) child.material.color.set(hairHex);
            } else if (name.includes('top') || name.includes('outfit') || matName.includes('top')) {
              if (child.material?.color) child.material.color.set(topHex);
            }
          }
        });

        avatarGroup.add(glbScene);
        camera.position.set(0, 0.15, 2.2);
        camera.lookAt(0, 0.08, 0);
      }).catch((err) => {
        console.warn('[ThreeAvatarViewer] GLB load fallback:', err);
      });
    }

    // ── 4. ORGANIC HUMAN HEAD & FACE ──
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinHex),
      roughness: 0.48,
      metalness: 0.0,
    });
    materials.push(skinMat);

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairHex),
      roughness: 0.65,
      metalness: 0.04,
    });
    materials.push(hairMat);

    const topMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(topHex),
      roughness: 0.55,
      metalness: 0.05,
    });
    materials.push(topMat);

    const headGroup = glbSystem.sockets.Head;

    // Organic Human Head Mesh
    let headGeo = new THREE.SphereGeometry(0.46, 48, 48);
    headGeo.scale(isFemale ? 0.94 : 1.0, isFemale ? 1.14 : 1.18, 0.96);
    const pos = headGeo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      x *= (c.faceWidth || 1.0);

      // Deep Recessed Eye Sockets
      const distEyeL = Math.hypot(x - (-0.17), y - 0.08);
      const distEyeR = Math.hypot(x - 0.17, y - 0.08);
      if (z > 0.1 && (distEyeL < 0.18 || distEyeR < 0.18)) {
        const socketDepth = Math.min(distEyeL, distEyeR);
        const indent = (0.18 - socketDepth) * 0.45;
        z -= indent;
      }

      // Brow Ridge Overhang
      if (z > 0.2 && y > 0.16 && y < 0.26 && Math.abs(x) < 0.28) {
        z += 0.035;
      }

      // Continuous Sculpted Nose Bridge & Tip
      if (z > 0.15 && y > -0.08 && y < 0.16 && Math.abs(x) < 0.12) {
        const noseFactor = (0.12 - Math.abs(x)) * 0.7;
        z += noseFactor;
      }

      // Chin and Jaw Contours
      if (y < -0.1) {
        if (!isFemale) {
          x *= 1.06 * (c.jawWidth || 1.0);
          z *= 1.02;
        } else {
          x *= 0.90 * (c.jawWidth || 1.0);
        }
      }

      // Cheekbones
      if (y > -0.08 && y < 0.15 && Math.abs(x) > 0.2) {
        x *= 1.03 * (c.cheekFullness || 1.0);
      }

      pos.setXYZ(i, x, y, z);
    }
    headGeo.computeVertexNormals();
    trackObj(headGeo);

    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.name = 'GLB_Head_Mesh';
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headGroup.add(headMesh);

    // Anatomical Ears
    const earGeo = new THREE.SphereGeometry(0.075, 16, 16);
    earGeo.scale(0.38, 1.05, 0.7);
    trackObj(earGeo);

    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(isFemale ? -0.44 : -0.47, 0.02, -0.02);
    leftEar.rotation.y = -0.15;
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(isFemale ? 0.44 : 0.47, 0.02, -0.02);
    rightEar.rotation.y = 0.15;
    headGroup.add(rightEar);

    // ── 5. RECESSED EYES ──
    const eyeGroup = new THREE.Group();
    headGroup.add(eyeGroup);

    let eyeScale = c.eyeSize === 'large' ? 1.08 : c.eyeSize === 'small' ? 0.88 : 0.98;
    const scleraGeo = new THREE.SphereGeometry(0.068, 24, 24);
    scleraGeo.scale(1.0, 0.82, 0.6);
    const scleraMat = new THREE.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 0.1 });
    trackObj(scleraGeo); materials.push(scleraMat);

    const irisGeo = new THREE.SphereGeometry(0.038, 24, 24);
    irisGeo.scale(1, 1, 0.3);
    const irisMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(eyeHex), roughness: 0.25 });
    trackObj(irisGeo); materials.push(irisMat);

    const pupilGeo = new THREE.SphereGeometry(0.019, 24, 24);
    pupilGeo.scale(1, 1, 0.3);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    trackObj(pupilGeo); materials.push(pupilMat);

    const glintGeo = new THREE.SphereGeometry(0.009, 12, 12);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    trackObj(glintGeo); materials.push(glintMat);

    const createEye = (x) => {
      const g = new THREE.Group();
      const sclera = new THREE.Mesh(scleraGeo, scleraMat); g.add(sclera);
      const iris = new THREE.Mesh(irisGeo, irisMat); iris.position.set(0, 0, 0.045); g.add(iris);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat); pupil.position.set(0, 0, 0.053); g.add(pupil);
      const glint = new THREE.Mesh(glintGeo, glintMat); glint.position.set(0.01, 0.01, 0.06); g.add(glint);

      const lidGeo = new THREE.SphereGeometry(0.071, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
      trackObj(lidGeo);
      const topLid = new THREE.Mesh(lidGeo, skinMat); topLid.rotation.x = Math.PI / 2; g.add(topLid);
      const bottomLid = new THREE.Mesh(lidGeo, skinMat); bottomLid.rotation.x = -Math.PI / 2; g.add(bottomLid);

      g.position.set(x, 0.08, 0.38);
      g.scale.setScalar(eyeScale);
      return { group: g, topLid, bottomLid };
    };

    const leftEye = createEye(-0.165);
    const rightEye = createEye(0.165);
    eyeGroup.add(leftEye.group, rightEye.group);
    const eyelids = [leftEye.topLid, leftEye.bottomLid, rightEye.topLid, rightEye.bottomLid];

    // ── 6. EYEBROWS ──
    const browGeo = new THREE.BoxGeometry(0.125, 0.022 * (c.eyebrowThickness || 1.0), 0.02);
    trackObj(browGeo);
    const browMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hairHex), roughness: 0.7 });
    materials.push(browMat);

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.165, 0.19, 0.40);
    leftBrow.rotation.z = 0.05;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.165, 0.19, 0.40);
    rightBrow.rotation.z = -0.05;
    headGroup.add(rightBrow);

    // ── 7. LIPS & MOUTH ──
    const smileVal = c.smileIntensity !== undefined ? c.smileIntensity : 0.6;
    const mouthGeo = new THREE.TorusGeometry(0.068, 0.015, 16, 24, Math.PI * (0.65 + smileVal * 0.35));
    trackObj(mouthGeo);
    const lipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(isFemale ? '#B55353' : '#8C4848'),
      roughness: 0.38
    });
    materials.push(lipMat);

    const mouthMesh = new THREE.Mesh(mouthGeo, lipMat);
    mouthMesh.position.set(0, -0.15, 0.40);
    mouthMesh.rotation.x = Math.PI;
    headGroup.add(mouthMesh);

    // ── 8. BEARD (MALE ONLY) ──
    if (!isFemale && c.beardStyle && c.beardStyle !== 'none') {
      const beardMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(c.beardColor || hairHex),
        roughness: 0.85,
      });
      materials.push(beardMat);

      if (c.beardStyle === 'mustache') {
        const musGeo = new THREE.BoxGeometry(0.16, 0.035, 0.035);
        trackObj(musGeo);
        const mus = new THREE.Mesh(musGeo, beardMat);
        mus.position.set(0, -0.09, 0.42);
        headGroup.add(mus);
      } else {
        const beardGeo = new THREE.SphereGeometry(0.47, 24, 24, 0, Math.PI * 2, Math.PI * 0.46, Math.PI * 0.5);
        trackObj(beardGeo);
        const beardMesh = new THREE.Mesh(beardGeo, beardMat);
        beardMesh.position.set(0, -0.04, 0);
        headGroup.add(beardMesh);
      }
    }

    // ── 9. SEAMLESS SCALP HAIR (ZERO GAP ABOVE FOREHEAD!) ──
    if (c.hairStyle !== 'bald') {
      const hairGroup = new THREE.Group();
      hairGroup.name = 'GLB_Hair_Socket';
      headGroup.add(hairGroup);

      // Scalp Cap wraps smoothly over head from crown down to temples (ZERO FOREHEAD GAP)
      const topCapGeo = new THREE.SphereGeometry(0.465, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.48);
      topCapGeo.scale(1.01, 1.12, 0.97);
      trackObj(topCapGeo);

      const topCap = new THREE.Mesh(topCapGeo, hairMat);
      topCap.position.set(0, 0.01, -0.01);
      hairGroup.add(topCap);

      if (c.hairStyle === 'long_straight' || c.hairStyle === 'wavy_waves' || c.hairStyle === 'long_wavy_dark') {
        const leftStrandGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.75, 16);
        trackObj(leftStrandGeo);
        const leftStrand = new THREE.Mesh(leftStrandGeo, hairMat);
        leftStrand.position.set(-0.32, -0.2, 0.04);
        leftStrand.rotation.z = -0.1;
        hairGroup.add(leftStrand);

        const rightStrandGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.75, 16);
        trackObj(rightStrandGeo);
        const rightStrand = new THREE.Mesh(rightStrandGeo, hairMat);
        rightStrand.position.set(0.32, -0.2, 0.04);
        rightStrand.rotation.z = 0.1;
        hairGroup.add(rightStrand);
      } else if (c.hairStyle === 'shoulder_bob' || c.hairStyle === 'bob_cut' || c.hairStyle === 'layered_cut') {
        const leftStrandGeo = new THREE.CylinderGeometry(0.11, 0.15, 0.42, 16);
        trackObj(leftStrandGeo);
        const leftStrand = new THREE.Mesh(leftStrandGeo, hairMat);
        leftStrand.position.set(-0.33, -0.1, 0.04);
        hairGroup.add(leftStrand);

        const rightStrandGeo = new THREE.CylinderGeometry(0.11, 0.15, 0.42, 16);
        trackObj(rightStrandGeo);
        const rightStrand = new THREE.Mesh(rightStrandGeo, hairMat);
        rightStrand.position.set(0.33, -0.1, 0.04);
        hairGroup.add(rightStrand);
      } else if (c.hairStyle === 'top_bun') {
        const bunGeo = new THREE.SphereGeometry(0.15, 16, 16);
        trackObj(bunGeo);
        const bun = new THREE.Mesh(bunGeo, hairMat);
        bun.position.set(0, 0.58, -0.1);
        hairGroup.add(bun);
      }
    }

    // ── 10. GLASSES ──
    if (c.glasses && c.glasses !== 'none') {
      const glassesGroup = new THREE.Group();
      glassesGroup.name = 'GLB_Glasses_Socket';
      headGroup.add(glassesGroup);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.8 });
      const lensMat  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.3 });
      materials.push(frameMat, lensMat);

      if (c.glasses === 'round' || c.glasses === 'aviator') {
        const leftF = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.013, 16, 24), frameMat);
        leftF.position.set(-0.165, 0.08, 0.42); glassesGroup.add(leftF); trackObj(leftF);

        const rightF = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.013, 16, 24), frameMat);
        rightF.position.set(0.165, 0.08, 0.42); glassesGroup.add(rightF); trackObj(rightF);

        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.13), frameMat);
        bridge.position.set(0, 0.08, 0.42); bridge.rotation.z = Math.PI / 2; glassesGroup.add(bridge); trackObj(bridge);
      } else {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.15, 0.03), frameMat);
        frame.position.set(0, 0.08, 0.42); glassesGroup.add(frame); trackObj(frame);
      }
    }

    // ── 11. HUMAN NECK & SHOULDER BUST (FULLY CONNECTED) ──
    const neckBone = glbSystem.sockets.Neck;
    const spineBone = glbSystem.sockets.Spine;

    // Smooth Neck
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.32, 24), skinMat);
    neckMesh.position.set(0, -0.28, 0);
    neckMesh.castShadow = true;
    neckBone.add(neckMesh); trackObj(neckMesh);

    // Clothed Shoulders / Upper-Chest Bust (Spans from Neck down to Chest)
    const shoulderBustGeo = new THREE.CylinderGeometry(0.36, 0.66, 0.8, 32);
    shoulderBustGeo.scale(isFemale ? 1.16 : 1.26, 1.0, 0.72);
    trackObj(shoulderBustGeo);

    const shoulderBustMesh = new THREE.Mesh(shoulderBustGeo, topMat);
    shoulderBustMesh.position.set(0, -0.62, -0.02);
    shoulderBustMesh.castShadow = true;
    shoulderBustMesh.receiveShadow = true;
    spineBone.add(shoulderBustMesh); trackObj(shoulderBustMesh);

    // Collar Trim
    const collarGeo = new THREE.TorusGeometry(0.20, 0.024, 16, 32);
    trackObj(collarGeo);
    const collarMesh = new THREE.Mesh(collarGeo, topMat);
    collarMesh.position.set(0, -0.24, 0);
    collarMesh.rotation.x = Math.PI / 2;
    spineBone.add(collarMesh); trackObj(collarMesh);

    // ── 12. ANIMATION LOOP & INTERACTION CONTROLS ──
    let frameId;
    let time = 0;
    let nextBlinkTime = performance.now() + 3000 + Math.random() * 2000;
    let isBlinking = false;
    let blinkStartTime = 0;

    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };
    let currentRotation = { x: 0, y: 0 };
    let lastInteractionTime = performance.now();

    const renderLoop = () => {
      const now = performance.now();
      time += 0.016;

      // Subtle breathing
      glbSystem.bones.Spine.position.y = 0.4 + Math.sin(time * 1.2) * 0.003;

      // Blinking Logic
      if (now > nextBlinkTime && !isBlinking) {
        isBlinking = true;
        blinkStartTime = now;
      }
      if (isBlinking) {
        const blinkProgress = (now - blinkStartTime) / 150;
        if (blinkProgress <= 0.5) {
          const val = blinkProgress * 2;
          eyelids.forEach(lid => { lid.scale.y = val; });
        } else if (blinkProgress <= 1.0) {
          const val = (1.0 - blinkProgress) * 2;
          eyelids.forEach(lid => { lid.scale.y = val; });
        } else {
          eyelids.forEach(lid => { lid.scale.y = 0; });
          isBlinking = false;
          nextBlinkTime = now + 3000 + Math.random() * 3000;
        }
      }

      // Smooth Rotation & Idle Sway
      if (!isDragging && (now - lastInteractionTime > 2500)) {
        targetRotation.y = Math.sin(time * 0.5) * 0.08;
      }

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

      avatarGroup.rotation.y = currentRotation.y;
      avatarGroup.rotation.x = currentRotation.x;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Drag Rotation Controls
    const dom = renderer.domElement;

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
      lastInteractionTime = performance.now();
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      targetRotation.y += deltaX * 0.01;
      targetRotation.x = Math.max(-0.25, Math.min(0.25, targetRotation.x + deltaY * 0.008));
      lastInteractionTime = performance.now();
    };

    const handleMouseUp = () => { isDragging = false; };

    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastInteractionTime = performance.now();
      }
    };
    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      targetRotation.y += deltaX * 0.01;
      targetRotation.x = Math.max(-0.25, Math.min(0.25, targetRotation.x + deltaY * 0.008));
      lastInteractionTime = performance.now();
    };
    const handleTouchEnd = () => { isDragging = false; };

    dom.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();

      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      renderer.dispose();

      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [config]);

  return (
    <div
      ref={mountRef}
      style={{
        width,
        height,
        position: 'relative',
        cursor: 'grab',
        overflow: 'hidden',
      }}
    />
  );
}
