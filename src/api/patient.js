import { getPatientDashboardMock } from '../mocks/patientDashboard';

export function getPatientDashboard(profileId) {
  const params = new URLSearchParams(window.location.search);
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (params.get('mock') === 'error') {
        reject(new Error('We couldn’t load this health profile. Please try again.'));
        return;
      }
      resolve(getPatientDashboardMock(params.get('mock') === 'empty' ? 'empty' : profileId));
    }, 400);
  });
}
