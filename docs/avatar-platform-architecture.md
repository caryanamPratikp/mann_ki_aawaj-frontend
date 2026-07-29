# Man Ki Aavaj Avatar Platform — Production Architecture

## 1. Executive decision

Replace the current procedural avatar renderer with a **first-party, rigged GLB character platform**. The platform owns a stable humanoid skeleton, a shared facial blend-shape contract, modular skinned attachments, authored animation clips, and a versioned avatar recipe. Three.js is retained only as the runtime renderer; it must no longer manufacture character geometry.

The target is a stylized anonymous identity system: expressive and warm, with the broad, readable silhouette of Bitmoji and the customization discipline of modern social avatars. It is not a generic third-party avatar embed, a photoreal system, or a collection of 3D primitives.

**Scope boundary:** this replaces the avatar domain only. Existing authentication, identity privacy rules, feeds, comments, messaging, moderation, reporting, and profile flows remain behaviorally unchanged. They consume a new `avatarRef`/thumbnail contract through the existing display component.

## 2. Current-state audit and why it cannot reach the target

The existing implementation is a prototype renderer, not an avatar platform.

| Area | Evidence in current code | Why it fails |
| --- | --- | --- |
| Character construction | `src/components/avatar/ThreeAvatarViewer.jsx` builds the head, face, hair, clothing, limbs, and accessories with `SphereGeometry`, `CylinderGeometry`, `BoxGeometry`, and `TorusGeometry`. | Separate primitives cannot produce a cohesive silhouette, deformation, hair volume, facial planes, garment construction, or clean animation. Styling can only mask the limitation. |
| Facial expression | Face dimensions are altered by moving sphere vertices; blinking scales eyelid meshes. | This has no facial rig, blend shapes, correct lip/eye topology, or reusable expression library. |
| Poses | “Poses” rotate and reposition independent cylinder arms and sphere hands. | There is no skeleton, skinning, IK, authored motion, or animation blending. Every pose is fragile and visually synthetic. |
| Inline identity | `LayeredAvatar.jsx` redraws a separate SVG interpretation of the studio configuration. | The feed identity and studio character are different renderers; visual parity is impossible and each new feature must be implemented twice. |
| Data model | `avatarOptionsData.js` stores renderer-oriented colours and option names, plus an arbitrary `rpmAvatarUrl`. | It is not versioned, has no asset compatibility validation, no content-addressed asset manifest, and cannot migrate safely. |
| External fallback | `ReadyPlayerMeCreator.jsx` accepts a GLB URL from a `demo` iframe. | The visual language, rig, asset availability, moderation surface, and long-term compatibility are outside product control. A URL is not a durable avatar identity. |
| Runtime | The viewer manually owns a WebGL renderer and animation loop, rebuilds the scene on every config change, and continuously renders. | It has no shared asset cache, adaptive quality tiers, visibility pausing, GLB lifecycle, animation mixer, or renderer budget. |

There is already an important integration seam: `InitialAvatar` is the platform-wide display component. Preserve that seam; replace its internals, not every feed/comment/chat call site.

## 3. Platform shape

```text
Avatar Studio ──draft recipe──> Avatar Composer ──validated recipe──> Avatar API/storage
       │                              │                                      │
       │                              ├─ asset manifest / compatibility       ├─ canonical recipe
       │                              ├─ GLB loader + assembly                ├─ thumbnail jobs
       │                              └─ animation state machine              └─ CDN assets
       │                                                                     
Feed / comments / chat / profile ──avatarRef──> AvatarThumbnail (image first, 3D optional)
```

The **recipe**, not a baked uploaded GLB, is the canonical user avatar. A deterministic composer resolves it against a pinned asset-manifest version. This keeps user identity small, migratable, reviewable, and compatible with new content packs.

## 4. Repository structure

