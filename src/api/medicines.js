import { completeMedicineMock, getMedicinesMock, saveMedicineMock, updateDoseMock, updateReminderMock } from '../mocks/medicines';
const wait=()=>new Promise((resolve)=>window.setTimeout(resolve,400));const mode=()=>new URLSearchParams(window.location.search).get('mock');
export async function getMedicines(patientId){await wait();if(mode()==='error')throw new Error('Unable to load medicines.');if(mode()==='empty')return {active:[],past:[],reminders:[],doseLogs:[]};return getMedicinesMock(patientId);}
export async function saveMedicine(patientId,item){await wait();if(mode()==='error')throw new Error('Could not save medicine.');return saveMedicineMock(patientId,item);}
export async function updateDose(patientId,log){await wait();if(mode()==='error')throw new Error('Could not update dose.');return updateDoseMock(patientId,log);}
export async function updateReminder(patientId,reminder){await wait();if(mode()==='error')throw new Error('Could not update reminder.');return updateReminderMock(patientId,reminder);}
export async function completeMedicine(patientId,id){await wait();if(mode()==='error')throw new Error('Could not complete medicine.');return completeMedicineMock(patientId,id);}
