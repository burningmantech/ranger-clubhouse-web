import {discoverEmberDataModels, applyEmberDataSerializers} from "ember-cli-mirage";
import {Response, createServer} from 'miragejs';
import dayjs from 'dayjs';
import scheduleMock from './api-mocks/schedule-mock';

function now() {
  return dayjs().format('YYYY-MM-DD hh:mm:ss');
}

function getJsonFromParams(params) {
  const result = {};
  params.split("&").forEach(part => {
    const item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

function routes() {
  this.urlPrefix = 'http://localhost:8000';

  scheduleMock(this);

  this.get('/api/config', function () {
    return {
      AdminEmail: 'rangers-tech-ninjas@burningman.org',
      AuditorRegistrationDisabled: false,
      EditorUrl: 'https://example.com/editor',
      HQWindowInterfaceEnabled: true,
      GeneralSupportEmail: 'rangers@burningman.org',
      JoiningRangerSpecialTeamsUrl: 'https://example.com/special-teams',
      EventManageOnPlayaEnabled: true,
      MealDates: 'Thanksgiving',
      MealInfoAvailable: true,
      MentorEmail: 'ranger-mentors@burningman.org',
      MotorpoolPolicyEnable: true,
      PersonnelEmail: 'ranger-personnel@burningman.org',
      RadioCheckoutAgreementEnabled: true,
      RangerFeedbackFormUrl: 'https://example.com/feedback',
      RangerManualUrl: 'https://example.com/ranger-manual',
      RangerPoliciesUrl: 'https://example.com/policy-folder',
      SpTicketThreshold: 19,
      ScTicketThreshold: 38,
      TrainingAcademyEmail: 'ranger-training-academy@burningman.org',
      VcEmail: 'ranger-vc@burningman.org',
    };
  });

  this.post('/api/auth/oauth2/temp-token', function (schema, request) {
    let params = getJsonFromParams(request.requestBody);
    if (!params.token) {
      return new Response(422, {'Content-Type': 'application/json'}, {
        errors: [{
          status: 422,
          title: 'temp token is missing '
        }]
      });
    }

    const person = schema.db.people.findBy({tpassword: params.token});
    if (!person) {
      return new Response(401, {'Content-Type': 'application/json'}, {status: 'invalid-token'});
    }

    return {
      // ember-simple-auth only cares about the middle value
      access_token: `deadbeef`,
      token_type: 'bearer',
      expires_in: 1000,
      person_id: person.id
    };
  });

  this.post('/api/auth/oauth2/token', function (schema, request) {
    const params = getJsonFromParams(request.requestBody);

    if (!params.username || !params.password) {
      const errors = [];
      if (!params.username) {
        errors.push({status: 422, title: 'Username cannot be blank'});
      }

      if (!params.password) {
        errors.push({status: 422, title: 'Password cannot be blank'});
      }

      return new Response(422, {'Content-Type': 'application/json'}, {errors});
    }

    const person = schema.db.people.findBy({email: params.username});

    if (!person) {
      return new Response(401, {'Content-Type': 'application/json'}, {error: 'invalid-credentials'});
    }

    if (person.status === 'suspended') {
      return new Response(401, {'Content-Type': 'application/json'}, {error: 'account-disabled'})
    }

    return {
      // ember-simple-auth only cares about the middle value
      access_token: `deadbeef`,
      token_type: 'bearer',
      expires_in: 1000,
      person_id: person.id
    };
  });

  this.post('/api/action-log/record', function () {
    return {};
  });

  this.get('/api/person/:id', ({people}, request) => { // eslint-disable-line no-unused-vars
    const person = people.find(request.params.id);

    if (!person) {
      return new Response(404, {'Content-Type': 'application/json'}, {
        errors: [{status: 404, title: 'Record does not exist.'}]
      });
    }

    return person;
    //return this.serializerOrRegistry.serialize(person, 'person');
  });

  this.put('/api/person/:id', ({people}, request) => {
    const body = JSON.parse(request.requestBody);
    const person = people.find(request.params.id);

    if (!person) {
      return new Response(404, {'Content-Type': 'application/json'}, {
        errors: [{status: 404, title: 'Record does not exist.'}]
      });
    }

    person.update(body.person);

    return person;
  });

  this.get('/api/person/:id/user-info', ({people}, request) => { // eslint-disable-line no-unused-vars
      const person = people.find(request.params.id);
      if (!person) {
        return new Response(404, {'Content-Type': 'application/json'}, {
          errors: [{status: 404, title: 'Record does not exist.'}]
        });
      }

      return {
        user_info: {
          id: person.id,
          callsign: person.callsign,
          callsign_approved: true,
          status: person.status,
          unread_message_count: 2,
          years_combined: [2017, 2018],
          years_seen: [2017, 2018],
          years_as_ranger: [2018],
          years_as_contributor: [2020],
          roles: person.roles,
          teacher: {
            is_trainer: false,
            is_art_trainer: false,
            is_mentor: false,
            have_mentored: false
          }
        }
      }
    }
  )

  this.get('/api/person/:id/unread-message-count', ({people}, request) => { // eslint-disable-line no-unused-vars
    return {unread_message_count: 2};
  });

  this.get('/api/person/:id/teacher', ({people}, request) => { // eslint-disable-line no-unused-vars
    return {
      is_trainer: false,
      is_art_trainer: false,
      is_mentor: false,
      have_mentored: false
    };
  });

  this.get('/api/person/:id/photo', ({people}, request) => { // eslint-disable-line no-unused-vars
    return {
      photo: {
        photo_status: 'approved',
        photo_url: 'http://127.0.0.1/test.jpg',
        upload_enabled: true
      }
    };
  });


  this.get('/api/person/:id/event-info', ({people}, request) => {
    const person = people.find(request.params.id); // eslint-disable-line no-unused-vars

    return {
      event_info: {
        year: (new Date()).getFullYear(),
        trainings: [{
          position_title: 'Training',
          position_id: 13,
          location: 'Trainlandia',
          date: now(),
          status: 'pass'
        }],
        radio_eligible: 1,
        radio_max: 1,
        meals: '',
        showers: '',
        radio_info_available: false,
      }
    };
  });

  this.get('/api/person/:id/credits', ({people}, request) => {
    const person = people.find(request.params.id);

    return {credits: person.credits || 0};
  });

  this.get('/api/person/:id/schedule/summary', ({people}, request) => {
    const person = people.find(request.params.id); // eslint-disable-line no-unused-vars

    return {summary: {}};
  });

  this.get('/api/person/:id/positions', ({positions}) => {
    return positions.all();
  });

  this.get('/api/position', ({positions}) => {
    return positions.all();
  });

  this.get('/api/motd/bulletin', () => {
    return {
      motd: [], meta: {
        total: 0, page: 1, page_size: 100
      }
    };
  });

  this.get('/api/person/:id/milestones', () => {
    return {
      milestones: {
        training: {status: 'pass'},
        alpha_shift: {status: 'pass'},
        online_course_passed: true,
        behavioral_agreement: true,
        has_reviewed_pi: true,
        photo_upload_enabled: true,
        art_trainings: [],
        shift_signups: {
          total_duration: 0,
          counted_duration: 0,
          credits: 0.0,
          slot_count: 0
        },
        surveys: {
          sessions: [],
          trainers: []
        },
        photo: {
          image_url: 'http://localhost:99999/photo.jpg',
          profile_url: 'http://localhost:99999/photo.jpg',
          thumbnail_url: 'http://localhost:99999/photo.jpg',
          status: 'approved',
        }
      }
    };
  });

  this.get('/api/person/:id/membership', () => {
    return {
      membership: {
        teams: [],
        positions: []
      }
    }
  });

  this.get('/api/person-event/:id', (_, request) => {
    return {
      person_event: {
        id: request.params.id,
        may_request_stickers: 1,
        org_vehicle_insurance: 1,
        signed_motorpool_agreement: 1,
        signed_personal_vehicle_agreement: 1,
        asset_authorized: 1,
        timesheet_confirmed_at: 1,
        timesheet_confirmed: 1,
        sandman_affidavit: 1,
        pii_finished_at: now(),
        pii_started_at: now(),
      }
    };
  });

  this.get('/api/person-language', () => {
    return {person_language: []};
  });

  this.get('/api/vehicle/:id', () => {
    return {
      vehicle: {
        id: 1,
        vehicle_make: 'ford',
        vehicle_model: 'f-350',
        vehicle_color: 'khaki',
        vehicle_year: 2019,
        person_id: 1,
        person: {callsign: 'hubcap'},
      }
    };
  });

  this.get('/api/document/:id', () => {
    return new Response(404, {'Content-Type': 'application/json'}, {
      errors: [{status: 404, title: 'Record does not exist.'}]
    });
  });

  this.get('/api/document', (_, request) => {
    const tag = request.queryParams.tag;

    if (tag === 'tag-test') {
      return {
        document: {
          id: 1,
          tag: 'tag-test',
          description: 'a description',
          body: 'a body',
          person_create_id: 1,
          person_update_id: 1,
        }
      };
    } else if (tag) {
      return new Response(404, {'Content-Type': 'application/json'}, {
        errors: [{status: 404, title: 'Record does not exist.'}]
      });
    }

    return [];
  });

  this.get('/api/agreements/:id', () => {
    return {agreements: []};
  });

  this.get('/api/role', ({roles}) => {
    return {role: roles};
  });

  this.get('/api/team', () => {
    return {team: []};
  });

  this.get('/api/swag/shirts', () => {
    return {shirts: []};
  });

  this.get('/api/config/dashboard-period', () => {
    return {period: 'before-event'}
  });

  this.get('/api/person-certification', () => {
    return {};
  });

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.3.x/shorthands/
  */
}

export default function (config) {
  let finalConfig = {
    ...config,
    models: {...discoverEmberDataModels(config.store), ...config.models},
    serializers: applyEmberDataSerializers(config.serializers),
    routes,
  };

  return createServer(finalConfig);
}
