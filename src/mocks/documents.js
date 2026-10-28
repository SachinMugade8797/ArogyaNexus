const items={me:[
 {id:'doc-1',patientId:'me',name:'Complete Blood Count.pdf',type:'LAB',tags:['Apollo','Blood test'],sizeBytes:1240000,mimeType:'application/pdf',uploadedAt:'2026-10-24T09:30:00.000Z'},
 {id:'doc-2',patientId:'me',name:'Echocardiogram Report.jpg',type:'SCAN',tags:['Fortis Hospital'],sizeBytes:2860000,mimeType:'image/jpeg',uploadedAt:'2026-10-12T12:10:00.000Z'},
 {id:'doc-3',patientId:'me',name:'Metformin prescription.pdf',type:'PRESCRIPTION',tags:['Dr. Anil Mehta'],sizeBytes:860000,mimeType:'application/pdf',uploadedAt:'2026-10-02T05:25:00.000Z'},
 {id:'doc-4',patientId:'me',name:'Health insurance card.png',type:'INSURANCE',tags:['Star Health'],sizeBytes:920000,mimeType:'image/png',uploadedAt:'2026-09-18T15:00:00.000Z'},
],mother:[],son:[]};
export function getDocumentsMock(patientId){return structuredClone(items[patientId]||[]);}
export function addDocumentMock(patientId,document){items[patientId]||=[];const row={...document,id:`document-${Date.now()}`,patientId};items[patientId].unshift(row);return structuredClone(row);}
export function updateDocumentMock(patientId,id,patch){const row=(items[patientId]||[]).find(x=>x.id===id);if(!row)throw new Error('Document not found.');Object.assign(row,patch);return structuredClone(row);}
export function deleteDocumentMock(patientId,id){items[patientId]=(items[patientId]||[]).filter(x=>x.id!==id);return getDocumentsMock(patientId);}
