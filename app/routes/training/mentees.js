import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import { tracked } from '@glimmer/tracking';

class MenteePerson {
  @tracked positionsRevoked;

  constructor(person) {
    Object.assign(this, person);
  }
}

export default class TrainingMenteesRoute extends ClubhouseRoute {
  model() {
    const training = this.modelFor('training');

    return this.ajax.request(`training/${training.id}/mentees`);
  }

  setupController(controller, {people,positions}) {
    controller.training = this.modelFor('training');
    controller.people = people.map((p) => new MenteePerson(p));
    controller.positions = positions;
    controller.people.forEach((person) => {
      person.positions = positions.map(position => person.positions.find(p => p.id === position.id))
    });
  }
}
