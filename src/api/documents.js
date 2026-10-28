import { addDocumentMock, deleteDocumentMock, getDocumentsMock, updateDocumentMock } from '../mocks/documents';
const wait=()=>new Promise((resolve)=>window.setTimeout(resolve,400));const mode=()=>new URLSearchParams(window.location.search).get('mock');
export async function getDocuments(patientId){await wait();if(mode()==='error')throw new Error('Unable to load documents.');if(mode()==='empty')return [];return getDocumentsMock(patientId);}
export async function addDocument(patientId,document){await wait();if(mode()==='error')throw new Error('Could not upload document.');return addDocumentMock(patientId,document);}
export async function updateDocument(patientId,id,patch){await wait();if(mode()==='error')throw new Error('Could not update document.');return updateDocumentMock(patientId,id,patch);}
export async function deleteDocument(patientId,id){await wait();if(mode()==='error')throw new Error('Could not delete document.');return deleteDocumentMock(patientId,id);}
