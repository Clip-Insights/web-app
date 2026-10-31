import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { fetchMyPlan } from '../../services/planService';
const request = vi.fn();
vi.mock('../../context/AuthContext',()=>({useAuth:()=>({authRequest:request})}));
vi.mock('../../services/planService',()=>({fetchMyPlan:vi.fn(),formatResetTime:()=>null}));
vi.mock('../Files/RecentFiles',()=>({default:()=>null}));
beforeEach(()=>{
 vi.resetAllMocks();
 request.mockImplementation(async config=>({data:config.url.includes('profile')?{name:'Learner'}:{message:'success',allowed_space:52428800,used_space:1048576}}));
});
describe('dashboard recovery',()=>{
 it('retries failed usage without refetching successful profile and storage data',async()=>{
  fetchMyPlan.mockRejectedValueOnce(new Error('Offline')).mockResolvedValue({plan:{name:'Free'},usage:{summary:{used:1,limit:5},chat:{used:2,limit:20}}});
  render(<MemoryRouter><Dashboard/></MemoryRouter>);
  await screen.findByRole('heading',{name:'Usage information couldn’t load'});
  fireEvent.click(screen.getByRole('button',{name:'Try again'}));
  await screen.findByRole('heading',{name:"Today's AI usage"});
  expect(request).toHaveBeenCalledTimes(2);
  expect(fetchMyPlan).toHaveBeenCalledTimes(2);
 });
});
