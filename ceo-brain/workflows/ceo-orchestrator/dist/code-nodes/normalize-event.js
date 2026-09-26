// Which trigger fired? A webhook item carries headers+body; the schedule item does not.
const inp = ($input.first() && $input.first().json) || {};
const isEvent = inp.headers !== undefined && inp.body !== undefined;
const body = (isEvent && inp.body && typeof inp.body === 'object') ? inp.body : {};
return [{ json: { mode: isEvent ? 'event' : 'tick', body, received_at: new Date().toISOString() } }];
