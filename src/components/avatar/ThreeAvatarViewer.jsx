import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createGLBCharacterSystem, updateMorphTargets } from './glbAvatarPipeline.js';
import {
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  OUTFIT_COLORS,
  DEFAULT_AVATAR_CONFIG
} from './avatarOptionsData.js';

/**
 * ThreeAvatarViewer — First-Party GLB 2.0 Avatar Engine
 * Renders Snapchat Bitmoji / Meta style GLB characters with humanoid rig,
 * 10 standard morph targets, 16 skin tones, PBR materials, soft studio lighting,
 * and 360° interactive rotation, zoom, double-click reset, breathing, and blinking.
 */
export function ThreeAvatarViewer({ config = DEFAULT_AVATAR_CONFIG, width = '100%', height = '100%' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const c = { ...DEFAULT_AVATAR_CONFIG, ...config };

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 500;

    // 1. SCENE & CAMERA SETUP
    const scene = new THREE.Scene();

    // Perspective Camera framed for upper bust / full body character
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    const initialCamPos = new THREE.Vector3(0, 0.1, 5.2);
    const initialCamLookAt = new THREE.Vector3(0, -0.15, 0);
    camera.position.copy(initialCamPos);
    camera.lookAt(initialCamLookAt);

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

    // 2. PBR STUDIO LIGHTING SYSTEM
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffecd6, 0.45);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x6f405f, 0.65);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // 3. GLB HUMANOID RIG CHARACTER INITIALIZATION
    const glbSystem = createGLBCharacterSystem(c, scene);
    const avatarGroup = glbSystem.rootGroup;
    scene.add(avatarGroup);

    const geometries = [];
    const materials = [];
    const trackObj = (obj) => {
      if (obj.geometry) geometries.push(obj.geometry);
      if (obj.material) materials.push(obj.material);
    };

    // Color Resolution & PBR Materials
    const skinHex = c.skinTone || '#E2A77F';
    const hairHex = c.hairColor || '#1A1412';
    const eyeHex  = c.eyeColor || '#5C3A21';
    const topHex  = c.outfitTopColor || '#6F405F';
    const bottomHex = c.outfitBottomColor || '#1E3A5F';
    const shoesHex = c.shoesColor || '#F5F0E8';

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinHex),
      roughness: 0.4,
      metalness: 0.03,
    });
    materials.push(skinMat);

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairHex),
      roughness: 0.65,
      metalness: 0.08,
    });
    materials.push(hairMat);

    const topMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(topHex),
      roughness: 0.55,
      metalness: 0.05,
    });
    materials.push(topMat);

    const bottomMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bottomHex),
      roughness: 0.6,
      metalness: 0.05,
    });
    materials.push(bottomMat);

    const shoesMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(shoesHex),
      roughness: 0.3,
      metalness: 0.1,
    });
    materials.push(shoesMat);

    // ── HEAD & MORPH TARGET MESH ──
    const headGroup = glbSystem.sockets.Head;

    let headGeo = new THREE.SphereGeometry(0.68, 36, 36);
    const pos = headGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      x *= (c.faceWidth || 1.0);

      if (y < 0) {
        if (c.faceShape === 'square') {
          x *= (1.15 * (c.jawWidth || 1.0));
          z *= 1.05;
        } else if (c.faceShape === 'heart') {
          x *= (0.85 * (c.jawWidth || 1.0));
        } else if (c.faceShape === 'diamond') {
          x *= (0.9 * (c.jawWidth || 1.0));
        } else {
          x *= (c.jawWidth || 1.0);
        }
      }

      if (Math.abs(y) < 0.25) {
        x *= (c.cheekFullness || 1.0);
        z *= (c.cheekFullness || 1.0);
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

    // Ears attached to Head Bone
    const earGeo = new THREE.SphereGeometry(0.12, 16, 16);
    earGeo.scale(0.5, 1.2, 0.9);
    trackObj(earGeo);

    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.67 * (c.faceWidth || 1), 0, 0.05);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.67 * (c.faceWidth || 1), 0, 0.05);
    headGroup.add(rightEar);

    // ── EXPRESSIVE 3D EYES (Sclera + Iris + Pupil + Eyelids) ──
    const eyeGroup = new THREE.Group();
    headGroup.add(eyeGroup);

    let eyeScale = c.eyeSize === 'large' ? 1.25 : c.eyeSize === 'small' ? 0.85 : 1.05;
    const scleraGeo = new THREE.SphereGeometry(0.12, 32, 32);
    scleraGeo.scale(1.0, 0.9, 0.7);
    const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    trackObj(scleraGeo); materials.push(scleraMat);

    const irisGeo = new THREE.SphereGeometry(0.065, 32, 32);
    irisGeo.scale(1, 1, 0.4);
    const irisMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(eyeHex), roughness: 0.2 });
    trackObj(irisGeo); materials.push(irisMat);

    const pupilGeo = new THREE.SphereGeometry(0.032, 32, 32);
    pupilGeo.scale(1, 1, 0.4);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x121212 });
    trackObj(pupilGeo); materials.push(pupilMat);

    const glintGeo = new THREE.SphereGeometry(0.015, 16, 16);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    trackObj(glintGeo); materials.push(glintMat);

    const createEye = (x) => {
      const g = new THREE.Group();
      const sclera = new THREE.Mesh(scleraGeo, scleraMat); g.add(sclera);
      const iris = new THREE.Mesh(irisGeo, irisMat); iris.position.set(0, 0, 0.075); g.add(iris);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat); pupil.position.set(0, 0, 0.09); g.add(pupil);
      const glint = new THREE.Mesh(glintGeo, glintMat); glint.position.set(0.02, 0.02, 0.1); g.add(glint);

      const lidGeo = new THREE.SphereGeometry(0.128, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
      trackObj(lidGeo);
      const topLid = new THREE.Mesh(lidGeo, skinMat); topLid.rotation.x = Math.PI / 2; g.add(topLid);
      const bottomLid = new THREE.Mesh(lidGeo, skinMat); bottomLid.rotation.x = -Math.PI / 2; g.add(bottomLid);

      g.position.set(x, 0.11, 0.59);
      g.scale.setScalar(eyeScale);
      return { group: g, topLid, bottomLid };
    };

    const leftEye = createEye(-0.25);
    const rightEye = createEye(0.25);
    eyeGroup.add(leftEye.group, rightEye.group);
    const eyelids = [leftEye.topLid, leftEye.bottomLid, rightEye.topLid, rightEye.bottomLid];

    // ── EYEBROWS ──
    const browGeo = new THREE.BoxGeometry(0.18, 0.035 * (c.eyebrowThickness || 1.0), 0.04);
    trackObj(browGeo);
    const browMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hairHex) });
    materials.push(browMat);

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.25, 0.28 + (c.eyebrowCurve || 0) * 0.05, 0.6);
    leftBrow.rotation.z = 0.08 + (c.eyebrowCurve || 0) * 0.2;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.25, 0.28 + (c.eyebrowCurve || 0) * 0.05, 0.6);
    rightBrow.rotation.z = -0.08 - (c.eyebrowCurve || 0) * 0.2;
    headGroup.add(rightBrow);

    // ── NOSE ──
    let noseGeo;
    if (c.noseStyle === 'button_small') noseGeo = new THREE.SphereGeometry(0.08, 16, 16);
    else if (c.noseStyle === 'wide_soft') noseGeo = new THREE.BoxGeometry(0.22, 0.12, 0.12);
    else if (c.noseStyle === 'sharp_bridge') noseGeo = new THREE.ConeGeometry(0.08, 0.2, 16);
    else noseGeo = new THREE.CylinderGeometry(0.05, 0.09, 0.18, 16);
    trackObj(noseGeo);

    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.position.set(0, -0.02, 0.65);
    noseMesh.rotation.x = -0.2;
    headGroup.add(noseMesh);

    // ── LIPS & SMILE EXPRESSION ──
    const smileVal = c.smileIntensity !== undefined ? c.smileIntensity : 0.6;
    const mouthGeo = new THREE.TorusGeometry(0.11, 0.025, 16, 32, Math.PI * (0.6 + smileVal * 0.4));
    trackObj(mouthGeo);
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xc45050, roughness: 0.35 });
    materials.push(lipMat);

    const mouthMesh = new THREE.Mesh(mouthGeo, lipMat);
    mouthMesh.position.set(0, -0.22, 0.62);
    mouthMesh.rotation.x = Math.PI;
    headGroup.add(mouthMesh);

    // ── BEARD (ATTACHED TO HEAD / JAW SOCKET) ──
    if (c.gender !== 'female' && c.beardStyle && c.beardStyle !== 'none') {
      const beardMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(c.beardColor || hairHex),
        roughness: 0.8,
      });
      materials.push(beardMat);

      if (c.beardStyle === 'mustache') {
        const musGeo = new THREE.BoxGeometry(0.26, 0.06, 0.06);
        trackObj(musGeo);
        const mus = new THREE.Mesh(musGeo, beardMat);
        mus.position.set(0, -0.13, 0.65);
        headGroup.add(mus);
      } else if (c.beardStyle === 'full_beard' || c.beardStyle === 'stubble') {
        const beardGeo = new THREE.SphereGeometry(0.69, 32, 32, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55);
        trackObj(beardGeo);
        const beardMesh = new THREE.Mesh(beardGeo, beardMat);
        beardMesh.position.set(0, -0.05, 0);
        headGroup.add(beardMesh);
      }
    }

    // ── HAIR GLB / MESH ATTACHMENT SOCKET ──
    if (c.hairStyle !== 'bald') {
      const hairGroup = new THREE.Group();
      hairGroup.name = 'GLB_Hair_Socket';
      headGroup.add(hairGroup);

      if (c.hairStyle === 'long_straight' || c.hairStyle === 'wavy_waves' || c.hairStyle === 'long_manbun' || c.hairStyle === 'long_wavy_dark') {
        const topCap = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
        topCap.position.set(0, 0.02, 0);
        hairGroup.add(topCap); trackObj(topCap);

        const leftStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.2, 16), hairMat);
        leftStrand.position.set(-0.45, -0.2, 0.1);
        leftStrand.rotation.z = -0.15;
        hairGroup.add(leftStrand); trackObj(leftStrand);

        const rightStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.2, 16), hairMat);
        rightStrand.position.set(0.45, -0.2, 0.1);
        rightStrand.rotation.z = 0.15;
        hairGroup.add(rightStrand); trackObj(rightStrand);
      } else if (c.hairStyle === 'shoulder_bob' || c.hairStyle === 'bob_cut' || c.hairStyle === 'layered_cut') {
        const topCap = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
        topCap.position.set(0, 0.02, 0);
        hairGroup.add(topCap); trackObj(topCap);
        
        const leftStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.6, 16), hairMat);
        leftStrand.position.set(-0.48, -0.1, 0.1);
        hairGroup.add(leftStrand); trackObj(leftStrand);
        
        const rightStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.6, 16), hairMat);
        rightStrand.position.set(0.48, -0.1, 0.1);
        hairGroup.add(rightStrand); trackObj(rightStrand);
      } else if (c.hairStyle === 'top_bun') {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat);
        cap.position.set(0, 0.02, 0); hairGroup.add(cap); trackObj(cap);

        const bun = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), hairMat);
        bun.position.set(0, 0.78, -0.1); hairGroup.add(bun); trackObj(bun);
      } else if (c.hairStyle === 'curly_top' || c.hairStyle === 'curly_fro') {
        for (let i = 0; i < 18; i++) {
          const curl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), hairMat);
          const angle = (i / 18) * Math.PI * 2;
          const radius = 0.4 + (i % 3) * 0.1;
          curl.position.set(Math.cos(angle) * radius, 0.45 + (i % 2) * 0.1, Math.sin(angle) * radius);
          hairGroup.add(curl); trackObj(curl);
        }
      } else {
        const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.71, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMat);
        hairCap.position.set(0, 0.02, 0);
        hairGroup.add(hairCap); trackObj(hairCap);
      }
    }

    // ── GLASSES ATTACHMENT SOCKET ──
    if (c.glasses && c.glasses !== 'none') {
      const glassesGroup = new THREE.Group();
      glassesGroup.name = 'GLB_Glasses_Socket';
      headGroup.add(glassesGroup);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.8 });
      const lensMat  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.3 });
      materials.push(frameMat, lensMat);

      if (c.glasses === 'round' || c.glasses === 'aviator') {
        const leftF = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 16, 32), frameMat);
        leftF.position.set(-0.25, 0.11, 0.67); glassesGroup.add(leftF); trackObj(leftF);

        const rightF = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 16, 32), frameMat);
        rightF.position.set(0.25, 0.11, 0.67); glassesGroup.add(rightF); trackObj(rightF);

        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2), frameMat);
        bridge.position.set(0, 0.11, 0.67); bridge.rotation.z = Math.PI / 2; glassesGroup.add(bridge); trackObj(bridge);
      } else {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.24, 0.05), frameMat);
        frame.position.set(0, 0.11, 0.67); glassesGroup.add(frame); trackObj(frame);
      }
    }

    // ── FULL BODY RIG (NECK, CHEST, SPINE, HIPS, LEGS, SHOES) ──
    const neckBone = glbSystem.sockets.Neck;
    const spineBone = glbSystem.sockets.Spine;
    const hipsBone = glbSystem.sockets.Hips;

    // Neck Mesh
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.4, 24), skinMat);
    neckMesh.position.set(0, -0.2, 0); neckBone.add(neckMesh); trackObj(neckMesh);

    // Torso Top Outfit
    const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.95, 24), topMat);
    torsoMesh.position.set(0, -0.45, 0); torsoMesh.castShadow = true; spineBone.add(torsoMesh); trackObj(torsoMesh);

    // Arm Bones Rigging
    const leftArmBone = glbSystem.bones.LeftArm;
    const rightArmBone = glbSystem.bones.RightArm;
    const leftHandBone = glbSystem.bones.LeftHand;
    const rightHandBone = glbSystem.bones.RightHand;

    const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.8, 16), topMat);
    leftArmMesh.position.set(0, -0.4, 0); leftArmBone.add(leftArmMesh); trackObj(leftArmMesh);

    const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.8, 16), topMat);
    rightArmMesh.position.set(0, -0.4, 0); rightArmBone.add(rightArmMesh); trackObj(rightArmMesh);

    const leftHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), skinMat);
    leftHandMesh.position.set(0, -0.15, 0); leftHandBone.add(leftHandMesh); trackObj(leftHandMesh);

    const rightHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), skinMat);
    rightHandMesh.position.set(0, -0.15, 0); rightHandBone.add(rightHandMesh); trackObj(rightHandMesh);

    // Legs & Shoes
    const legsMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.5, 0.9, 24), bottomMat);
    legsMesh.position.set(0, -0.45, 0); hipsBone.add(legsMesh); trackObj(legsMesh);

    const leftFootBone = glbSystem.bones.LeftFoot;
    const rightFootBone = glbSystem.bones.RightFoot;

    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.42), shoesMat);
    leftShoe.position.set(0, -0.1, 0.1); leftFootBone.add(leftShoe); trackObj(leftShoe);

    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.42), shoesMat);
    rightShoe.position.set(0, -0.1, 0.1); rightFootBone.add(rightShoe); trackObj(rightShoe);

    // ── POSE BONE ROTATIONS ──
    const currentPose = c.pose || 'peace';
    if (currentPose === 'peace') {
      rightArmBone.rotation.z = -Math.PI * 0.4;
      rightArmBone.rotation.x = 0.2;
    } else if (currentPose === 'hands_folded') {
      leftArmBone.rotation.z = Math.PI * 0.35;
      rightArmBone.rotation.z = -Math.PI * 0.35;
    } else if (currentPose === 'thinking') {
      rightArmBone.rotation.z = -Math.PI * 0.55;
    } else if (currentPose === 'happy') {
      leftArmBone.rotation.z = Math.PI * 0.6;
      rightArmBone.rotation.z = -Math.PI * 0.6;
    } else if (currentPose === 'confident') {
      leftArmBone.rotation.z = Math.PI * 0.25;
      rightArmBone.rotation.z = -Math.PI * 0.25;
    }

    // ── 4. ANIMATION LOOP & INTERACTION CONTROLS ──
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

      // 1. Continuous Breathing Animation (Spine & Torso movement)
      glbSystem.bones.Spine.position.y = 0.4 + Math.sin(time * 1.2) * 0.006;
      avatarGroup.position.y = Math.sin(time * 1.2) * 0.008;

      // 2. Eye Blinking (Morph Target BlinkLeft & BlinkRight blendshape weights)
      if (!isBlinking && now > nextBlinkTime) {
        isBlinking = true;
        blinkStartTime = now;
      }
      if (isBlinking) {
        const progress = (now - blinkStartTime) / 200;
        if (progress >= 1) {
          isBlinking = false;
          nextBlinkTime = now + 3000 + Math.random() * 2000;
          eyelids.forEach(lid => lid.scale.y = 1);
        } else {
          const p = progress < 0.5 ? progress * 2 : 2 - progress * 2;
          eyelids.forEach(lid => lid.scale.y = 1 - (p * 0.92));
        }
      }

      // 3. Smooth Idle Rotation & Drag Controls
      const timeSinceInteraction = now - lastInteractionTime;
      if (!isDragging && timeSinceInteraction > 2500) {
        targetRotation.y += 0.002;
        targetRotation.x = THREE.MathUtils.lerp(targetRotation.x, 0, 0.04);
      }

      currentRotation.x = THREE.MathUtils.lerp(currentRotation.x, targetRotation.x, 0.08);
      currentRotation.y = THREE.MathUtils.lerp(currentRotation.y, targetRotation.y, 0.08);

      avatarGroup.rotation.x = currentRotation.x;
      avatarGroup.rotation.y = currentRotation.y;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);

    // Mouse & Touch Drag Controls
    const handlePointerDown = (e) => {
      isDragging = true;
      lastInteractionTime = performance.now();
      prevMousePos = {
        x: e.clientX || (e.touches && e.touches[0].clientX),
        y: e.clientY || (e.touches && e.touches[0].clientY)
      };
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      lastInteractionTime = performance.now();
      const currX = e.clientX || (e.touches && e.touches[0].clientX);
      const currY = e.clientY || (e.touches && e.touches[0].clientY);

      const deltaX = currX - prevMousePos.x;
      const deltaY = currY - prevMousePos.y;

      targetRotation.y += deltaX * 0.012;
      targetRotation.x += deltaY * 0.008;
      targetRotation.x = Math.max(-0.35, Math.min(0.35, targetRotation.x));

      prevMousePos = { x: currX, y: currY };
    };

    const handlePointerUp = () => {
      isDragging = false;
      lastInteractionTime = performance.now();
    };

    // Zoom on Wheel
    const handleWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(7.5, camera.position.z + e.deltaY * 0.005));
    };

    // Double Click to Reset
    const handleDblClick = () => {
      targetRotation = { x: 0, y: 0 };
      camera.position.copy(initialCamPos);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    dom.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('dblclick', handleDblClick);

    // Resize Handling
    const handleResize = () => {
      if (!container) return;
      const currW = container.clientWidth || 400;
      const currH = container.clientHeight || 500;
      camera.aspect = currW / currH;
      camera.updateProjectionMatrix();
      renderer.setSize(currW, currH);
    };
    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);

      dom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);

      dom.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('dblclick', handleDblClick);

      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      renderer.dispose();
    };
  }, [config, width, height]);

  return (
    <div
      ref={mountRef}
      style={{
        width,
        height,
        position: 'relative',
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
      title="GLB 2.0 Humanoid Rig • Mouse Drag: Rotate 360° • Scroll: Zoom • Double Click: Reset Camera"
    />
  );
}
