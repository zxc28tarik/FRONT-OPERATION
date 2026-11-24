# V102–V105 — Character production

- V102: role-specific helmet and kit silhouette layers; both teams retain their original identification colors.
- V103: visual-only gait, directional stepping and smooth crouched/idle leg transitions.
- V104: shared indexed material batches inside the existing animated pivots. Original detail meshes: 860; merged detail batches: 270 across 10 role/team combinations. Full enhanced model mesh counts: 1274; equivalent without batching: 1864.
- V105: five independently shaped helmet meshes and role-specific carrier fits.

Actual Three.js r128 geometry tests passed for all 10 classes/teams (finite vertex and normal arrays, outward lathe normals, index bounds, shared batches and intact pivots). Structural soldier and gait tests passed. Real WebGL render and full game frame rate require browser acceptance; that workflow is enabled for this branch. Base V25 factory, gameplay colliders, damage, weapons, and bot AI are unchanged.