```text
src/avatar/
  api/
    avatarClient.ts                 # read/write recipes and signed thumbnail URLs
    avatarMigrations.ts             # schema-version upgrades
  assets/
    assetManifest.ts                # generated, checked-in manifest types only
    assetResolver.ts                # recipe -> compatible asset descriptors
    gltfLoader.ts                   # cached DRACO/KTX2/Meshopt GLB loading
  composer/
    AvatarComposer.tsx              # mounts base mesh and compatible modules
    MaterialOverrides.ts             # palette / texture variant application
    BlendShapeController.ts         # named morph targets and clamping
    AttachmentBinder.ts              # skeleton-bone and surface attachment binding
  animation/
    animationCatalog.ts
    AvatarAnimator.ts               # AnimationMixer and layer weights
    avatarStateMachine.ts            # idle, gesture, emote state transitions
    proceduralAdditives.ts           # gaze, blink scheduler, breathing
  studio/
    AvatarStudio.tsx
    StudioCanvas.tsx
    StudioControls.tsx
    studioStore.ts                   # draft only; undo/redo via JSON patches
  render/
    AvatarCanvas.tsx
    AvatarThumbnail.tsx             # CDN image with robust fallback
    qualityTier.ts
    lightingPresets.ts
  schema/
    avatarRecipe.schema.ts           # Zod schema and exported types
    assetManifest.schema.ts
  tests/
    recipeCompatibility.test.ts
    recipeMigration.test.ts
    assetContract.test.ts

public/avatar-assets/               # development-only mirror; production uses CDN
  manifests/v1.json
  characters/base/v1/base.glb
  modules/{hair,eyebrows,beards,glasses,accessories,outfits}/...
  animations/v1/{idle,thinking,wave,happy}.glb
  env/studio-neutral_1k.hdr
tools/avatar-pipeline/
  validate-gltf.mjs
  build-manifest.mjs
  optimize-gltf.mjs
  render-thumbnail.mjs
docs/avatar-platform-architecture.md
```

`src/components/profile/InitialAvatar.jsx` becomes a narrow compatibility wrapper around `AvatarThumbnail`. It may accept legacy `avatarConfig` during migration but must not generate a new visual identity from a username after the rollout window.

## 5. Character and asset contract

### Base character

Ship one stylized neutral base body at launch, with two silhouette variants only if they share the identical skeleton, material slots, UV layout, and face blend-shape contract. Do not model gender as a gate for items; use body/silhouette compatibility tags.

The base GLB contains:

- A single `MKA_Humanoid_v1` skeleton, normalized to 1.72 m, Y-up, Z-forward, unit scale.
- Skinned head/body meshes with LOD0 and LOD1, PBR materials, UV0, tangent data only where a normal map requires it.
- Named facial blend shapes: `eyeBlink_L/R`, `browInnerUp_L/R`, `browDown_L/R`, `eyeSquint_L/R`, `jawOpen`, `mouthSmile_L/R`, `mouthFrown_L/R`, `mouthPucker`, `mouthWide`, `cheekPuff`, `noseSneer_L/R`.
- Attachment anchors/bones: `head`, `head_top`, `left_eye`, `right_eye`, `nose_bridge`, `left_ear`, `right_ear`, `chest`, `spine_03`, `left_wrist`, `right_wrist`.
- Material slots: `M_Skin`, `M_EyeWhite`, `M_Iris`, `M_Teeth`, `M_Tongue`, `M_BodyBase`.

The face topology, skeleton hierarchy, blend-shape names, and material slots are immutable within major rig version `v1`. This is the compatibility contract every content artist validates against.

### Modules

| Module | Implementation | Contract |
| --- | --- | --- |
| Face | Base-head morph targets; optional authored face texture decals. | No swap mesh for basic face shape. Recipe stores bounded morph values. |
| Eyes | Iris/pupil material variants plus eyelash meshes; facial shape remains on base mesh. | Eye blend shapes remain on base head. |
| Brows, beard, hair | Skinned meshes or bone-bound meshes authored to the base rig. | Include a coverage mask and compatible head/silhouette tags. |
| Nose, mouth | Blend-shape presets and decals, not independent objects. | Presets map to a finite set of named morph weights. |
| Glasses/accessories | Rigid nodes attached to named anchors; earrings and headphones may be skinned. | Explicit anchor, collision/coverage metadata, and category exclusivity. |
| Outfit | Full skinned garment meshes, with occlusion masks for hidden base-body regions. | Same skeleton and skin weights; declares body/silhouette compatibility. |
| Pose/emote | Animation clips referencing the v1 rig and facial morph tracks. | Clips use a common root motion policy: in-place for studio and thumbnails. |

Each module has an asset descriptor: `id`, `version`, `category`, `glb`, `thumbnail`, `rigVersion`, `compatibleBodies`, `anchors`, `coverage`, `materialParameters`, `lods`, `bounds`, `contentStatus`, and `sha256`. The generated manifest is the only asset lookup surface used by clients.

### Art and export rules

