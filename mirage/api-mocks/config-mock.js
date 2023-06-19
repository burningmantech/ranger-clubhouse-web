
export default function configMock(server) {
  server.get('/api/config', function () {
    return {
      AdminEmail: 'rangers-tech-ninjas@burningman.org',
      AuditorRegistrationDisabled: false,
      EditorUrl: 'https://example.com/editor',
      HQWindowInterfaceEnabled: true,
      GeneralSupportEmail: 'rangers@burningman.org',
      JoiningRangerSpecialTeamsUrl: 'https://example.com/special-teams',
      LoginManageOnPlayaEnabled: true,
      MealDates: 'Thanksgiving',
      MealInfoAvailable: true,
      MentorEmail: 'ranger-mentors@burningman.org',
      MotorpoolPolicyEnable: true,
      PersonnelEmail: 'ranger-personnel@burningman.org',
      RadioCheckoutAgreementEnabled: true,
      RangerFeedbackFormUrl: 'https://example.com/feedback',
      RangerManualUrl: 'https://example.com/ranger-manual',
      RangerPoliciesUrl: 'https://example.com/policy-folder',
      RpTicketThreshold: 19,
      ScTicketThreshold: 38,
      TrainingAcademyEmail: 'ranger-training-academy@burningman.org',
      VcEmail: 'ranger-vc@burningman.org',
    };
  });
}
