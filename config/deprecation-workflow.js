self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  // Turn off deprecations already addressed in the app yet not fixed by addons.
  workflow: [
    { handler: "silence", matchId: "ember-polyfills.deprecate-assign" },
    { handler: "silence", matchId: "ember-modifier.use-destroyables" },
    { handler: "silence", matchId: "ember-modifier.use-modify" },
    { handler: "silence", matchId: "ember-modifier.no-args-property" },
    { handler: "silence", matchId: "ember-modifier.no-element-property" },
    { handler: "silence", matchId: "ember-bootstrap.subclassing#Tab"}
  ]
};