- Author in Blender or Maya; export glTF 2.0 binary (`.glb`) with embedded textures only for local review, then externalize/CDN-pack for production.
- Use stylized PBR deliberately: soft roughness variation, restrained normal maps, no photoreal pores, no real-person scans.
- Maintain one UV convention and one texture density target per LOD. Hair uses mesh cards/clumps, not runtime particles.
- Name nodes, bones, morphs, and materials exactly to the contract. Missing/unknown bindings fail CI.
- Optimize each release with `gltf-transform`: prune, dedup, weld where safe, Meshopt geometry compression, KTX2/BasisU textures, and generated LODs. Use Draco only when device testing proves a better end-to-end tradeoff.

## 6. Runtime and rendering

Use the existing React stack with these libraries:

- `three`, `@react-three/fiber`, and `@react-three/drei` for declarative WebGL rendering, GLTF loading, controls, and environment setup.
- `three-stdlib` for `GLTFLoader`, `KTX2Loader`, `MeshoptDecoder`, and `SkeletonUtils` where a clone is needed.
- `zustand` for ephemeral studio draft/UI state; `zod` for all recipe and manifest validation.
- `@gltf-transform/core`, `@gltf-transform/functions`, and `@gltf-transform/extensions` as build-time asset tooling.
- `meshoptimizer` and `draco3dgltf` as asset-pipeline codecs; `sharp` for 2D content thumbnails in CI. Use Playwright plus a controlled WebGL render route for canonical 3D thumbnails if desired.

`AvatarCanvas` is the only interactive renderer. It must use a single `<Canvas>` per studio surface, `frameloop="demand"` outside active animation, and a shared loader/cache. The composer clones a loaded base scene with `SkeletonUtils.clone`, resolves modules from the manifest, attaches them, applies materials/morphs, then registers an `AnimationMixer`.

Studio lighting is a neutral 1K HDR environment, one warm area key, soft fill, and rim; use ACES filmic tone mapping and sRGB output. It is a product preset, not user-editable lighting. Use bounded `OrbitControls`: full yaw, -20° to +20° pitch, 0.8–1.3 zoom range, reset action, touch pinch, and no uncontrolled auto-spin while the user manipulates the model.

## 7. Animation system

The mixer has three layers:

1. **Base layer:** looping `idle` clip (body weight 1.0).
2. **Additive life layer:** breathing, gaze, and scheduled blinks. Blinks drive eye morph targets; gaze drives eye/head bones. These never require separate geometry.
3. **Gesture/emote layer:** `thinking`, `lookAround`, `wave`, `happy`, and `smile`; cross-faded over idle and masked to the affected upper-body/facial bones when appropriate.

State graph:

```text
Idle <--> Thinking
  |  \       |
  |   \      +--> Idle
  |    +--> LookAround --> Idle
  +--> Wave -----------> Idle
  +--> Happy ----------> Idle
  +--> Smile ----------> Idle
```

Transitions are event-driven with explicit duration and interruption rules: `wave`/`happy` may interrupt `idle`; `thinking` is low priority; `blink` is additive and never interrupted. Define clip metadata with `loop`, `fadeInMs`, `fadeOutMs`, `cooldownMs`, `priority`, `boneMask`, and `facialPreset`. Random idle variation occurs on a seeded timer to avoid synchronized-looking feed avatars.

## 8. Customization, state, and persistence

The studio keeps a `draft` recipe and an immutable `saved` recipe. Every user action is a semantic command (`setModule`, `setColor`, `setMorph`, `setPose`) recorded as JSON Patch for undo/redo. The composer never accepts arbitrary user URLs or uncontrolled GLB data.

Canonical recipe, stored server-side (illustrative TypeScript):

```ts
type AvatarRecipeV1 = {
  schemaVersion: 1;
  avatarId: string;
  rigVersion: 'mka-humanoid-v1';
  manifestVersion: '2026.09';
  base: { bodyId: 'base-neutral-01'; skinTone: string };
  face: { presetId: string; morphs: Record<string, number>; eyeColor: string; browColor: string };
  modules: {
    hair?: { assetId: string; color: string };
    brows?: { assetId: string; color: string };
    beard?: { assetId: string; color: string };
    glasses?: { assetId: string; color?: string };
    accessory?: { assetId: string; color?: string };
    outfit: { assetId: string; palette: Record<string, string> };
  };
  presentation: { poseId: string; backgroundId: string };
  revision: number;
  updatedAt: string;
};
```

Persist a separate public projection, `AvatarRef`: `{ avatarId, revision, thumbnailUrl, thumbnailEtag, manifestVersion }`. Posts, comments, chats, and profile summaries reference this small object rather than copying the full recipe. This allows the platform to render a CDN thumbnail in dense surfaces and fetch/resolve the recipe only in the studio or an enlarged profile card.

