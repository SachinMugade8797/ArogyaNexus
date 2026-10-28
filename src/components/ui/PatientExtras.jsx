import { useEffect, useRef, useState } from 'react';
import { Download, FileText, MoreHorizontal, UploadCloud, X } from 'lucide-react';
import { Modal } from './Modal';
import '../../styles/patient-extras.css';

export function Tabs({ items, value, onChange, label = 'Sections' }) { return <div className="patient-extra-tabs" role="tablist" aria-label={label}>{items.map((item)=>{const id=typeof item==='string'?item:item.id;const title=typeof item==='string'?item:item.label;const count=typeof item==='string'?null:item.count;return <button type="button" role="tab" aria-selected={value===id} className={value===id?'selected':''} onClick={()=>onChange(id)} key={id}>{title}{count!=null&&<span>{count}</span>}</button>;})}</div>; }
export function Drawer({ title, onClose, children, className = '' }) {
  const panel = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const focusable = panel.current?.querySelector('button,input,select,[tabindex="0"]');
    focusable?.focus();
    return () => previous?.focus?.();
  }, []);
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && panel.current) {
        const nodes = [...panel.current.querySelectorAll('button,input,select,[tabindex="0"]')].filter((node) => !node.disabled);
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return <div className="patient-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={`patient-drawer ${className}`} role="dialog" aria-modal="true" aria-label={title} ref={panel}><header><h2>{title}</h2><button type="button" aria-label="Close panel" onClick={onClose}><X size={18}/></button></header>{children}</section></div>;
}
export function DataTable({ columns, rows, empty = 'No results found.', rowKey = 'id' }) { return <div className="patient-data-table-wrap"><table className="patient-data-table"><thead><tr>{columns.map((column)=><th scope="col" key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.length?rows.map((row,index)=><tr key={row[rowKey]||index}>{columns.map((column)=><td key={column.key}>{column.render?column.render(row):row[column.key]}</td>)}</tr>):<tr><td colSpan={columns.length} className="patient-table-empty">{empty}</td></tr>}</tbody></table></div>; }
export function TagInput({ value = [], onChange, placeholder = 'Add a tag' }) { const [draft,setDraft]=useState(''); const add=()=>{const tag=draft.trim();if(tag&&!value.includes(tag))onChange([...value,tag]);setDraft('');};return <div className="patient-tag-input">{value.map((tag)=><span key={tag}>{tag}<button type="button" aria-label={`Remove ${tag}`} onClick={()=>onChange(value.filter((x)=>x!==tag))}><X size={12}/></button></span>)}<input value={draft} placeholder={placeholder} onChange={(e)=>setDraft(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===','){e.preventDefault();add();}}} onBlur={add}/></div>; }
export function Toggle({ checked, onChange, label }) { return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={()=>onChange(!checked)} className={`patient-extra-toggle${checked?' on':''}`}><i/></button>; }
export function ProgressRing({ value = 0, label = 'Progress' }) { const radius=25;const circumference=2*Math.PI*radius;return <div className="patient-progress-ring"><svg viewBox="0 0 64 64" role="img" aria-label={`${label}: ${value}%`}><circle cx="32" cy="32" r={radius}/><circle className="value" cx="32" cy="32" r={radius} strokeDasharray={`${circumference}`} strokeDashoffset={`${circumference*(1-Math.max(0,Math.min(100,value))/100)}`}/></svg><span><strong>{value}%</strong><small>{label}</small></span></div>; }
export function Popover({ label = 'More actions', trigger, children }) { return <details className="patient-extra-popover"><summary aria-label={label}>{trigger||<MoreHorizontal size={18}/>}</summary><div>{children}</div></details>; }
export function Dropzone({ onFiles, accept = '.pdf,.jpg,.jpeg,.png', multiple = true, children }) { const input=useRef(null);return <div className="patient-dropzone" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault();onFiles(Array.from(e.dataTransfer.files||[]));}} onClick={()=>input.current?.click()} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.current?.click();}}} role="button" tabIndex="0"><UploadCloud size={23}/><strong>{children||'Drop files here or browse'}</strong><small>PDF, JPG, PNG · up to 10 MB each</small><input ref={input} type="file" accept={accept} multiple={multiple} onChange={(e)=>{onFiles(Array.from(e.target.files||[]));e.target.value='';}}/></div>; }
export function FilePreviewModal({ file, onClose }) { if(!file)return null;const isImage=file.mimeType?.startsWith('image/');return <Modal title={file.name} onClose={onClose} className="patient-file-preview">{isImage&&file.previewUrl?<img src={file.previewUrl} alt={file.name}/>:<div className="patient-pdf-preview"><FileText size={52}/><strong>PDF preview</strong><span>Preview is simulated in this demo.</span></div>}<div className="patient-preview-meta"><span>{file.type}</span><span>{(file.sizeBytes/1024/1024).toFixed(2)} MB</span><a href={file.previewUrl||'#'} download={file.name} onClick={(e)=>{if(!file.previewUrl)e.preventDefault();}}><Download size={14}/> Download</a></div></Modal>; }
