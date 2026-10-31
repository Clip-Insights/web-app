import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Files from './Files';
import { fetchMyPlan } from '../../services/planService';
const request = vi.fn();
vi.mock('../../context/AuthContext',()=>({useAuth:()=>({authRequest:request})}));
vi.mock('../../services/planService',()=>({fetchMyPlan:vi.fn()}));
const show = path => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/files/:folder_id?" element={<Files/>}/><Route path="/folders" element={<h1>Folders destination</h1>}/></Routes></MemoryRouter>);
beforeEach(()=>{
 vi.resetAllMocks();
 fetchMyPlan.mockResolvedValue({plan:{max_file_size_mb:5}});
 request.mockImplementation(async config => ({data:config.url.includes('folders/') ? [] : {files:[]}}));
});
describe('library recovery and upload feedback',()=>{
 it('distinguishes a missing folder and offers a route back',async()=>{
  request.mockImplementation(async config=>{ if(config.url.includes('folder-files')) throw {response:{status:404}}; return {data:[]}; });
  show('/files/missing');
  await screen.findByRole('heading',{name:'This folder isn’t available'});
  fireEvent.click(screen.getByRole('link',{name:'All folders'}));
  await screen.findByRole('heading',{name:'Folders destination'});
 });
 it('rejects an oversized file before uploading using the server plan limit',async()=>{
  const {container}=show('/files');
  const file = new File(['pdf'],'notes.pdf',{type:'application/pdf'});
  Object.defineProperty(file,'size',{value:5*1024*1024+1});
  fireEvent.change(container.querySelector('input[type=file]'),{target:{files:[file]}});
  expect((await screen.findByRole('alert')).textContent).toMatch(/5 MB per-file limit/);
  expect(request.mock.calls.some(([config])=>config.method==='post')).toBe(false);
 });
 it('keeps upload failure visible and permits choosing the same file again',async()=>{
  request.mockImplementation(async config=>{if(config.method==='post') throw {response:{data:{message:'Storage is full. Free some space first.'}}}; return {data:config.url.includes('folders/')?[]:{files:[]}};});
  const {container}=show('/files');
  const input=container.querySelector('input[type=file]');
  fireEvent.change(input,{target:{files:[new File(['pdf'],'notes.pdf',{type:'application/pdf'})]}});
  expect((await screen.findByRole('alert')).textContent).toMatch(/Storage is full/);
  expect(input.value).toBe('');
 });
});
