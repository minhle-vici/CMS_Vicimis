"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useNotification } from '@/components/Notification';
import { getPusherClient } from '@/lib/pusher';

export default function ChatPage() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) setConversations(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId, isPolling = false) => {
    if (!convId) return;
    if (!isPolling) setMsgLoading(true);
    try {
      const res = await fetch(`/api/chat?conversationId=${convId}`);
      if (res.ok) setMessages(await res.json());
    } catch (e) { console.error(e); }
    finally { if (!isPolling) setMsgLoading(false); }
  }, []);

  // Fetch users
  useEffect(() => {
    fetch('/api/users').then(r => r.ok ? r.json() : []).then(setAllUsers).catch(() => {});
  }, []);

  // Load conversations
  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Load messages when switching conversation
  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id, false);
      // Polling fallback
      if (pollRef.current) clearInterval(pollRef.current);
      const pusher = getPusherClient();
      if (!pusher) {
        pollRef.current = setInterval(() => fetchMessages(activeConv.id, true), 3000);
      }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConv, fetchMessages]);

  // Pusher setup
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher || !activeConv) return;
    const ch = pusher.subscribe(`conversation-${activeConv.id}`);
    ch.bind('new-message', (data) => {
      setMessages(prev => prev.find(m => m.id === data.id) ? prev : [...prev, data]);
    });
    return () => { ch.unbind_all(); pusher.unsubscribe(`conversation-${activeConv.id}`); };
  }, [activeConv]);

  // Pusher for conversation list updates
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher || !currentUserId) return;
    const ch = pusher.subscribe(`user-${currentUserId}`);
    ch.bind('conversation-updated', () => fetchConversations());
    return () => { ch.unbind_all(); pusher.unsubscribe(`user-${currentUserId}`); };
  }, [currentUserId, fetchConversations]);

  useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending || !activeConv) return;
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage.trim(), conversationId: activeConv.id })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        setNewMessage('');
        inputRef.current?.focus();
        fetchConversations();
      } else { showNotification('Không thể gửi tin nhắn!', 'error'); }
    } catch { showNotification('Lỗi kết nối!', 'error'); }
    finally { setSending(false); }
  };

  // Create DM
  const startDM = async (targetUser) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createConversation', memberIds: [targetUser.id], isGroup: false })
      });
      if (res.ok) {
        const conv = await res.json();
        setShowNewChat(false);
        await fetchConversations();
        setActiveConv(conv);
      }
    } catch { showNotification('Lỗi tạo cuộc trò chuyện', 'error'); }
  };

  // Create Group
  const createGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      showNotification('Nhập tên nhóm và chọn thành viên', 'error'); return;
    }
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createConversation', memberIds: selectedMembers, name: groupName.trim(), isGroup: true })
      });
      if (res.ok) {
        const conv = await res.json();
        setShowNewGroup(false); setGroupName(''); setSelectedMembers([]);
        await fetchConversations();
        setActiveConv(conv);
      }
    } catch { showNotification('Lỗi tạo nhóm', 'error'); }
  };

  // Helpers
  const getConvName = (conv) => {
    if (conv.isGroup) return conv.name || 'Nhóm chat';
    const other = conv.members?.find(m => m.user.id !== currentUserId);
    return other?.user?.name || 'Chat';
  };

  const getConvAvatar = (conv) => {
    if (conv.isGroup) return conv.name?.[0]?.toUpperCase() || 'G';
    const other = conv.members?.find(m => m.user.id !== currentUserId);
    return (other?.user?.name || '?')[0].toUpperCase();
  };

  const avatarColors = [
    'linear-gradient(135deg, #667eea, #764ba2)', 'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)', 'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)', 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #fccb90, #d57eeb)', 'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
  ];
  const getColor = (name) => { let h = 0; for (let i = 0; i < (name||'').length; i++) h = name.charCodeAt(i)+((h<<5)-h); return avatarColors[Math.abs(h)%avatarColors.length]; };

  const formatTime = (d) => new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const groupByDate = (msgs) => {
    const g = {};
    msgs.forEach(m => { const d = formatDate(m.createdAt); if (!g[d]) g[d]=[]; g[d].push(m); });
    return g;
  };

  const filteredUsers = allUsers.filter(u => u.id !== currentUserId && u.name.toLowerCase().includes(userSearch.toLowerCase()));
  const grouped = groupByDate(messages);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
        <Topbar buttonText="" />
        <style dangerouslySetInnerHTML={{ __html: chatStyles }} />

        <div className="chat-layout">
          {/* Sidebar conversations */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h3>Tin nhắn</h3>
              <div style={{ display:'flex', gap:'6px' }}>
                <button className="chat-action-btn" title="Tin nhắn mới" onClick={() => { setShowNewChat(true); setShowNewGroup(false); setUserSearch(''); }}>
                  <i className='bx bx-edit'></i>
                </button>
                <button className="chat-action-btn" title="Tạo nhóm" onClick={() => { setShowNewGroup(true); setShowNewChat(false); setSelectedMembers([]); setGroupName(''); setUserSearch(''); }}>
                  <i className='bx bx-group'></i>
                </button>
              </div>
            </div>

            {/* New Chat / Group Modal */}
            {(showNewChat || showNewGroup) && (
              <div className="new-chat-panel">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <h4 style={{ fontSize:'14px', fontWeight:700 }}>{showNewGroup ? 'Tạo nhóm mới' : 'Tin nhắn mới'}</h4>
                  <button className="chat-action-btn" onClick={() => { setShowNewChat(false); setShowNewGroup(false); }}><i className='bx bx-x'></i></button>
                </div>
                {showNewGroup && (
                  <input className="chat-search" placeholder="Tên nhóm..." value={groupName} onChange={e => setGroupName(e.target.value)} style={{ marginBottom:'8px' }} />
                )}
                <input className="chat-search" placeholder="Tìm thành viên..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                {showNewGroup && selectedMembers.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', margin:'8px 0' }}>
                    {selectedMembers.map(id => {
                      const u = allUsers.find(x => x.id === id);
                      return u ? <span key={id} className="selected-member-chip">{u.name} <i className='bx bx-x' onClick={() => setSelectedMembers(prev => prev.filter(x=>x!==id))}></i></span> : null;
                    })}
                  </div>
                )}
                <div className="user-list">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="user-list-item" onClick={() => {
                      if (showNewGroup) {
                        setSelectedMembers(prev => prev.includes(u.id) ? prev.filter(x=>x!==u.id) : [...prev, u.id]);
                      } else { startDM(u); }
                    }}>
                      <div className="chat-avatar-sm" style={{ background: getColor(u.name) }}>{u.name[0].toUpperCase()}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="conv-name">{u.name}</div>
                        <div className="conv-preview">{u.role}</div>
                      </div>
                      {showNewGroup && selectedMembers.includes(u.id) && <i className='bx bx-check-circle' style={{ color:'#007AFF', fontSize:'20px' }}></i>}
                    </div>
                  ))}
                </div>
                {showNewGroup && <button className="create-group-btn" onClick={createGroup}>Tạo nhóm ({selectedMembers.length})</button>}
              </div>
            )}

            {/* Conversation list */}
            <div className="conv-list">
              {loading ? <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>Đang tải...</div> :
               conversations.length === 0 ? <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)', fontSize:'13px' }}>Chưa có cuộc trò chuyện.<br/>Nhấn <i className='bx bx-edit'></i> để bắt đầu</div> :
               conversations.map(conv => (
                <div key={conv.id} className={`conv-item ${activeConv?.id === conv.id ? 'active' : ''}`} onClick={() => setActiveConv(conv)}>
                  <div className="chat-avatar-sm" style={{ background: getColor(getConvName(conv)) }}>
                    {conv.isGroup ? <i className='bx bx-group' style={{ fontSize:'14px' }}></i> : getConvAvatar(conv)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="conv-name">{getConvName(conv)}</div>
                    <div className="conv-preview">
                      {conv.messages?.[0] ? `${conv.messages[0].sender?.name}: ${conv.messages[0].text}`.substring(0, 40) : 'Chưa có tin nhắn'}
                    </div>
                  </div>
                  {conv.messages?.[0] && <div className="conv-time">{formatTime(conv.messages[0].createdAt)}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Main chat area */}
          <div className="chat-main">
            {!activeConv ? (
              <div className="chat-empty">
                <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg,#007AFF,#5856D6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <i className='bx bx-message-rounded-dots' style={{ fontSize:'36px', color:'white' }}></i>
                </div>
                <h3>Vicimis Team Chat</h3>
                <p>Chọn cuộc trò chuyện hoặc bắt đầu cuộc mới</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="chat-header">
                  <div className="chat-avatar-md" style={{ background: getColor(getConvName(activeConv)) }}>
                    {activeConv.isGroup ? <i className='bx bx-group' style={{ fontSize:'18px' }}></i> : getConvAvatar(activeConv)}
                  </div>
                  <div>
                    <h3 style={{ margin:0, fontSize:'16px', fontWeight:700, color:'var(--text-main)' }}>{getConvName(activeConv)}</h3>
                    <p style={{ margin:0, fontSize:'12px', color:'var(--text-muted)' }}>
                      {activeConv.isGroup ? `${activeConv.members?.length || 0} thành viên` : activeConv.members?.find(m=>m.user.id!==currentUserId)?.user?.role || ''}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="chat-messages-area">
                  {msgLoading ? <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>Đang tải tin nhắn...</div> :
                   messages.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
                      <i className='bx bx-message-rounded-dots' style={{ fontSize:'48px', opacity:0.3 }}></i>
                      <p style={{ marginTop:'12px' }}>Hãy bắt đầu cuộc trò chuyện!</p>
                    </div>
                  ) : Object.entries(grouped).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="date-divider"><span>{date}</span></div>
                      {msgs.map((msg, idx) => {
                        const isMe = msg.senderId === currentUserId;
                        const showAvatar = !isMe && (idx === 0 || msgs[idx-1]?.senderId !== msg.senderId);
                        const isLast = idx === msgs.length-1 || msgs[idx+1]?.senderId !== msg.senderId;
                        return (
                          <div key={msg.id}>
                            {showAvatar && <div className="msg-sender-name">{msg.sender?.name}</div>}
                            <div className={`msg-row ${isMe ? 'me' : 'other'}`}>
                              {!isMe && <div className="msg-avatar" style={{ background: getColor(msg.sender?.name), visibility: showAvatar?'visible':'hidden' }}>{(msg.sender?.name||'?')[0].toUpperCase()}</div>}
                              <div>
                                <div className={`msg-bubble ${isMe ? 'me' : 'other'}`}>{msg.text}</div>
                                {isLast && <div className={`msg-meta ${isMe?'me':''}`}>{formatTime(msg.createdAt)}</div>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-area" onSubmit={handleSend}>
                  <textarea ref={inputRef} className="chat-input" placeholder="Nhập tin nhắn..." value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    rows={1} />
                  <button type="submit" className="send-btn" disabled={!newMessage.trim()||sending}>
                    <i className='bx bx-send' style={{ transform:'rotate(-30deg)' }}></i>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const chatStyles = `
  .chat-layout { flex:1; display:flex; overflow:hidden; padding:0 24px 24px; gap:16px; }
  .chat-sidebar { width:320px; min-width:320px; display:flex; flex-direction:column; background:var(--card-bg); border-radius:24px; border:1px solid var(--border-color); box-shadow:0 8px 32px rgba(0,0,0,0.06); overflow:hidden; }
  .chat-sidebar-header { padding:20px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); }
  .chat-sidebar-header h3 { font-size:18px; font-weight:800; }
  .chat-action-btn { width:36px; height:36px; border-radius:50%; border:none; background:rgba(0,122,255,0.08); color:#007AFF; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
  .chat-action-btn:hover { background:#007AFF; color:white; }
  .new-chat-panel { padding:16px; border-bottom:1px solid var(--border-color); background:rgba(0,122,255,0.02); }
  .chat-search { width:100%; padding:10px 14px; border-radius:12px; border:1px solid var(--border-color); background:var(--card-bg); font-size:13px; outline:none; color:var(--text-main); font-family:inherit; }
  .chat-search:focus { border-color:#007AFF; }
  .user-list { max-height:240px; overflow-y:auto; margin-top:8px; }
  .user-list-item { display:flex; align-items:center; gap:10px; padding:10px; border-radius:12px; cursor:pointer; transition:background 0.15s; }
  .user-list-item:hover { background:rgba(0,122,255,0.06); }
  .selected-member-chip { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; background:#007AFF; color:white; border-radius:20px; font-size:11px; font-weight:600; }
  .selected-member-chip i { cursor:pointer; font-size:14px; }
  .create-group-btn { width:100%; margin-top:12px; padding:10px; border:none; border-radius:12px; background:linear-gradient(135deg,#007AFF,#5856D6); color:white; font-size:14px; font-weight:700; cursor:pointer; transition:opacity 0.2s; font-family:inherit; }
  .create-group-btn:hover { opacity:0.9; }
  .conv-list { flex:1; overflow-y:auto; padding:8px; }
  .conv-item { display:flex; align-items:center; gap:12px; padding:14px 12px; border-radius:16px; cursor:pointer; transition:all 0.15s; margin-bottom:2px; }
  .conv-item:hover { background:rgba(0,122,255,0.06); }
  .conv-item.active { background:rgba(0,122,255,0.1); }
  .conv-name { font-size:14px; font-weight:600; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .conv-preview { font-size:12px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
  .conv-time { font-size:11px; color:var(--text-muted); white-space:nowrap; flex-shrink:0; }
  .chat-avatar-sm { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; font-weight:700; flex-shrink:0; }
  .chat-avatar-md { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:16px; font-weight:700; flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,0.15); }
  .chat-main { flex:1; display:flex; flex-direction:column; background:var(--card-bg); border-radius:24px; border:1px solid var(--border-color); box-shadow:0 8px 32px rgba(0,0,0,0.06); overflow:hidden; }
  .chat-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; color:var(--text-muted); }
  .chat-empty h3 { font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:8px; }
  .chat-empty p { font-size:14px; }
  .chat-header { padding:18px 24px; border-bottom:1px solid var(--border-color); display:flex; align-items:center; gap:14px; background:rgba(255,255,255,0.5); backdrop-filter:blur(20px); }
  [data-theme='dark'] .chat-header { background:rgba(30,41,59,0.6); }
  .chat-messages-area { flex:1; overflow-y:auto; padding:20px 24px; display:flex; flex-direction:column; gap:4px; }
  .chat-messages-area::-webkit-scrollbar { width:5px; }
  .chat-messages-area::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.12); border-radius:3px; }
  .date-divider { text-align:center; margin:16px 0 10px; color:var(--text-muted); font-size:11px; font-weight:600; }
  .date-divider span { background:rgba(0,0,0,0.04); padding:4px 14px; border-radius:20px; }
  [data-theme='dark'] .date-divider span { background:rgba(255,255,255,0.06); }
  .msg-row { display:flex; gap:8px; align-items:flex-end; margin-bottom:2px; max-width:70%; }
  .msg-row.me { flex-direction:row-reverse; align-self:flex-end; margin-left:auto; }
  .msg-row.other { align-self:flex-start; }
  .msg-bubble { padding:10px 16px; border-radius:20px; font-size:14px; line-height:1.45; word-break:break-word; max-width:100%; animation:popIn 0.2s ease-out; }
  @keyframes popIn { from{opacity:0;transform:scale(0.92) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .msg-bubble.me { background:linear-gradient(135deg,#007AFF,#5856D6); color:white; border-bottom-right-radius:6px; }
  .msg-bubble.other { background:#e9e9eb; color:#1c1c1e; border-bottom-left-radius:6px; }
  [data-theme='dark'] .msg-bubble.other { background:#3a3a3c; color:#f5f5f7; }
  .msg-avatar { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:700; flex-shrink:0; }
  .msg-meta { font-size:10px; color:var(--text-muted); margin-top:2px; padding:0 8px; }
  .msg-meta.me { text-align:right; }
  .msg-sender-name { font-size:11px; color:var(--text-muted); margin-bottom:3px; padding-left:40px; font-weight:600; }
  .chat-input-area { padding:14px 20px; border-top:1px solid var(--border-color); display:flex; gap:10px; align-items:flex-end; background:rgba(255,255,255,0.5); backdrop-filter:blur(20px); }
  [data-theme='dark'] .chat-input-area { background:rgba(30,41,59,0.6); }
  .chat-input { flex:1; padding:11px 16px; border-radius:22px; border:1px solid var(--border-color); font-size:14px; outline:none; background:var(--card-bg); resize:none; max-height:100px; line-height:1.4; font-family:inherit; color:var(--text-main); transition:border-color 0.2s; }
  .chat-input:focus { border-color:#007AFF; box-shadow:0 0 0 3px rgba(0,122,255,0.12); }
  .send-btn { width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#007AFF,#5856D6); border:none; color:white; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; box-shadow:0 4px 12px rgba(0,122,255,0.3); }
  .send-btn:hover { transform:scale(1.08); }
  .send-btn:active { transform:scale(0.95); }
  .send-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
  @media (max-width:768px) { .chat-sidebar { width:72px; min-width:72px; } .chat-sidebar-header h3,.conv-name,.conv-preview,.conv-time,.new-chat-panel { display:none; } }
`;
