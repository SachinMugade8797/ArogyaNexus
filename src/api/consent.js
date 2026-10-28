import { appendAccessLogMock, changeConsentMock, listAccessLogsMock, listConsentsMock } from '../mocks/consent';
const wait=()=>new Promise((resolve)=>window.setTimeout(resolve,400)); const mode=()=>new URLSearchParams(window.location.search).get('mock');
export async function getConsentData(patientId){await wait();if(mode()==='error')throw new Error('Unable to load consent information.');if(mode()==='empty')return {consents:[],accessLogs:[]};return {consents:listConsentsMock(patientId),accessLogs:listAccessLogsMock(patientId)};}
export async function updateConsent(patientId,id,patch){await wait();if(mode()==='error')throw new Error('Could not update access.');return changeConsentMock(patientId,id,patch);}
export async function logAccess(patientId,event){await wait();if(mode()==='error')throw new Error('Could not save access event.');return appendAccessLogMock(patientId,event);}
