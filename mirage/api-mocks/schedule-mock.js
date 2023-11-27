import { Response } from 'miragejs';

const signupPermission = {
  all_signups_allowed: true,
  training_signups_allowed: true,
  requirements: [],
  recommend_burn_weekend_shift: true,

};

const scheduleSummary = {
  pre_event_duration: 0,
  pre_event_credits: 1,
  event_duration: 3600,
  event_credits: 2,
  post_event_duration: 7200,
  post_event_credits: 8640,
  total_duration: 3600,
  total_credits: 10,
  other_duration: 3600,
  counted_duration: 3600,
};

export default function scheduleMock(server) {
  server.get('/api/person/:id/schedule', function (schema, request) {
    const person = schema.people.find(request.params.id);

    if (!person) {
      return Response(404);
    }

    return {
      slots: [],
      positions: [],
      credits_earned: 10.0,
      schedule_summary: scheduleSummary,
      signup_permission: signupPermission
    }
  });

  server.get('/api/person/:id/schedule/permission', ({people}, request) => {
    const person = people.find(request.params.id); // eslint-disable-line no-unused-vars
    if (!person) {
      return Response(404);
    }

    return {permission: signupPermission};
  });
}
