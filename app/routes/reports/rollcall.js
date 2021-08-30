import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import _ from 'lodash';
import {ART_CAR_WRANGLER, BURN_PERIMETER, SANDMAN} from 'clubhouse/constants/positions';

export default class ReportsRollcallRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('slot', {data: {for_rollcall: 1}});
  }

  setupController(controller, model) {
    const positions = _.sortBy(_.map(_.groupBy(model.slot, 'position_id'), (slots) => {
      const position = slots[0].position;

      return {
        id: position.id,
        title: position.title,
        slots
      };
    }), 'title');

    controller.set('positions', positions);
    controller.set('people', null);
    controller.set('isSignOut', false);
    controller.set('askForInOrOut', true);

    const options = positions.map((p) => [p.title, p.id]);
    const burnPositions = [];
    [SANDMAN, BURN_PERIMETER, ART_CAR_WRANGLER].forEach((burnPosition) => {
      const found = options.find((p) => p[1] == burnPosition);
      if (found) {
        burnPositions.unshift(found);
        options.removeObject(found);
      }
    });
    //burnPositions.unshift([ 'Select Position', 0])

    controller.set('positionOptions', [
      [ 'Select Position', 0],
      {
        groupName: 'Burn Positions',
        options: burnPositions
      },
      {
        groupName: 'Everything Else',
        options
      }
    ]);

    controller.set('positionId', 0);
  }
}
