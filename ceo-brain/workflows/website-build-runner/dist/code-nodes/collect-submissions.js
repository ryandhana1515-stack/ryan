const jobs = $input.all().map((i) => i.json);
return [{ json: { jobs, submitted: jobs.filter((x) => x.id).length, failed: jobs.filter((x) => !x.id).map((x) => x.key + ':' + x.error) } }];
