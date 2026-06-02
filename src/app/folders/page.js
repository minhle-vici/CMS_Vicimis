'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const ALL_ROLES = ['IT', 'AM', 'Designer', 'Sale'];
const FOLDER_COLORS = [
  { hex: '#3b82f6', label: 'Xanh dương' },
  { hex: '#10b981', label: 'Xanh lá' },
  { hex: '#f59e0b', label: 'Vàng' },
  { hex: '#ef4444', label: 'Đỏ' },
  { hex: '#8b5cf6', label: 'Tím' },
  { hex: '#ec4899', label: 'Hồng' },
  { hex: '#06b6d4', label: 'Cyan' },
  { hex: '#64748b', label: 'Xám' },
];
const FOLDER_ICONS = ['bx-folder', 'bx-lock', 'bx-code-alt', 'bx-star', 'bx-briefcase', 'bx-book', 'bx-data', 'bx-image'];

export default function FoldersPage() {
  const { data: session } = useSession();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = session?.user?.role === 'Admin';
  const isManager = session?.user?.is_manager || isAdmin;
  
  const isCreator = selectedFolder?.createdById === parseInt(session?.user?.id);
  const isFolderAdmin = isAdmin || isCreator;

  // Form state
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6', icon: 'bx-folder', type: 'ACCOUNT', roles: [] });

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/folders');
      if (!res.ok) throw new Error(`API returned status ${res.status}`);
      const data = await res.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setAllUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchFolders();
    if (isManager) fetchUsers();
  }, []);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type: form.type }),
    });
    setShowCreateModal(false);
    setForm({ name: '', description: '', color: '#3b82f6', icon: 'bx-folder', type: 'ACCOUNT', roles: [] });
    fetchFolders();
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm('Xóa thư mục này?')) return;
    await fetch('/api/folders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderId }),
    });
    setSelectedFolder(null);
    fetchFolders();
  };

  const handleToggleMemberAccess = async (folderId, memberId, currentAccess) => {
    await fetch('/api/folders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'member_access', folderId, memberId, canView: !currentAccess }),
    });
    fetchFolders();
    // sync selectedFolder
    const res = await fetch('/api/folders');
    const updated = await res.json();
    const fresh = updated.find(f => f.id === folderId);
    if (fresh) setSelectedFolder(fresh);
  };

  const handleToggleRoleAccess = async (folderId, role, currentHas) => {
    await fetch('/api/folders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'role_permission', folderId, role, grant: !currentHas }),
    });
    const res = await fetch('/api/folders');
    const updated = await res.json();
    setFolders(Array.isArray(updated) ? updated : []);
    const fresh = updated.find(f => f.id === folderId);
    if (fresh) setSelectedFolder(fresh);
  };

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role],
    }));
  };

  const filtered = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Members that the manager manages
  const myMembers = allUsers.filter(u => {
    if (isAdmin) return true;
    return u.managerId === parseInt(session?.user?.id);
  });

  // Add Account state
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', username: '', password: '', note: '' });

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!selectedFolder) return;
    await fetch('/api/folders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'add_account', folderId: selectedFolder.id, ...accountForm }),
    });
    setShowAddAccountModal(false);
    setAccountForm({ name: '', username: '', password: '', note: '' });
    
    // sync selectedFolder
    const res = await fetch('/api/folders');
    const updated = await res.json();
    setFolders(Array.isArray(updated) ? updated : []);
    const fresh = updated.find(f => f.id === selectedFolder.id);
    if (fresh) setSelectedFolder(fresh);
  };

  const handleRemoveAccount = async (folderId, accountId) => {
    if (!confirm('Xóa tài khoản này khỏi thư mục?')) return;
    await fetch('/api/folders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'remove_account', folderId, accountId }),
    });
    
    // sync selectedFolder
    const res = await fetch('/api/folders');
    const updated = await res.json();
    setFolders(Array.isArray(updated) ? updated : []);
    const fresh = updated.find(f => f.id === folderId);
    if (fresh) setSelectedFolder(fresh);
  };

  const [documentContent, setDocumentContent] = useState('');
  const [isSavingDoc, setIsSavingDoc] = useState(false);
  const quillRef = useRef(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const { url } = await res.json();
          // Insert the image into the editor
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', url);
        } else {
          alert('Tải ảnh lên thất bại.');
        }
      } catch (e) {
        alert('Có lỗi xảy ra khi tải ảnh.');
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), []);

  // Sync document content when folder changes
  useEffect(() => {
    if (selectedFolder && selectedFolder.type === 'DOCUMENT') {
      setDocumentContent(selectedFolder.content || '');
    }
  }, [selectedFolder]);

  const handleSaveDocument = async () => {
    if (!selectedFolder) return;
    setIsSavingDoc(true);
    await fetch('/api/folders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'update_document', folderId: selectedFolder.id, content: documentContent }),
    });
    setIsSavingDoc(false);
    
    const res = await fetch('/api/folders');
    const updated = await res.json();
    setFolders(Array.isArray(updated) ? updated : []);
    const fresh = updated.find(f => f.id === selectedFolder.id);
    if (fresh) setSelectedFolder(fresh);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          buttonText={'Tạo Thư mục'}
          onAddTask={() => setShowCreateModal(true)}
        />

        <div style={{ padding: '0 40px 40px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>
                <i className='bx bx-folder-open' style={{ marginRight: '12px', color: '#3b82f6' }} />
                Thư mục Chia sẻ
              </h1>
              <p style={{ color: '#64748b', marginTop: '4px' }}>Tài liệu & tài nguyên được chia sẻ theo phòng ban</p>
            </div>
          </header>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
              <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '40px' }} />
              <p style={{ marginTop: '12px' }}>Đang tải...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '32px', border: '1px dashed #cbd5e1' }}>
              <i className='bx bx-folder' style={{ fontSize: '60px', color: '#cbd5e1', display: 'block', marginBottom: '16px' }} />
              <p style={{ color: '#64748b' }}>Chưa có thư mục nào được tạo.</p>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowCreateModal(true)}>
                Tạo thư mục đầu tiên
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {filtered.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  style={{
                    background: 'white', borderRadius: '20px', padding: '24px',
                    border: `2px solid ${selectedFolder?.id === folder.id ? folder.color : '#f1f5f9'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      background: `${folder.color}20`, color: folder.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                    }}>
                      <i className={`bx ${folder.icon}`} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{folder.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {folder.type === 'DOCUMENT' ? (
                          <><i className='bx bx-edit-alt' /> Thư mục Văn bản</>
                        ) : (
                          <><i className='bx bx-file' /> {(folder.accounts || []).length} Tài khoản</>
                        )}
                        {' • '}bởi {folder.createdBy?.name || 'Admin'}
                      </div>
                    </div>
                  </div>
                  {folder.description && (
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', lineHeight: 1.5 }}>{folder.description}</p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {folder.permissions.map(p => (
                      <span key={p.role} style={{
                        fontSize: '11px', padding: '3px 8px', borderRadius: '8px', fontWeight: 600,
                        background: `${folder.color}15`, color: folder.color,
                      }}>{p.role}</span>
                    ))}
                    {folder.permissions.length === 0 && (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Chưa chia sẻ phòng ban nào</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detail Panel */}
          {selectedFolder && (
            <div style={{ marginTop: '40px', background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: `${selectedFolder.color}20`, color: selectedFolder.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                  }}>
                    <i className={`bx ${selectedFolder.icon}`} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b' }}>{selectedFolder.name}</h2>
                    {selectedFolder.description && <p style={{ color: '#64748b', fontSize: '14px' }}>{selectedFolder.description}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSelectedFolder(null)} className="btn btn-outline" style={{ fontSize: '13px' }}>
                    <i className='bx bx-x' /> Đóng
                  </button>
                  {isFolderAdmin && (
                    <button onClick={() => handleDeleteFolder(selectedFolder.id)} className="btn" style={{ background: '#fee2e2', color: '#ef4444', fontSize: '13px' }}>
                      <i className='bx bx-trash' /> Xóa
                    </button>
                  )}
                </div>
              </div>

              {/* Phòng ban được chia sẻ – Admin hoặc Người tạo */}
              {isFolderAdmin && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <i className='bx bx-group' style={{ marginRight: '6px' }} />
                    Phòng ban có quyền xem
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                    {ALL_ROLES.map(role => {
                      const hasAccess = selectedFolder.permissions.some(p => p.role === role);
                      return (
                        <button
                          key={role}
                          onClick={() => handleToggleRoleAccess(selectedFolder.id, role, hasAccess)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 16px', borderRadius: '14px', cursor: 'pointer',
                            border: `2px solid ${hasAccess ? selectedFolder.color : '#e2e8f0'}`,
                            background: hasAccess ? `${selectedFolder.color}12` : '#f8fafc',
                            transition: 'all 0.2s', textAlign: 'left',
                          }}
                          onMouseEnter={e => { if (!hasAccess) e.currentTarget.style.borderColor = '#cbd5e1'; }}
                          onMouseLeave={e => { if (!hasAccess) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                            background: hasAccess ? selectedFolder.color : '#e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {hasAccess && <i className='bx bx-check' style={{ color: 'white', fontSize: '14px' }} />}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: hasAccess ? selectedFolder.color : '#64748b' }}>
                            {role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                    <i className='bx bx-info-circle' style={{ marginRight: '4px' }} />
                    Bấm vào phòng ban để cấp / thu hồi quyền xem
                  </p>
                </div>
              )}

              {/* Trưởng phòng hoặc Người tạo: Phân quyền thành viên */}
              {(isManager || isFolderAdmin) && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Phân quyền Thành viên
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {myMembers.filter(u => u.id !== parseInt(session?.user?.id)).map(member => {
                      const access = selectedFolder.memberAccess.find(a => a.userId === member.id);
                      const hasAccess = access?.canView || false;
                      // Check if member's role already has folder access via permissions
                      const roleAccess = selectedFolder.permissions.find(p => p.role === member.role);
                      return (
                        <div key={member.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', background: '#f8fafc', borderRadius: '12px',
                          border: `1px solid ${hasAccess || roleAccess ? '#d1fae5' : '#f1f5f9'}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: '#475569' }}>
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '14px' }}>{member.name}</div>
                              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{member.role}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {roleAccess && (
                              <span style={{ fontSize: '11px', color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '8px' }}>
                                Qua phòng ban
                              </span>
                            )}
                            <button
                              onClick={() => handleToggleMemberAccess(selectedFolder.id, member.id, hasAccess)}
                              style={{
                                padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: hasAccess ? '#d1fae5' : '#f1f5f9',
                                color: hasAccess ? '#059669' : '#64748b',
                              }}
                            >
                              <i className={`bx ${hasAccess ? 'bx-check-circle' : 'bx-circle'}`} style={{ marginRight: '4px' }} />
                              {hasAccess ? 'Đang xem được' : 'Chưa có quyền'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tùy theo loại thư mục mà hiển thị phần Tài khoản hoặc Soạn thảo văn bản */}
              {selectedFolder.type === 'DOCUMENT' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                      <i className='bx bx-edit' style={{ marginRight: '6px' }} />
                      Nội dung Văn bản / Ghi chú
                    </h3>
                    {isFolderAdmin && (
                      <button 
                        onClick={handleSaveDocument} 
                        disabled={isSavingDoc}
                        className="btn btn-primary" 
                        style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '8px' }}
                      >
                        {isSavingDoc ? 'Đang lưu...' : (
                          <><i className='bx bx-save' style={{ marginRight: '4px' }} /> Lưu nội dung</>
                        )}
                      </button>
                    )}
                  </div>
                  <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', minHeight: '400px' }}>
                    <ReactQuill 
                      ref={quillRef}
                      theme="snow" 
                      value={documentContent} 
                      onChange={setDocumentContent} 
                      modules={isFolderAdmin ? modules : { toolbar: false }}
                      readOnly={!isFolderAdmin}
                      style={{ height: '350px' }}
                    />
                  </div>
                </div>
              ) : (
                /* Danh sách tài khoản trong thư mục (chỉ hiện nếu là ACCOUNT folder) */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                      <i className='bx bx-key' style={{ marginRight: '6px' }} />
                      Tài khoản trong thư mục
                    </h3>
                  <button onClick={() => setShowAddAccountModal(true)} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    <i className='bx bx-plus' /> Thêm tài khoản
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {(!selectedFolder.accounts || selectedFolder.accounts.length === 0) ? (
                    <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                      Chưa có tài khoản nào trong thư mục này.
                    </div>
                  ) : selectedFolder.accounts.map(acc => (
                    <div key={acc.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                      {(isManager || isFolderAdmin) && (
                        <button 
                          onClick={() => handleRemoveAccount(selectedFolder.id, acc.id)}
                          style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                          title="Xóa tài khoản"
                        >
                          <i className='bx bx-trash' />
                        </button>
                      )}
                      <div style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b', paddingRight: '24px' }}>{acc.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <span style={{ color: '#64748b', width: '70px' }}>Tài khoản:</span>
                        <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{acc.username}</code>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <span style={{ color: '#64748b', width: '70px' }}>Mật khẩu:</span>
                        <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{acc.password}</code>
                      </div>
                      {acc.note && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', padding: '8px', background: '#f1f5f9', borderRadius: '6px' }}>
                          <i className='bx bx-note' style={{ marginRight: '4px' }}/> {acc.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              )}

            </div>
          )}
        </div>

        {/* ADD ACCOUNT MODAL */}
        {showAddAccountModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '24px', width: '480px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Thêm Tài khoản mới</h2>
                <button onClick={() => setShowAddAccountModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
              </div>
              <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>Tên Dịch vụ / Phần mềm *</label>
                  <input
                    value={accountForm.name} onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))}
                    required placeholder="Ví dụ: Canva Pro, Freepik..."
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>Tên đăng nhập *</label>
                  <input
                    value={accountForm.username} onChange={e => setAccountForm(f => ({ ...f, username: e.target.value }))}
                    required placeholder="Email hoặc Username"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>Mật khẩu *</label>
                  <input
                    value={accountForm.password} onChange={e => setAccountForm(f => ({ ...f, password: e.target.value }))}
                    required placeholder="Nhập mật khẩu..."
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>Ghi chú (Tùy chọn)</label>
                  <textarea
                    value={accountForm.note} onChange={e => setAccountForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="Ghi chú thêm nếu cần..." rows={2}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddAccountModal(false)} style={{ flex: 1 }}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Thêm Tài khoản</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE MODAL */}
        {showCreateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '24px', width: '520px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ padding: '28px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Tạo Thư mục mới</h2>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
              </div>
              <form onSubmit={handleCreateFolder} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Tên thư mục *</label>
                  <input
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required placeholder="Nhập tên thư mục..."
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Loại thư mục *</label>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                      <input 
                        type="radio" name="folderType" value="ACCOUNT" 
                        checked={form.type === 'ACCOUNT'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      />
                      Lưu trữ Tài khoản
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                      <input 
                        type="radio" name="folderType" value="DOCUMENT" 
                        checked={form.type === 'DOCUMENT'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      />
                      Ghi chú / Soạn văn bản
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Mô tả</label>
                  <textarea
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả ngắn về thư mục này..."
                    rows={2}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Màu sắc</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {FOLDER_COLORS.map(c => (
                      <button key={c.hex} type="button" onClick={() => setForm(f => ({ ...f, color: c.hex }))}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', background: c.hex, border: form.color === c.hex ? '3px solid #1e293b' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Biểu tượng</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {FOLDER_ICONS.map(ic => (
                      <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                        style={{ width: '40px', height: '40px', borderRadius: '10px', background: form.icon === ic ? form.color : '#f1f5f9', color: form.icon === ic ? 'white' : '#475569', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`bx ${ic}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Chia sẻ với phòng ban</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {ALL_ROLES.map(r => (
                      <button key={r} type="button" onClick={() => toggleRole(r)}
                        style={{
                          padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                          border: '1px solid', cursor: 'pointer',
                          background: form.roles.includes(r) ? form.color : 'transparent',
                          borderColor: form.roles.includes(r) ? form.color : '#e2e8f0',
                          color: form.roles.includes(r) ? 'white' : '#475569',
                        }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, background: form.color, border: 'none' }}>
                    <i className='bx bx-folder-plus' style={{ marginRight: '8px' }} />Tạo thư mục
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
