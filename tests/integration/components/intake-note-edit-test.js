import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | intake-note-edit', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {

    this.setProperties({
        teamNotes: [
          {note: 'A note', created_at: '2020-01-01 12:34:56', person_source: {id: 9999, callsign: 'Bucket'}}
        ],
        type: 'mentor',
        viewYear: 2020,
        person: {},
        onSubmit: () => { },
        closeNoteAction: () => { },
        canAddNote: true
      });
    await render(hbs`<IntakeNoteEdit @teamNotes={{this.teamNotes}} @type={{@type}} @viewYear={{@viewYear}} @person={{@person}}
  @onSubmit={{@onSubmit}} @closeNoteAction={{this.closeNoteAction}}
  @canAddNote={{this.canAddNote}}
 />`);

    assert.dom('table').exists();

  });
});
