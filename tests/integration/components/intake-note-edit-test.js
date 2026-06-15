import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {makePerson, makeTeamNotes} from 'clubhouse/tests/helpers/factories';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | intake-note-edit', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the modal title, prior notes, and an add-note form', async function (assert) {
    this.setProperties({
      teamNotes: makeTeamNotes({year: 2020, rank: 2}),
      type: 'mentor',
      viewYear: 2020,
      person: makePerson(),
      onSubmit: spy(),
      closeNoteAction: spy(),
      canAddNote: true,
    });

    await render(hbs`<IntakeNoteEdit @teamNotes={{this.teamNotes}}
                                     @type={{this.type}}
                                     @viewYear={{this.viewYear}}
                                     @person={{this.person}}
                                     @onSubmit={{this.onSubmit}}
                                     @closeNoteAction={{this.closeNoteAction}}
                                     @canAddNote={{this.canAddNote}} />`);

    assert.dom('.modal-title').hasText('Add note for Hubcap');
    assert.dom('.modal-body').includesText('Year 2020');
    assert.dom('.modal-body').includesText('A note');
    assert.dom('.modal-body').includesText('by Bucket');
    // With canAddNote true, the ChForm renders its select fields.
    assert.dom('select').exists();
  });
});
