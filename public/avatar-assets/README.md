# Man Ki Aavaj production character assets

This directory is intentionally a deployment target, not a source for procedural geometry.

Place the validated, authored character asset at:

`characters/base/v1/base-neutral-01.glb`

The asset must conform to `mka-humanoid-v1`, including the skeleton, material slots, and facial blend-shape contract specified in `docs/avatar-platform-architecture.md`. Publish optimized GLB/KTX2 assets and thumbnails through the asset pipeline; do not substitute an arbitrary downloaded model or a runtime-created primitive mesh.
