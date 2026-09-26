// One item per task the Orchestrator wants to open/reopen (only reached when has_tasks is true).
return $('Orchestrate').first().json.tasks.map((t) => ({ json: t }));
