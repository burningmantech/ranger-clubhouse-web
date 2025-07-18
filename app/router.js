import EmberRouter from '@ember/routing/router';
import config from 'clubhouse/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('debug');

  this.route('login');
  this.route('client', function() {    // Old URLs -- the /client prefix has been dropped.
    this.route('stuff', { path: '/*'} );
  });
  this.route('offline');
  this.route('reset-password');
  this.route('register');
  // this.route('sso'); -- uncomment if will SSO is ever implemented
  this.route('bookmark', { path: '/bookmark/:bookmark_id'});

  this.route('me', function () {
    this.route('homepage', {path: '/'});

    this.route('agreements');

    this.route('alerts');
    this.route('announcements');
    this.route('awards');
    this.route('emergency-contact');
    this.route('event-info');
    this.route('mentees');
    this.route('mentors');
    this.route('messages');
    this.route('password');
    this.route('personal-info');
    this.route('schedule');
    this.route('survey');
    this.route('tickets');
    this.route('timesheet');
    this.route('trainer-feedback', function () {
      this.route('index', {path: '/'});
      this.route('view', {path: '/:year'});
    });
    this.route('vehicles');
    this.route('welcome');
    this.route('oauth2-grant');
    this.route('directory');
    this.route('contact');
  });

  this.route('search', function () {
    this.route('assets');
    this.route('languages');
    this.route('vehicles');
    this.route('people');
  });

  this.route('admin', function () {
    this.route('action-log');
    this.route('alerts');
    this.route('awards');
    this.route('bulk-lookup');
    this.route('bulk-signout');
    this.route('bulk-upload');
    this.route('certifications');
    this.route('clubhouse1-log');
    this.route('documents');
    this.route('error-log');
    this.route('help');
    this.route('hours-credits');
    this.route('mail-log');
    this.route('maintenance');
    this.route('oauth-client');
    this.route('online-course');
    this.route('people-by-permissions');
    this.route('people-by-status');
    this.route('people-by-status-change');
    this.route('person-banners')
    this.route('permissions');
    this.route('person-create');
    this.route('position-sanity-checker');
    this.route('positions');
    this.route('radio-eligibility');
    this.route('ranger-retention');
    this.route('request-log');
    this.route('settings');
    this.route('teams');
    this.route('thank-you-cards');
    this.route('timesheet-slot-repair');
    this.route('timesheet-totals');
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
    this.route('setup-mentor-data');
    this.route('schedule');
    this.route('pod', function () {
      this.route('index', {path: '/'});
      this.route('manage', {path: '/:slot_id'});
    });
    this.route('surveys');
    this.route('survey', { path: '/survey/:survey_id'});
  });

  this.route('person', {path: '/person/:person_id'}, function () {
    this.route('alerts');
    this.route('applications');
    this.route('assets');
    this.route('awards');
    this.route('bmid');
    this.route('broadcast-log');
    this.route('emergency-contact');
    this.route('event-info');
    this.route('index', {path: '/'});
    this.route('mail-log');
    this.route('membership');
    this.route('mentoring');
    this.route('messages');
    this.route('password');
    this.route('personal-info');
    this.route('photos');
    this.route('pogs');
    this.route('schedule');
    this.route('status-history');
    this.route('swag');
    this.route('tickets-provisions');
    this.route('timesheet');
    this.route('unified-flagging');
  });

  this.route('logout');

  this.route('ops', function() {
    this.route('assets');
    this.route('bulk-awards');
    this.route('bulk-positions');
    this.route('bulk-sign-in-out');
    this.route('bulk-teams');
    this.route('credits');
    this.route('cruise-direction');
    this.route('event-dates');
    this.route('motd');
    this.route('rbs', function () {
      this.route('broadcast');
      this.route('broadcast-log');
      this.route('message-log');
      this.route('unknown-phones');
      this.route('stats');
      this.route('unverified-stopped');
    });
    this.route('payroll');
    this.route('rollcall');
    this.route('slots');
    this.route('survey', function () {
      this.route('index', {path: '/'});
      this.route('manage', {path: '/:survey_id'});
      this.route('preview', {path: '/:survey_id/preview'});
    });
    this.route('swag');
    this.route('teams', function() {
      this.route('index', { path: '/'});
      this.route('manage', { path: '/:team_id'});
    });
  });

  this.route('training', {path: '/training/:position_id'}, function () {
    this.route('index', {path: '/'});
    this.route('capacity');
    this.route('mentees');
    this.route('multiple-enrollments');
    this.route('notes');
    this.route('online-course-progress');
    this.route('people-training-completed');
    this.route('resources');
    this.route('session', {path: '/session/:slot_id'}, function () {
      this.route('index', {path: '/'});
      this.route('signup-sheet');
      this.route('trainers-report');
    });
    this.route('survey', function () {
      this.route('report', {path: '/:survey_id'});
    });
    this.route('trained-no-work');
    this.route('trainer-attendance');
    this.route('unified-flagging');
    this.route('untrained-people');
  });

  this.route('reports', function () {
    this.route('alpha-shirts');
    this.route('asset-history');
    this.route('assets-outstanding');
    this.route('certifications');
    this.route('early-arrival');
    this.route('early-late-checkins');
    this.route('event-stats');
    this.route('flakes');
    this.route('forced-signins');
    this.route('freaking-years');
    this.route('hq-forecast');
    this.route('languages');
    this.route('no-shows');
    this.route('on-duty');
    this.route('people-by-clubhouse-teams');
    this.route('people-by-location');
    this.route('people-by-position');
    this.route('potential-shirts');
    this.route('potential-swag');
    this.route('radio-assets');
    this.route('radio-checkout');
    this.route('sandman-qualified');
    this.route('schedule-by-callsign');
    this.route('schedule-by-position');
    this.route('service-years');
    this.route('shift-coverage');
    this.route('shift-drop');
    this.route('shift-lead');
    this.route('shift-signups');
    this.route('special-teams');
    this.route('swag-distribution');
    this.route('timesheet-by-callsign');
    this.route('timesheet-by-position');
    this.route('timesheet-correction-requests');
    this.route('timesheet-correction-stats');
    this.route('timesheet-sanity-checker');
    this.route('timesheet-unconfirmed');
    this.route('vehicle-paperwork');
    this.route('vehicle-registry');
  });

  this.route('vc', function () {
    this.route('access-documents', function () {
      this.route('index', {path: '/'});
      this.route('claimed-with-no-signups');
      this.route('expiring');
      this.route('maintenance');
      this.route('provisions');
      this.route('reports');
      this.route('statistics');
      this.route('trs');
      this.route('unclaimed-with-signups');
      this.route('unsubmit-provisions');
      this.route('waps');
    });
    this.route('applications', function() {
      this.route('index', {path: '/'});
      this.route('record', { path: '/:application_id'});
      this.route('create');
    });

    this.route('bmid');
    this.route('bmid-print');
    this.route('bmid-sanity-check');
    this.route('handle-checker');
    this.route('handle-reservations');
    this.route('maintenance');
    this.route('photo-review');
    this.route('photos');
    this.route('shiny-penny-report');
    this.route('spigot');
    this.route('unified-flagging');
    this.route('application-import');
    this.route('create-prospectives');
  });

  // Catch all for unrecognized urls
  this.route('not-found', {path: '/*path'});
});
