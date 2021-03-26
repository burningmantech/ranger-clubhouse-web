import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class AdminHoursCreditsController extends ClubhouseController {
    queryParams = [ 'year' ];

    @action
    exportToCSV() {
      const COLUMNS = [
        { title: 'Callsign', key: 'callsign' },
        { title: 'Email', key: 'email' },
        { title: 'Full Name', key: 'name' },
        { title: 'Status', key: 'status' },
        { title: `${this.year} Total Hours`, key: 'counted_hours' },
        { title: `${this.year} Total Credits`, key: 'total_credits' },
        { title: 'Pre-Event Hours', key: 'pre_event_hours' },
        { title: 'Pre-Event Credits', key: 'pre_event_credits' },
        { title: 'Event Hours', key: 'event_hours' },
        { title: 'Event Credits', key: 'event_credits' },
        { title: 'Post-Event Hours', key: 'post_event_hours' },
        { title: 'Post-Event Credits', key: 'post_event_credits' },
        { title: 'Years', key: 'years' }
      ];

      const rows = this.people.map((person) => {
        return {
          callsign: person.callsign,
          name: `${person.first_name} ${person.last_name}`,
          status: person.status,
          email: person.email,
          counted_hours: (person.counted_duration / 3600.0).toFixed(2),
          total_credits: person.total_credits.toFixed(2),
          pre_event_hours: (person.pre_event_duration / 3600.0).toFixed(2),
          pre_event_credits: person.pre_event_credits.toFixed(2),
          event_hours: (person.event_duration / 3600.0).toFixed(2),
          event_credits: person.event_credits.toFixed(2),
          post_event_hours: (person.post_event_duration / 3600.0).toFixed(2),
          post_event_credits: person.post_event_credits.toFixed(2),
          years: person.years
        };

      });

      this.house.downloadCsv(`${this.year}-hours-credits.csv`, COLUMNS, rows);
    }
}
