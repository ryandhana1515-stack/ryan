// Final Lovable message: the Website Builder's cinematic brief + the photography generated for this customer.
const c = $('Build Config').first().json;
const im = $('Collect Images').first().json || { image_list: [] };
const roles = { hero: 'HERO — full-bleed hero background with a cinematic gradient overlay and the headline over it', section: 'SECTION — full-width image opening the first major section (parallax)', detail: 'DETAIL — split section or feature card image' };
let prompt = c.build_prompt;
if (im.image_list && im.image_list.length) {
  prompt += '\n\nPhotography generated for this customer (use as real content, not placeholders; load by URL):\n' + im.image_list.map((x) => '- ' + (roles[x.key] || x.key.toUpperCase()) + ': ' + x.url).join('\n');
  prompt += '\nIf an image fails to load, keep the layout and use a rich brand-tinted gradient with the same mood.';
} else {
  prompt += '\n\nNo photography could be generated in time: use rich, cinematic brand-tinted gradients and large typographic compositions in the hero and section openers (never flat black panels), with clearly labelled image slots for the customer\'s photos.';
}
prompt += '\n\nBuild the complete site now with real copy for ' + (c.business_name || 'the business') + '. Do not ask questions; make sensible assumptions and label placeholders.';
const args = { initial_message: prompt };
if (c.config.lovable_workspace_id) args.workspace_id = c.config.lovable_workspace_id;
return [{ json: { lovable_args: args, lovable_prompt: prompt, image_count: im.image_list ? im.image_list.length : 0 } }];
