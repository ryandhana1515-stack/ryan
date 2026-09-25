// One item per photograph to generate (Higgsfield first; failures fall over to Kling).
const c = $('Build Config').first().json;
return c.shots.map((s) => ({ json: { idx: s.idx, key: s.key, prompt: s.prompt, aspect_ratio: s.aspect_ratio, resolution: c.config.image_resolution, provider: 'higgsfield' } }));
