import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Inline SVG Icons for a premium, library-free UI
const Icons = {
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Invite: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>,
  Board: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  List: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  Project: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
};

const WorkspaceBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isListView, setIsListView] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Form States
  const [newTicket, setNewTicket] = useState({ title: '', content: '' });
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('');
  const [inviteData, setInviteData] = useState({ email: '', role: 'Collaborator' });
  
  const columns = ['Open', 'In-Progress', 'Resolved'];
  const navigate = useNavigate();

  const getDecodedRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return 'Collaborator';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'Owner'; 
    } catch(e) {
      return 'Owner';
    }
  };
  
  const userRole = getDecodedRole();

  const stats = {
    total: tickets.length,
    inProgress: tickets.filter(t => t.status === 'In-Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    overdue: tickets.filter(t => t.isOverdue).length
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      const wsRes = await fetch('flowsync-sage.vercel.app/api/workspaces', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const wsData = await wsRes.json();
      
      let workspaceId = null;

      if (wsData.success && wsData.data.length > 0) {
        setWorkspaces(wsData.data);
        workspaceId = wsData.data[0].id;
      }

      if (workspaceId) {
        switchWorkspace(workspaceId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      setLoading(false);
    }
  };

  const switchWorkspace = async (workspaceId) => {
    setActiveWorkspaceId(workspaceId);
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const tktRes = await fetch(`http://localhost:5000/api/workspaces/${workspaceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tktData = await tktRes.json();
      
      if (tktData.success && tktData.data.tickets) {
        const enhancedTickets = tktData.data.tickets.map((t, index) => ({
          ...t,
          assigneeInitials: index % 2 === 0 ? 'JD' : 'AK',
          dueDate: index === 1 ? 'Overdue' : 'May 10',
          isOverdue: index === 1
        }));
        setTickets(enhancedTickets);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const moveTicket = async (ticketId, newStatus) => {
    const token = localStorage.getItem('token');
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    
    try {
      await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Failed to update ticket status', error);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!activeWorkspaceId) return;

    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: newTicket.title, 
          content: newTicket.content || '',
          workspaceId: activeWorkspaceId
        })
      });
      const data = await response.json();
      if (data.success) {
        const enhancedTicket = {
            ...data.data,
            assigneeInitials: 'ME',
            dueDate: 'Tomorrow',
            isOverdue: false
        };
        setTickets([...tickets, enhancedTicket]);
        setIsModalOpen(false);
        setNewTicket({ title: '', content: '' });
      }
    } catch (error) {
      console.error('Failed to create ticket', error);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    const token = localStorage.getItem('token');
    setTickets(tickets.filter(t => t.id !== ticketId));

    try {
      await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to delete ticket', error);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/workspaces', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newWorkspaceTitle, name: newWorkspaceTitle })
      });
      const data = await response.json();
      if (data.success) {
        setWorkspaces([...workspaces, data.data]);
        switchWorkspace(data.data.id);
        setIsWorkspaceModalOpen(false);
        setNewWorkspaceTitle('');
      } else {
        alert(data.errors?.[0]?.message || data.error || 'Failed to create workspace');
      }
    } catch (error) {
      console.error('Failed to create workspace', error);
    }
  };

  const handleDeleteWorkspace = async (e, workspaceId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this workspace and all its tickets?")) return;

    const token = localStorage.getItem('token');
    const remaining = workspaces.filter(w => w.id !== workspaceId);
    setWorkspaces(remaining);
    if (workspaceId === activeWorkspaceId) {
      if (remaining.length > 0) switchWorkspace(remaining[0].id);
      else {
        setActiveWorkspaceId(null);
        setTickets([]);
      }
    }

    try {
      await fetch(`http://localhost:5000/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to delete workspace', error);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    console.log(`Inviting ${inviteData.email} as ${inviteData.role}`);
    alert(`Invite successfully sent to ${inviteData.email} as ${inviteData.role}!`);
    setIsInviteModalOpen(false);
    setInviteData({ email: '', role: 'Collaborator' });
  };

  const activeWorkspaceName = workspaces.length > 0 
    ? (workspaces.find(w => w.id === activeWorkspaceId)?.title || 'Loading...') 
    : 'No Workspace Available';

  // UI Helper Functions for styling
  const getStatusBadgeClasses = (status) => {
    switch(status) {
      case 'Open': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
      case 'In-Progress': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-gray-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* ---------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION                                   */}
      {/* ---------------------------------------------------- */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0A0A] p-4 flex flex-col hidden md:flex">
        <div className="flex items-center space-x-3 mb-8 px-2 select-none cursor-pointer group">
          <div className="w-7 h-7 bg-white rounded flex items-center justify-center text-sm font-bold text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300">
            F
          </div>
          <span className="font-semibold text-sm text-gray-200 tracking-tight">FlowSync</span>
        </div>
        
        <div className="mt-2 mb-2 px-2">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Views</span>
        </div>
        <nav className="space-y-1">
          <button 
            onClick={() => setIsListView(false)} 
            className={`w-full flex items-center space-x-3 px-2 py-1.5 text-sm rounded-md transition-all duration-200 ${!isListView ? 'bg-white/5 text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          >
            <Icons.Board />
            <span>Board View</span>
          </button>
          <button 
            onClick={() => setIsListView(true)} 
            className={`w-full flex items-center space-x-3 px-2 py-1.5 text-sm rounded-md transition-all duration-200 ${isListView ? 'bg-white/5 text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          >
            <Icons.List />
            <span>List View</span>
          </button>
        </nav>

        {/* Workspaces/Projects Section */}
        <div className="mt-8 mb-2 px-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Projects</span>
        </div>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {workspaces.map(ws => (
            <div 
              key={ws.id} 
              onClick={() => switchWorkspace(ws.id)}
              className={`flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-all duration-200 group cursor-pointer ${activeWorkspaceId === ws.id ? 'bg-white/5 text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <span className={`${activeWorkspaceId === ws.id ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-400'} transition-colors`}><Icons.Project /></span>
                <span className="truncate select-none font-medium tracking-tight">{ws.title}</span>
              </div>
              
              <button 
                onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 ml-2 px-1 focus:outline-none"
                title="Delete Workspace"
              >
                <Icons.Trash />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setIsWorkspaceModalOpen(true)} 
            className="w-full flex items-center space-x-3 px-2 py-1.5 text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-md transition-all duration-200 cursor-pointer group mt-2 focus:outline-none"
          >
            <span className="text-gray-500 group-hover:text-gray-300 transition-colors"><Icons.Plus /></span>
            <span className="font-medium tracking-tight">New Project</span>
          </button>
        </nav>

        {/* User Profile Area */}
        <div className="mt-auto border-t border-white/5 pt-4 px-2 flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-[11px] font-bold shadow-lg text-white shadow-indigo-500/20">ME</div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-200 font-medium truncate w-24 tracking-tight">My Account</span>
            <span className="text-[10px] text-gray-500 font-medium">{userRole}</span>
          </div>
          
          <button onClick={() => {
            localStorage.removeItem('token');
            navigate('/auth');
          }} className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors focus:outline-none">
            Logout
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT AREA                                    */}
      {/* ---------------------------------------------------- */}
      <main className="flex-1 p-8 overflow-hidden flex flex-col bg-[#0A0A0A]">
        <header className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
          <h1 className="text-2xl font-semibold text-white tracking-tight">{activeWorkspaceName}</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-[#111111] border border-white/10 text-gray-300 text-xs font-medium rounded-md hover:bg-white/5 hover:border-gray-600 transition-all duration-300 active:scale-95 shadow-sm focus:outline-none"
            >
              <Icons.Invite />
              <span>Invite</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={!activeWorkspaceId}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white text-black border border-transparent text-xs font-medium rounded-md hover:bg-gray-200 hover:shadow-lg hover:shadow-white/10 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            >
              <Icons.Plus />
              <span>New Issue</span>
            </button>
          </div>
        </header>

        {/* Dynamic Dashboard Stats Row */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Issues', value: stats.total, color: 'text-white' },
            { label: 'In-Progress', value: stats.inProgress, color: 'text-indigo-400' },
            { label: 'Resolved', value: stats.resolved, color: 'text-emerald-400' },
            { label: 'Overdue', value: stats.overdue, color: 'text-red-400' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#111111] border border-white/5 rounded-lg p-5 flex flex-col shadow-sm hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ease-in-out cursor-default">
              <span className="text-[11px] text-gray-500 font-medium mb-2 uppercase tracking-widest">{stat.label}</span>
              <span className={`text-3xl font-semibold tracking-tight ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-sm text-gray-500 animate-pulse flex-1 flex items-center justify-center font-medium tracking-tight">Syncing workspace...</div>
        ) : !activeWorkspaceId ? (
          <div className="text-sm text-gray-500 flex-1 flex items-center justify-center font-medium tracking-tight">Create or select a project to manage issues.</div>
        ) : isListView ? (
          
          /* ========================================================= */
          /* LIST VIEW RENDERING                                       */
          /* ========================================================= */
          <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden flex-1 flex flex-col shadow-sm">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-[#0A0A0A] border-b border-white/5 text-[10px] uppercase font-semibold tracking-widest text-gray-500 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Issue</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-200 group">
                      <td className="px-6 py-4 font-medium text-gray-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-gray-600 font-mono tracking-wider">TKT-{ticket.id.substring(0,4).toUpperCase()}</span>
                          <span className="tracking-tight">{ticket.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={ticket.status}
                          onChange={(e) => moveTicket(ticket.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 cursor-pointer transition-colors ${getStatusBadgeClasses(ticket.status)} appearance-none`}
                        >
                          {columns.map(c => <option key={c} value={c} className="bg-[#111111]">{c}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.assigneeInitials && (
                          <div className="w-6 h-6 bg-[#1A1A1A] border border-white/10 rounded-full flex items-center justify-center text-[9px] text-gray-300 font-medium">
                            {ticket.assigneeInitials}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         {ticket.dueDate && (
                           <span className={`text-[10px] px-2 py-1 rounded-md uppercase tracking-wider font-semibold ${ticket.isOverdue ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-gray-400 bg-gray-800/50 border border-gray-700/50'}`}>
                             {ticket.dueDate}
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteTicket(ticket.id)} className="text-gray-600 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 px-2" title="Delete Issue">
                          <Icons.Trash />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 tracking-tight">No issues found in this project.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          
          /* ========================================================= */
          /* BOARD / KANBAN VIEW RENDERING                             */
          /* ========================================================= */
          <div className="flex flex-row items-start space-x-6 overflow-x-auto pb-8 flex-1 scrollbar-hide">
            {columns.map(col => (
              <div key={col} className="flex-shrink-0 w-[340px] flex flex-col">
                
                {/* Column Header */}
                <div className="flex items-center justify-between mb-5 group cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-sm font-medium text-gray-300 tracking-tight">{col}</h2>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full font-medium">
                      {tickets.filter(t => t.status === col).length}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                  >
                    <Icons.Plus />
                  </button>
                </div>

                {/* Tickets */}
                <div className="flex flex-col space-y-3">
                  {tickets.filter(t => t.status === col).map(ticket => (
                    <div 
                      key={ticket.id} 
                      className="bg-[#111111] border border-white/5 rounded-lg p-5 hover:border-gray-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50 transition-all duration-300 ease-out cursor-pointer flex flex-col group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-sm text-gray-200 font-medium leading-relaxed pr-6 tracking-tight">
                          {ticket.title}
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTicket(ticket.id); }}
                          className="absolute top-4 right-4 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 p-1 hover:bg-white/5 rounded-md"
                          title="Delete Issue"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-gray-600 font-mono tracking-wider font-medium">
                            TKT-{ticket.id.substring(0,4).toUpperCase()}
                          </span>
                          
                          {/* Due Date Badge */}
                          {ticket.dueDate && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-semibold ${ticket.isOverdue ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-gray-400 bg-gray-800/50 border border-gray-700/50'}`}>
                              {ticket.dueDate}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {ticket.assigneeInitials && (
                            <div className="w-5 h-5 bg-[#1A1A1A] border border-white/10 rounded-full flex items-center justify-center text-[9px] text-gray-300 font-medium" title="Assignee">
                              {ticket.assigneeInitials}
                            </div>
                          )}
                          
                          <select 
                            value={ticket.status}
                            onChange={(e) => moveTicket(ticket.id, e.target.value)}
                            className={`text-[10px] font-medium border-0 focus:ring-0 cursor-pointer px-2 py-1 rounded-md transition-colors appearance-none ${getStatusBadgeClasses(ticket.status)}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {columns.map(c => <option key={c} value={c} className="bg-[#111111]">{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Subtle new issue button at bottom of columns */}
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-left text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 px-3 py-2 rounded-lg transition-all duration-200 border border-transparent flex items-center space-x-2 mt-2 group focus:outline-none"
                  >
                    <span className="text-gray-600 group-hover:text-gray-400 transition-colors"><Icons.Plus /></span> 
                    <span className="font-medium tracking-tight">Create issue</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* GLASSMORPHISM MODALS                                      */}
      {/* ========================================================= */}
      
      {/* 1. New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-[#111111] border border-white/10 rounded-xl w-full max-w-lg p-7 shadow-2xl transform transition-all">
            <h2 className="text-lg font-medium text-white mb-6 tracking-tight">Create new issue</h2>
            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div>
                <input 
                  type="text" 
                  value={newTicket.title}
                  onChange={e => setNewTicket({...newTicket, title: e.target.value})}
                  placeholder="Issue title"
                  className="w-full bg-transparent border-none text-xl text-white font-medium focus:ring-0 p-0 placeholder-gray-600 focus:outline-none tracking-tight"
                  required
                />
              </div>
              <div>
                <textarea 
                  value={newTicket.content}
                  onChange={e => setNewTicket({...newTicket, content: e.target.value})}
                  placeholder="Add description..."
                  className="w-full bg-transparent border-none text-sm text-gray-400 focus:ring-0 p-0 resize-none h-28 placeholder-gray-600 focus:outline-none leading-relaxed"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-5 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all duration-200 focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-white text-black text-xs font-medium rounded-md hover:bg-gray-200 active:scale-95 transition-all duration-200 focus:outline-none shadow-sm shadow-white/10"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. New Workspace Modal */}
      {isWorkspaceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-[#111111] border border-white/10 rounded-xl w-full max-w-md p-7 shadow-2xl">
            <h2 className="text-lg font-medium text-white mb-6 tracking-tight">Create new project</h2>
            <form onSubmit={handleCreateWorkspace} className="space-y-5">
              <div>
                <input 
                  type="text" 
                  value={newWorkspaceTitle}
                  onChange={e => setNewWorkspaceTitle(e.target.value)}
                  placeholder="e.g. Q4 Marketing"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none placeholder-gray-600 transition-all shadow-inner"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsWorkspaceModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all duration-200 focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-white text-black text-xs font-medium rounded-md hover:bg-gray-200 active:scale-95 transition-all duration-200 focus:outline-none shadow-sm shadow-white/10"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-[#111111] border border-white/10 rounded-xl w-full max-w-md p-7 shadow-2xl">
            <h2 className="text-lg font-medium text-white mb-6 tracking-tight">Invite Member</h2>
            <form onSubmit={handleInviteMember} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Email Address</label>
                <input 
                  type="email" 
                  value={inviteData.email}
                  onChange={e => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="name@example.com"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none placeholder-gray-600 transition-all shadow-inner"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Role</label>
                <select 
                  value={inviteData.role}
                  onChange={e => setInviteData({...inviteData, role: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none transition-all shadow-inner"
                >
                  <option value="Collaborator">Collaborator</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all duration-200 focus:outline-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-500 active:scale-95 transition-all duration-200 focus:outline-none shadow-md shadow-indigo-500/20"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkspaceBoard;
