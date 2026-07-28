import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS } from './avatarOptionsData.js';

export function ThreeAvatarViewer({ config, size = 320, height = '70vh' }) {
  const mountRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const idleTimerRef = useRef(null);
  const autoRotateRef = useRef(true);
  const avatarGroupRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || size;
    const containerHeight = container.clientHeight || 360;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(38, width / containerHeight, 0.1, 1000);
    camera.position.set(0, 0.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x6f405f, 0.6);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xe5a93c, 0.4);
    fillLight.position.set(0, -3, 3);
    scene.add(fillLight);

    // 3. Avatar Main Group
    const avatarGroup = new THREE.Group();
    avatarGroupRef.current = avatarGroup;
    scene.add(avatarGroup);

    // ── PROCEDURAL 3D MESH GENERATOR ──
    const skinInfo = SKIN_TONES.find(s => s.id === config.skinTone) || SKIN_TONES[4];
    const hairColorInfo = HAIR_COLORS.find(h => h.id === config.hairColor) || HAIR_COLORS[0];
    const outfitColorInfo = OUTFIT_COLORS.find(o => o.id === config.outfitColor) || OUTFIT_COLORS[0];

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinInfo.hex),
      roughness: 0.45,
      metalness: 0.05,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColorInfo.hex),
      roughness: 0.6,
      metalness: 0.1,
    });

    const outfitMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(outfitColorInfo.hex),
      roughness: 0.5,
      metalness: 0.1,
    });

    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.1 });
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const accessoryMat = new THREE.MeshStandardMaterial({ color: 0xe5a93c, roughness: 0.3, metalness: 0.8 });

    // A. Head Mesh (Face shape tweaks)
    let headGeo;
    if (config.face === 'square') {
      headGeo = new THREE.BoxGeometry(1.2, 1.3, 1.2);
    } else if (config.face === 'oval') {
      headGeo = new THREE.SphereGeometry(0.7, 32, 32);
      headGeo.scale(0.9, 1.15, 0.9);
    } else {
      headGeo = new THREE.SphereGeometry(0.68, 32, 32);
    }

    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 0.4;
    headMesh.castShadow = true;
    avatarGroup.add(headMesh);

    // B. Neck & Torso / Outfit Mesh
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.4, 16);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = -0.15;
    avatarGroup.add(neckMesh);

    let torsoGeo;
    if (config.outfit === 'hoodie') {
      torsoGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.9, 16);
    } else {
      torsoGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.85, 16);
    }

    const torsoMesh = new THREE.Mesh(torsoGeo, outfitMat);
    torsoMesh.position.y = -0.7;
    torsoMesh.castShadow = true;
    avatarGroup.add(torsoMesh);

    // C. 3D Eyes
    const eyeScale = config.eyes === 'large' ? 1.3 : config.eyes === 'small' ? 0.75 : 1.0;
    
    const leftEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.12 * eyeScale, 16, 16), eyeWhiteMat);
    leftEyeWhite.position.set(-0.24, 0.48, 0.58);
    avatarGroup.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.12 * eyeScale, 16, 16), eyeWhiteMat);
    rightEyeWhite.position.set(0.24, 0.48, 0.58);
    avatarGroup.add(rightEyeWhite);

    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06 * eyeScale, 16, 16), eyeMat);
    leftPupil.position.set(-0.24, 0.48, 0.68);
    avatarGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.06 * eyeScale, 16, 16), eyeMat);
    rightPupil.position.set(0.24, 0.48, 0.68);
    avatarGroup.add(rightPupil);

    // D. 3D Eyebrows
    const eyebrowGeo = new THREE.BoxGeometry(0.18, 0.03, 0.04);
    const leftBrow = new THREE.Mesh(eyebrowGeo, hairMat);
    leftBrow.position.set(-0.24, 0.62, 0.62);
    leftBrow.rotation.z = 0.08;
    avatarGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(eyebrowGeo, hairMat);
    rightBrow.position.set(0.24, 0.62, 0.62);
    rightBrow.rotation.z = -0.08;
    avatarGroup.add(rightBrow);

    // E. 3D Nose & Mouth
    const noseGeo = new THREE.ConeGeometry(0.06, 0.16, 16);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.position.set(0, 0.42, 0.68);
    noseMesh.rotation.x = -0.2;
    avatarGroup.add(noseMesh);

    const mouthGeo = new THREE.TorusGeometry(0.09, 0.02, 16, 32, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xce5a5a, roughness: 0.3 });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.position.set(0, 0.28, 0.64);
    mouthMesh.rotation.x = Math.PI;
    avatarGroup.add(mouthMesh);

    // F. 3D Hairstyles
    if (config.hair !== 'bald') {
      if (config.hair === 'curly_top' || config.hair === 'curly') {
        for (let i = 0; i < 14; i++) {
          const curl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), hairMat);
          const angle = (i / 14) * Math.PI * 2;
          curl.position.set(Math.cos(angle) * 0.42, 0.78 + Math.sin(i) * 0.08, Math.sin(angle) * 0.42);
          avatarGroup.add(curl);
        }
      } else if (config.hair === 'long_waves' || config.hair === 'ponytail') {
        const topHair = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
        topHair.position.set(0, 0.42, 0);
        avatarGroup.add(topHair);

        const leftStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.1, 16), hairMat);
        leftStrand.position.set(-0.45, 0.15, 0.2);
        avatarGroup.add(leftStrand);

        const rightStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.1, 16), hairMat);
        rightStrand.position.set(0.45, 0.15, 0.2);
        avatarGroup.add(rightStrand);
      } else {
        // Short crop / classic cap
        const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
        hairCap.position.set(0, 0.42, 0);
        avatarGroup.add(hairCap);
      }
    }

    // G. 3D Glasses / Eyewear
    if (config.glasses && config.glasses !== 'none') {
      const glassesMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.2, metalness: 0.8 });
      const glassLensMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.35 });

      if (config.glasses === 'round' || config.glasses === 'aviator') {
        const leftFrame = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 16, 32), glassesMat);
        leftFrame.position.set(-0.24, 0.48, 0.66);
        avatarGroup.add(leftFrame);

        const rightFrame = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 16, 32), glassesMat);
        rightFrame.position.set(0.24, 0.48, 0.66);
        avatarGroup.add(rightFrame);

        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18), glassesMat);
        bridge.position.set(0, 0.48, 0.66);
        bridge.rotation.z = Math.PI / 2;
        avatarGroup.add(bridge);
      } else if (config.glasses === 'square') {
        const squareFrame = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.24, 0.06), glassesMat);
        squareFrame.position.set(0, 0.48, 0.68);
        avatarGroup.add(squareFrame);
      }
    }

    // H. 3D Accessories (Headphones, Crown, Cap)
    if (config.accessories === 'headphones') {
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x2d1d15, roughness: 0.2 });
      const cupMat = new THREE.MeshStandardMaterial({ color: 0x6f405F, roughness: 0.3 });

      const headBand = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.04, 16, 32, Math.PI), bandMat);
      headBand.position.set(0, 0.45, 0);
      avatarGroup.add(headBand);

      const leftCup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16), cupMat);
      leftCup.position.set(-0.72, 0.45, 0);
      leftCup.rotation.z = Math.PI / 2;
      avatarGroup.add(leftCup);

      const rightCup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16), cupMat);
      rightCup.position.set(0.72, 0.45, 0);
      rightCup.rotation.z = Math.PI / 2;
      avatarGroup.add(rightCup);
    } else if (config.accessories === 'crown') {
      const crownMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.28, 8, 1, true), accessoryMat);
      crownMesh.position.set(0, 1.15, 0);
      avatarGroup.add(crownMesh);
    }

    // ── MOUSE DRAG & TOUCH ROTATION CONTROLS ──
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      avatarGroup.rotation.y += deltaX * 0.012;
      avatarGroup.rotation.x = Math.max(-0.4, Math.min(0.4, avatarGroup.rotation.x + deltaY * 0.008));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        autoRotateRef.current = true;
      }, 1500);
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch events for mobile
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        autoRotateRef.current = false;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
      avatarGroup.rotation.y += deltaX * 0.012;
      avatarGroup.rotation.x = Math.max(-0.4, Math.min(0.4, avatarGroup.rotation.x + deltaY * 0.008));
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    domElem.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    // ── ANIMATION LOOP WITH AUTO-ROTATE ──
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotateRef.current && avatarGroupRef.current) {
        avatarGroupRef.current.rotation.y += 0.008; // Smooth continuous 3D idle rotation
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || size;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      renderer.dispose();
    };
  }, [config, size]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: height,
        minHeight: '280px',
        maxHeight: '480px',
        cursor: 'grab',
        position: 'relative',
        userSelect: 'none',
        touchAction: 'none',
      }}
      title="Click & drag to rotate your 3D avatar 360°"
    />
  );
}
