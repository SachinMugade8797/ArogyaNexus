import { useCallback, useState } from 'react';
import Toast from '../components/auth/Toast';
export function usePatientToast(){const [items,setItems]=useState([]);const remove=useCallback((id)=>setItems((current)=>current.filter((item)=>item.id!==id)),[]);const show=useCallback(({title,message,type='success'})=>{const id=Date.now()+Math.random();setItems((current)=>[...current,{id,title,message,type}]);window.setTimeout(()=>setItems((current)=>current.filter((item)=>item.id!==id)),4000);},[]);return {show,toastNode:<Toast toasts={items} onRemove={remove}/>};}