Server write rules: validate against the pinned manifest; reject unavailable, retired, incompatible, or duplicate-exclusive modules; clamp morph values; assign `revision`; enqueue thumbnail generation; atomically publish the new `AvatarRef`. The local mock service may emulate this contract, but must not be treated as the production authority.

## 9. Performance and mobile budgets

Use an image-first strategy outside the studio. A feed row must receive an avatar thumbnail (`WebP`/`AVIF`) with an SVG/initial fallback; never mount dozens of WebGL canvases in a feed or chat list.

| Surface | Rendering mode | Target budget |
| --- | --- | --- |
| Feed/comment/chat/list | CDN thumbnail | 8–32 KB typical, no WebGL |
| Profile hero | thumbnail by default; one lazy 3D canvas on user action | one active canvas |
| Avatar Studio desktop | LOD0 plus selected modules | <= 70k triangles, <= 4 1K texture equivalents, <= 6 draw calls after merge where safe |
| Avatar Studio mobile | LOD1, 1× DPR cap, no screen-space effects | <= 35k triangles, <= 2 1K texture equivalents, <= 4 draw calls |

Additional rules: limit DPR to 1.5 desktop/1 mobile, cache decoded GLTFs, lazy-load the studio route, use `ResizeObserver`, pause mixer/rendering when hidden, dispose renderer resources after unmount, use KTX2 capability detection with PNG/WebP fallback, and show a static thumbnail if WebGL is unavailable or context is lost. Test low-memory Android and iPhone Safari explicitly; do not infer mobile quality from desktop Chrome.

## 10. Security, privacy, and content operations

Anonymous does not mean ungoverned. User-selected recipe IDs and palette values are safe, bounded data; never store or render remote arbitrary GLBs. Assets are first-party, immutable, hashed, CDN-hosted, and reviewed. Signed thumbnail URLs must not reveal email, name, or internal user identifiers. Do not derive visible avatar traits from registration identity, username, or demographic information; randomization should be locally fair across the curated catalogue and user-controlled before save.

Asset publication follows: art review -> technical validation -> visual QA matrix -> manifest publish -> staged availability flag. Retiring an item must retain an alias/fallback mapping so existing recipes continue to resolve. Instrument studio open, first meaningful render, asset failure, save success, save validation failure, and thumbnail availability, using anonymous analytics identifiers only.

## 11. Migration and rollout

1. **Freeze the old renderer.** No more primitive options or procedural geometry changes. Keep it only behind the legacy compatibility path.
2. **Create the rig and asset contract.** Produce a vertical slice: one base, 5 hair assets, 3 outfits, 2 eyewear assets, six facial presets, and all required animation clips. Validate all exports automatically.
3. **Build composer and studio behind a feature flag.** Use a stubbed recipe API while the back end is implemented. Run device performance and visual QA before exposing it.
4. **Introduce `AvatarRef` and thumbnail generation.** Update only the `InitialAvatar` implementation so existing product surfaces display the new thumbnail without changing their behavior.
5. **Migrate legacy configurations.** Map meaningful existing fields to the nearest supported recipe values. For unrepresentable legacy values, choose a curated default and mark `migratedFrom: 'legacy-v0'`. Do not use username-derived avatar generation for newly saved identity.
6. **Limited beta and observability.** Roll out by feature flag, monitor render/save/thumbnail error rates and mobile frame time, then expand the catalogue.
7. **Delete the prototype renderer.** Remove `ThreeAvatarViewer` primitive assembly, `LayeredAvatar` as a second visual system, arbitrary `rpmAvatarUrl`, and the demo RPM iframe only after all active legacy configs resolve to thumbnail-backed `AvatarRef`s.

## 12. Production acceptance criteria

- No avatar character geometry is created with Three.js primitive geometry APIs at runtime.
- Every production avatar resolves from a versioned recipe and manifest into rigged GLB assets with `mka-humanoid-v1` compatibility.
- The studio supports rotation, zoom, idle, breathing, blink, subtle head motion, smile, thinking, looking around, wave, and happy through mixer/blend-shape animation.
- Feed, comments, messages, and profile continue to show an avatar through the existing shared display seam, without new WebGL canvases in lists.
- Every recipe is schema-validated and asset-compatible; legacy recipes migrate deterministically.
- Studio meets the mobile and desktop budgets above on the defined test devices, with a static fallback when WebGL is unavailable.
- New modules, reactions, stickers, status indicators, achievements, profile cards, onboarding poses, and comment animations are added as manifest assets and recipe/presentation extensions—not renderer rewrites.
