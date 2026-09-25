// Aggregates one round of polling. done = every job terminal, or the poll budget is spent.
const c = $('Build Config').first().json;
const rows = $input.all().map((i) => i.json);
const polls = ($runIndex || 0) + 1;
const images = {};
const list = [];
let pending = 0;
for (const r of rows) { if (r.url) { images[r.key] = r.url; list.push({ key: r.key, url: r.url }); } else if (!r.done) pending++; }
const done = pending === 0 || polls >= c.config.max_image_polls;
return [{ json: { images, image_list: list, pending, polls, done, image_count: list.length } }];
