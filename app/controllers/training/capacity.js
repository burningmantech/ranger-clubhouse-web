import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';

export default class TrainingCapacityController extends ClubhouseController {
  queryParams = [ 'year' ];

  get notCurrentYear() {
    return (this.year != this.house.currentYear());
  }

  get totalFullPercentage() {
    const slots = this.slots;
    const signups = slots.reduce((total, slot) => slot.signed_up + total, 0);
    const seats = slots.reduce((total, slot) => slot.max + total, 0);

    return Math.round((signups  / seats) * 100);
  }
}
