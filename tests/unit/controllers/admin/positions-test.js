import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';
import EmberObject from '@ember/object';

module('Unit | Controller | admin/positions', function (hooks) {
  setupTest(hooks);

  const positions = [
    EmberObject.create({id: 1, title: 'A', type: 'A Type'}),
    EmberObject.create({id: 2, title: 'B', type: 'A Type'}),
    EmberObject.create({id: 3, title: 'C', type: 'Training'}),
    EmberObject.create({id: 4, title: 'D', type: 'Training'}),
  ];

  test('viewPositions works', function (assert) {
    let controller = this.owner.lookup('controller:admin/positions');

    controller.set('positions', positions)
    controller.set('typeFilter', 'All');
    controller.set('activeFtiler', 'all');


    let view = controller.viewPositions;
    assert.equal(view.length, 4, 'All positions shown');

    controller.set('typeFilter', 'A Type');
    view = controller.viewPositions;
    assert.equal(view.length, 2, 'Only A Type shown');
    assert.equal(view[0].id, 1);
    assert.equal(view[1].id, 2);
  });
});
