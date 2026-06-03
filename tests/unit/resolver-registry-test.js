import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

/*
 * Registry-driven existence tests.
 *
 * This single file replaces the ~250 auto-generated "it exists" stubs that
 * formerly lived one-per-file under unit/{controllers,routes,services,models}.
 * Each of those stubs only asserted that the container could resolve the
 * factory — and the route/controller ones were `skip`'d, so they asserted
 * nothing at all.
 *
 * Here we enumerate the AMD module registry and assert every app module of
 * each type actually resolves, as an isolated (named) test so a single broken
 * factory is reported precisely instead of failing a shared assertion. Add a
 * real behavioral test in a dedicated file when a module grows behavior worth
 * pinning down.
 */

/* global requirejs */

// App modules look like `clubhouse/<type>/<name>`; their `-test` counterparts
// and the addon/loader internals are filtered out.
function registryNames(type) {
  const prefix = `clubhouse/${type}/`;
  return Object.keys(requirejs.entries)
    .filter((name) => name.startsWith(prefix) && !name.endsWith('-test'))
    .map((name) => name.slice(prefix.length))
    .sort();
}

module('Unit | Registry | controllers resolve', function (hooks) {
  setupTest(hooks);

  registryNames('controllers').forEach((name) => {
    test(`controller:${name}`, function (assert) {
      assert.ok(this.owner.lookup(`controller:${name}`), `controller:${name} resolves`);
    });
  });
});

module('Unit | Registry | routes resolve', function (hooks) {
  setupTest(hooks);

  registryNames('routes').forEach((name) => {
    test(`route:${name}`, function (assert) {
      assert.ok(this.owner.lookup(`route:${name}`), `route:${name} resolves`);
    });
  });
});

module('Unit | Registry | services resolve', function (hooks) {
  setupTest(hooks);

  registryNames('services').forEach((name) => {
    test(`service:${name}`, function (assert) {
      assert.ok(this.owner.lookup(`service:${name}`), `service:${name} resolves`);
    });
  });
});

module('Unit | Registry | models resolve', function (hooks) {
  setupTest(hooks);

  registryNames('models').forEach((name) => {
    test(`model:${name}`, function (assert) {
      const store = this.owner.lookup('service:store');
      assert.ok(store.modelFor(name), `model:${name} resolves`);
    });
  });
});
