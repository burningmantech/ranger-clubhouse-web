import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import Service from '@ember/service';

const sessionStub = Service.extend({
  user: { hasRole() { return true} }, // eslint-disable-line ember/avoid-leaking-state-in-ember-objects
});

module('Integration | Component | intake-notes', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', sessionStub);
  });

  test('it renders', async function (assert) {
    this.setProperties({
      person: {
        rrn_team: [{
          year: 2020,
          notes: [{note: 'A note', created_at: '2020-01-01 12:34:56', person_source: {id: 9999, callsign: 'Bucket'}}]
        }]
      },
      year: 2020,
      noteSubmitted() { }
    });
    await render(hbs`<IntakeNotes @type="rrn" @person={{this.person}} @viewYear={{this.year}} @onSubmit={{this.noteSubmitted}} />`);
    assert.dom('button').hasText('Add RRN note / rank');
  });
});
