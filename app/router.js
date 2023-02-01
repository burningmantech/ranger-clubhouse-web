import EmberRouter from '@ember/routing/router';
import config from 'clubhouse/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('debug');

  this.route('login');
  this.route('reset-password');
  this.route('register');
  // this.route('sso'); -- uncomment if will SSO is ever implemented

  this.route('me', function () {
    this.route('homepage', {path: '/'});

    this.route('agreements', function () {
      this.route('index', {path: '/'});
      this.route('sign', {path: '/:tag'});
    });

    this.route('alerts');
    this.route('announcements');
    this.route('awards');
    this.route('contact');
    this.route('emergency-contact');
    this.route('event-info');
    this.route('mentees');
    this.route('mentors');
    this.route('messages');
    this.route('motorpool-policy');
    this.route('password');
    this.route('personal-info');
    this.route('radio-checkout');
    this.route('schedule', function () {
      this.route('index', {path: '/'});
    });
    this.route('survey');
    this.route('tickets');
    this.route('timesheet');
    this.route('trainer-feedback', function () {
      this.route('index', {path: '/'});
      this.route('view', {path: '/:year'});
    });
    this.route('vehicles');
    this.route('welcome');
    this.route('work-history');
  });

  this.route('search', function () {
    this.route('assets');
    this.route('languages');
    this.route('vehicles');
  });

  this.route('admin', function () {
    this.route('action-log');
    this.route('alerts');
    this.route('assets');
    this.route('awards');
    this.route('bulk-grant-awards');
    this.route('bulk-lookup');
    this.route('bulk-positions');
    this.route('bulk-sign-in-out');
    this.route('bulk-signout');
    this.route('bulk-upload');
    this.route('certifications');
    this.route('clubhouse1-log');
    this.route('credits');
    this.route('documents');
    this.route('error-log');
    this.route('event-dates');
    this.route('handle-reservations');
    this.route('help');
    this.route('hours-credits');
    this.route('mail-log');
    this.route('maintenance');
    this.route('motd');

    this.route('online-training', function () {
      this.route('index', {path: '/'});
      this.route('courses');
      this.route('enrollment');
    });

    this.route('people-by-status-change');
    this.route('positions');
    this.route('radio-eligibility');
    this.route('ranger-retention');

    this.route('rbs', function () {
      this.route('broadcast');
      this.route('broadcast-log');
      this.route('message-log');
      this.route('unknown-phones');
      this.route('stats');
      this.route('unverified-stopped');
    });

    this.route('roles');
    this.route('salesforce');
    this.route('settings');
    this.route('slots');

    this.route('survey', function () {
      this.route('index', {path: '/'});
      this.route('manage', {path: '/:survey_id'});
      this.route('preview', {path: '/:survey_id/preview'});
    });
    this.route('swag');
    this.route('teams');
    this.route('thank-you-cards');
    this.route('timesheet-sanity-checker');
    this.route('timesheet-slot-repair');
    this.route('top-hour-earners');

  });

  this.route('hq', {path: '/hq/:person_id'}, function () {
    this.route('index', {path: '/'});
    this.route('assets');
    this.route('messages');
    this.route('schedule');
    this.route('shift');
    this.route('site-checkin');
    this.route('timesheet');
    this.route('training-info');
  });


  this.route('mentor', function () {
    this.route('acceptance-sheets');
    this.route('alpha-signout');
    this.route('alpha-status');
    this.route('assignment');
    this.route('convert-alphas');
    this.route('convert-prospectives');
    this.route('post-season-summary');
    this.route('potentials');
    this.route('schedule');
  });


  this.route('person', {path: '/person/:person_id'}, function () {
    this.route('index', {path: '/'});
    this.route('alerts');
    this.route('assets');
    this.route('awards-swag');
    this.route('bmid');
    this.route('broadcast-log');
    this.route('dashboard');
    this.route('emergency-contact');
    this.route('event-info');
    this.route('external-ids');
    this.route('mail-log');
    this.route('membership');
    this.route('mentors');
    this.route('messages');
    this.route('password');
    this.route('personal-info');
    this.route('photos');
    this.route('pogs');
    this.route('schedule');
    this.route('status-history');
    this.route('tickets');
    this.route('tickets-provisions');
    this.route('timesheet');
    this.route('timesheet-log');
    this.route('unified-flagging');
    this.route('work-history');
  });

  this.route('logout');

  this.route('training', {path: '/training/:position_id'}, function () {
    this.route('index', {path: '/'});
    this.route('capacity');
    this.route('multiple-enrollments');
    this.route('people-training-completed');
    this.route('session', {path: '/session/:slot_id'}, function () {
      this.route('index', {path: '/'});
      this.route('signup-sheet');
      this.route('trainers-report');
    });
    this.route('survey', function () {
      this.route('report', {path: '/:survey_id'});
    });
    this.route('trainer-attendance');
    this.route('unified-flagging');
    this.route('untrained-people');
  });

  this.route('reports', function () {
    this.route('alpha-shirts');
    this.route('asset-history');
    this.route('assets-outstanding');
    this.route('certifications');
    this.route('event-stats');
    this.route('flakes');
    this.route('freaking-years');
    this.route('hq-forecast');
    this.route('languages');
    this.route('on-duty');
    this.route('people-by-clubhouse-teams');
    this.route('people-by-location');
    this.route('people-by-position');
    this.route('special-teams');
    this.route('people-by-role');
    this.route('people-by-status');
    this.route('position-sanity-checker');
    this.route('potential-shirts');
    this.route('potential-swag');
    this.route('radio-assets');
    this.route('radio-checkout');
    this.route('rollcall');
    this.route('sandman-qualified');
    this.route('schedule-by-callsign');
    this.route('schedule-by-position');
    this.route('shift-coverage');
    this.route('shift-lead');
    this.route('shift-signups');
    this.route('timesheet-by-callsign');
    this.route('timesheet-by-position');
    this.route('timesheet-correction-requests');
    this.route('timesheet-totals');
    this.route('timesheet-unconfirmed');
    this.route('vehicle-paperwork');
    this.route('vehicle-registry');
    this.route('swag-distribution');
  });

  this.route('vc', function () {
    this.route('access-documents', function () {
      this.route('index', {path: '/'});
      this.route('expiring');
      this.route('trs');
      this.route('statistics');
      this.route('waps');
      this.route('unclaimed-with-signups');
      this.route('claimed-with-no-signups');
      this.route('unsubmit-provisions');
      this.route('special-tickets');
    });
    this.route('bmid');
    this.route('bmid-print');
    this.route('bmid-sanity-check');
    this.route('handle-checker');
    this.route('photo-review');
    this.route('photos');
    this.route('shiny-penny-report');
    this.route('spigot');
    this.route('unified-flagging');
  });

  // Catch all for unrecognized urls
  this.route('not-found', {path: '/*path'});
});
