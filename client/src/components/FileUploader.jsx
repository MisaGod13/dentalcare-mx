import { useEffect, useState } from 'react'
import { Box, Button, HStack, List, ListItem, Input, useToast } from '@chakra-ui/react'
import { supabase } from '../supabaseClient'
export default function FileUploader({ patientId }){
  const [files,setFiles]=useState([])
  const toast=useToast()
  async function load(){
    const { data } = await supabase.from('files').select('*').eq('patient_id', patientId).order('created_at', {ascending:false})
    setFiles(data||[])
  }
  useEffect(()=>{ if(patientId) load() },[patientId])
  async function upload(e){
    const file = e.target.files?.[0]; if(!file) return
    const path = `${patientId}/${Date.now()}-${file.name}`
    const { error:stErr } = await supabase.storage.from('patient-files').upload(path, file)
    if(stErr){ toast({title:'Error al subir', description:stErr.message, status:'error'}); return }
    const { error } = await supabase.from('files').insert({ patient_id: patientId, file_name: file.name, file_path: path, file_type: file.type })
    if(error){ toast({title:'Error DB', description:error.message, status:'error'}) }
    e.target.value=null; load()
  }
  async function download(path){
    const { data, error } = await supabase.storage.from('patient-files').download(path)
    if(error) return
    const url=URL.createObjectURL(data); const a=document.createElement('a'); a.href=url; a.download=path.split('/').pop(); a.click(); URL.revokeObjectURL(url)
  }
  return (<Box><HStack><Input type='file' onChange={upload}/></HStack>
    <List spacing={2} mt={3}>{files.map(f=>(<ListItem key={f.id}><Button size='xs' onClick={()=>download(f.file_path)}>Descargar</Button> {f.file_name}</ListItem>))}</List></Box>)
}