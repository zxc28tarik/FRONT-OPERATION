# V146 geometry LOD

Near geometry is identical to V145. At far distance the ten sculpted body meshes use a cached lower-resolution folded profile, switching back with existing distance hysteresis. Across 10 representative models, near triangles 335876, far triangles 217276 (V145 far: 281516). These are geometry counts, not measured FPS. Real Three.js tests confirm restoration and cached mesh geometry. No changes to AI or gameplay.
