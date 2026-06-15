import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import Service from '@ember/service';
import {makePerson, makeTeamNotes} from 'clubhouse/tests/helpers/factories';
import {spy} from 'clubhouse/tests/helpers/spy';

class ServiceStub extends Service {
  hasRole() {
    return true;
  }
}

module('Integration | Component | intake-notes', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', ServiceStub);
  });

  test('it renders the team note text and the add-note button', async function (assert) {
    this.setProperties({
      person: makePerson({rrn_team: makeTeamNotes({year: 2020})}),
      year: 2020,
      noteSubmitted: spy(),
    });

    await render(hbs`<IntakeNotes @type="rrn"
                                  @person={{this.person}}
                                  @viewYear={{this.year}}
                                  @onSubmit={{this.noteSubmitted}} />`);

    assert.dom('button.note-button').hasText('Add Note / Rank');
    // have_notes is true and the note is not a log, so the note text renders.
    assert.dom('ul.no-indent li').exists();
    assert.dom('ul.no-indent').includesText('A note');
  });
});
