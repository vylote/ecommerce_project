import React, { useState, useEffect } from 'react';
import {
  Shield, KeyRound, Plus, Edit2, Trash2, Check, X, Search,
  Users, CheckCircle2, AlertTriangle, RefreshCw, Lock, Unlock,
  SlidersHorizontal, ChevronRight, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';

// Gom nhóm các quyền theo module chức năng để hiển thị trực quan
const PERMISSION_GROUPS = [
  {
    groupName: 'Quản lý Sản phẩm & Danh mục',
    icon: '📦',
    prefixKeywords: ['PRODUCT', 'CATEGORY', 'SPECIFICATION', 'CATEGORIES'],
  },
  {
    groupName: 'Đơn hàng & Mua sắm',
    icon: '🛒',
    prefixKeywords: ['ORDER', 'CART', 'REVIEW'],
  },
  {
    groupName: 'Người dùng & Phân quyền',
    icon: '👥',
    prefixKeywords: ['USER', 'SELLER', 'ROLE'],
  },
  {
    groupName: 'Hệ thống & Doanh thu',
    icon: '⚙️',
    prefixKeywords: ['COMMISSION', 'STATISTICS', 'SETTING'],
  },
  {
    groupName: 'Đặc quyền thành viên VIP',
    icon: '⭐',
    prefixKeywords: ['VIP'],
  },
];

export default function RolePermissionPage() {
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'permissions' | 'user-roles'
  const [loading, setLoading] = useState(true);

  // Dữ liệu Roles & Permissions
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal Role (Thêm/Sửa)
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [roleForm, setRoleForm] = useState({
    id: null,
    name: '',
    description: '',
    permissionIds: [],
  });
  const [savingRole, setSavingRole] = useState(false);

  // Modal Permission (Thêm/Sửa)
  const [showPermModal, setShowPermModal] = useState(false);
  const [isEditingPerm, setIsEditingPerm] = useState(false);
  const [permForm, setPermForm] = useState({
    id: null,
    name: '',
    description: '',
  });
  const [savingPerm, setSavingPerm] = useState(false);

  // Modal Gán Role cho User
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignedRoleIds, setAssignedRoleIds] = useState([]);
  const [savingAssign, setSavingAssign] = useState(false);

  // Tìm kiếm
  const [roleSearch, setRoleSearch] = useState('');
  const [permSearch, setPermSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Tải dữ liệu từ backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes, usersRes] = await Promise.all([
        api.get('/admin/roles').catch(() => ({ data: { result: [] } })),
        api.get('/admin/permissions').catch(() => ({ data: { result: [] } })),
        api.get('/users').catch(() => ({ data: { result: [] } })),
      ]);

      const rawRoles = rolesRes.data?.result;
      const roleList = Array.isArray(rawRoles) ? rawRoles : (rawRoles?.data || []);

      const rawPerms = permsRes.data?.result;
      const permList = Array.isArray(rawPerms) ? rawPerms : (rawPerms?.data || []);

      const rawUsers = usersRes.data?.result;
      const userList = Array.isArray(rawUsers) ? rawUsers : (rawUsers?.data || []);

      setRoles(roleList);
      setPermissions(permList);
      setUsers(userList);
    } catch (error) {
      toast.error('Không thể tải dữ liệu phân quyền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HÀNH ĐỘNG CHO ROLE ---
  const handleOpenCreateRole = () => {
    setIsEditingRole(false);
    setRoleForm({ id: null, name: '', description: '', permissionIds: [] });
    setShowRoleModal(true);
  };

  const handleOpenEditRole = (role) => {
    setIsEditingRole(true);
    setRoleForm({
      id: role.id,
      name: role.name?.replace(/^ROLE_/, '') || '',
      description: role.description || '',
      permissionIds: role.permissions?.map((p) => p.id) || [],
    });
    setShowRoleModal(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error('Tên vai trò không được để trống');
      return;
    }

    try {
      setSavingRole(true);
      if (isEditingRole) {
        await api.put(`/admin/roles/${roleForm.id}`, {
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
          permissionIds: roleForm.permissionIds,
        });
        toast.success('Đã cập nhật vai trò thành công');
      } else {
        await api.post('/admin/roles', {
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
          permissionIds: roleForm.permissionIds,
        });
        toast.success('Đã tạo vai trò mới thành công');
      }
      setShowRoleModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu vai trò');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (role) => {
    const isSystemRole = ['ROLE_ADMIN', 'ROLE_SELLER', 'ROLE_BUYER'].includes(role.name);
    if (isSystemRole) {
      toast.error(`Không thể xóa vai trò mặc định của hệ thống (${role.name})`);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/roles/${role.id}`);
      toast.success('Đã xóa vai trò thành công');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa vai trò này');
    }
  };

  const togglePermissionInRole = (permId) => {
    setRoleForm((prev) => {
      const exists = prev.permissionIds.includes(permId);
      return {
        ...prev,
        permissionIds: exists
          ? prev.permissionIds.filter((id) => id !== permId)
          : [...prev.permissionIds, permId],
      };
    });
  };

  const toggleSelectGroupPermissions = (groupPermIds) => {
    const allSelected = groupPermIds.every((id) => roleForm.permissionIds.includes(id));
    setRoleForm((prev) => ({
      ...prev,
      permissionIds: allSelected
        ? prev.permissionIds.filter((id) => !groupPermIds.includes(id))
        : Array.from(new Set([...prev.permissionIds, ...groupPermIds])),
    }));
  };

  // --- HÀNH ĐỘNG CHO PERMISSION ---
  const handleOpenCreatePerm = () => {
    setIsEditingPerm(false);
    setPermForm({ id: null, name: '', description: '' });
    setShowPermModal(true);
  };

  const handleOpenEditPerm = (perm) => {
    setIsEditingPerm(true);
    setPermForm({
      id: perm.id,
      name: perm.name || '',
      description: perm.description || '',
    });
    setShowPermModal(true);
  };

  const handleSavePerm = async (e) => {
    e.preventDefault();
    if (!permForm.name.trim()) {
      toast.error('Tên quyền hạn không được để trống');
      return;
    }

    try {
      setSavingPerm(true);
      if (isEditingPerm) {
        await api.put(`/admin/permissions/${permForm.id}`, {
          name: permForm.name.trim(),
          description: permForm.description.trim(),
        });
        toast.success('Đã cập nhật quyền hạn');
      } else {
        await api.post('/admin/permissions', {
          name: permForm.name.trim(),
          description: permForm.description.trim(),
        });
        toast.success('Đã thêm quyền hạn mới');
      }
      setShowPermModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi lưu quyền hạn');
    } finally {
      setSavingPerm(false);
    }
  };

  const handleDeletePerm = async (permId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quyền hạn này?')) return;
    try {
      await api.delete(`/admin/permissions/${permId}`);
      toast.success('Đã xóa quyền hạn');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa quyền');
    }
  };

  // --- HÀNH ĐỘNG GÁN ROLE CHO USER ---
  const handleOpenAssignModal = (user) => {
    setSelectedUser(user);
    setAssignedRoleIds(user.roles ? user.roles.map((r) => r.id) : []);
    setShowAssignModal(true);
  };

  const handleSaveAssignRoles = async () => {
    if (!selectedUser) return;
    try {
      setSavingAssign(true);
      await api.put(`/admin/users/${selectedUser.id}/roles`, {
        roleIds: assignedRoleIds,
      });
      toast.success(`Đã cập nhật vai trò cho người dùng ${selectedUser.fullName || selectedUser.email}`);
      setShowAssignModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi phân quyền cho người dùng');
    } finally {
      setSavingAssign(false);
    }
  };

  // Filter dữ liệu
  const roleArray = Array.isArray(roles) ? roles : [];
  const permArray = Array.isArray(permissions) ? permissions : [];
  const userArray = Array.isArray(users) ? users : [];

  const filteredRoles = roleArray.filter(
    (r) =>
      r.name?.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.description?.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredPermissions = permArray.filter(
    (p) =>
      p.name?.toLowerCase().includes(permSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(permSearch.toLowerCase())
  );

  const filteredUsers = userArray.filter(
    (u) =>
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* HEADER TRANG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <KeyRound size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Quản lý Vai trò & Phân quyền</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Thiết lập vai trò (Roles), cấu hình danh mục quyền (Permissions) và phân quyền cho người dùng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="btn btn-sm btn-outline border-gray-300 gap-1.5"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={15} /> Làm mới
          </button>
          {activeTab === 'roles' && (
            <button
              onClick={handleOpenCreateRole}
              className="btn btn-sm bg-[#3b82f6] hover:bg-blue-600 text-white border-none gap-2 px-4 shadow-xs"
            >
              <Plus size={16} /> Thêm Vai trò
            </button>
          )}
          {activeTab === 'permissions' && (
            <button
              onClick={handleOpenCreatePerm}
              className="btn btn-sm bg-[#3b82f6] hover:bg-blue-600 text-white border-none gap-2 px-4 shadow-xs"
            >
              <Plus size={16} /> Thêm Quyền hạn
            </button>
          )}
        </div>
      </div>

      {/* TABS CHÍNH */}
      <div className="flex border-b border-gray-200 bg-white px-6 pt-3 rounded-t-xl gap-6">
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Shield size={16} /> Danh sách Vai trò ({roles.length})
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <KeyRound size={16} /> Danh mục Quyền hạn ({permissions.length})
        </button>

        <button
          onClick={() => setActiveTab('user-roles')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'user-roles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Users size={16} /> Phân vai trò cho Người dùng
        </button>
      </div>

      {/* ================= TAB 1: DANH SÁCH VAI TRÒ (ROLES) ================= */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {/* Thanh tìm kiếm */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm vai trò theo tên hoặc mô tả..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 bg-white"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Hiển thị {filteredRoles.length} / {roles.length} vai trò
            </span>
          </div>

          {loading ? (
            <div className="bg-white p-12 text-center text-gray-400 rounded-xl border border-gray-200">
              Đang tải dữ liệu vai trò...
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="bg-white p-12 text-center text-gray-400 rounded-xl border border-gray-200">
              Không tìm thấy vai trò nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRoles.map((role) => {
                const isSystem = ['ROLE_ADMIN', 'ROLE_SELLER', 'ROLE_BUYER'].includes(role.name);
                const permList = role.permissions || [];

                return (
                  <div
                    key={role.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 border-b border-gray-100 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-800 text-base">{role.name}</h3>
                            {isSystem ? (
                              <span className="badge badge-xs bg-amber-100 text-amber-800 border-amber-300 font-semibold text-[10px]">
                                Hệ thống
                              </span>
                            ) : (
                              <span className="badge badge-xs bg-blue-100 text-blue-800 border-blue-300 font-semibold text-[10px]">
                                Tùy chỉnh
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {role.description || 'Chưa có mô tả chi tiết cho vai trò này.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-semibold text-gray-600 flex items-center gap-1.5">
                          <KeyRound size={13} className="text-blue-500" />
                          <span>{permList.length} quyền hạn được gán</span>
                        </span>
                      </div>

                      {/* Danh sách quyền tóm tắt */}
                      <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pt-1 no-scrollbar">
                        {permList.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">Chưa có quyền hạn nào</span>
                        ) : (
                          permList.map((p) => (
                            <span
                              key={p.id}
                              className="badge badge-sm bg-gray-50 text-gray-700 border-gray-200 text-[11px]"
                              title={p.description || p.name}
                            >
                              {p.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3 bg-gray-50/70 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenEditRole(role)}
                        className="btn btn-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-semibold gap-1"
                      >
                        <Edit2 size={12} /> Chỉnh sửa quyền
                      </button>

                      {!isSystem ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role)}
                          className="btn btn-xs btn-ghost text-red-500 hover:bg-red-50 gap-1"
                          title="Xóa vai trò"
                        >
                          <Trash2 size={12} /> Xóa
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px] flex items-center gap-1">
                          <Lock size={12} /> Cố định
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: DANH MỤC QUYỀN HẠN (PERMISSIONS) ================= */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm mã quyền hoặc mô tả..."
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 bg-white"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Hiển thị {filteredPermissions.length} / {permissions.length} quyền
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="w-12">#</th>
                  <th>Mã Quyền hạn (Permission Name)</th>
                  <th>Mô tả chi tiết</th>
                  <th className="w-24 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      Không tìm thấy quyền hạn nào.
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map((perm, idx) => (
                    <tr key={perm.id} className="hover:bg-gray-50/70">
                      <td className="font-semibold text-gray-400">{idx + 1}</td>
                      <td>
                        <span className="font-bold text-gray-800 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {perm.name}
                        </span>
                      </td>
                      <td className="text-gray-600">{perm.description || '—'}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditPerm(perm)}
                            className="p-1.5 hover:text-blue-600 text-gray-400 rounded hover:bg-gray-100"
                            title="Sửa quyền"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeletePerm(perm.id)}
                            className="p-1.5 hover:text-red-600 text-gray-400 rounded hover:bg-gray-100"
                            title="Xóa quyền"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PHÂN VAI TRÒ CHO NGƯỜI DÙNG ================= */}
      {activeTab === 'user-roles' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm người dùng theo Email, Họ tên hoặc Số điện thoại..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 bg-white"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {filteredUsers.length} người dùng
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th>Người dùng</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò hiện tại</th>
                  <th>Trạng thái</th>
                  <th className="w-32 text-right">Phân quyền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const userRoles = u.roles || [];
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/70">
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : u.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800">{u.fullName || 'Chưa đặt tên'}</div>
                              <div className="text-[11px] text-gray-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-gray-600">{u.phone || '—'}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {userRoles.length === 0 ? (
                              <span className="text-gray-400 italic">Chưa có vai trò</span>
                            ) : (
                              userRoles.map((r, i) => (
                                <span
                                  key={i}
                                  className={`badge badge-xs text-[10px] font-semibold ${
                                    r.name === 'ROLE_ADMIN'
                                      ? 'bg-red-100 text-red-700 border-red-300'
                                      : r.name === 'ROLE_SELLER'
                                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                      : 'bg-blue-100 text-blue-700 border-blue-300'
                                  }`}
                                >
                                  {r.name}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td>
                          {u.isActive ? (
                            <span className="badge badge-xs badge-success text-[10px] text-white">Hoạt động</span>
                          ) : (
                            <span className="badge badge-xs badge-error text-[10px] text-white">Đã khóa</span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleOpenAssignModal(u)}
                            className="btn btn-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-semibold gap-1"
                          >
                            <UserCheck size={13} /> Phân vai trò
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM / SỬA VAI TRÒ (ROLE) ================= */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-800 text-base">
                  {isEditingRole ? `Chỉnh sửa vai trò: ROLE_${roleForm.name}` : 'Tạo vai trò mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label font-semibold text-xs text-gray-700">
                    Mã vai trò (Role Name) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 border border-r-0 border-gray-300 px-3 py-2 text-xs font-mono font-bold text-gray-600 rounded-l-lg">
                      ROLE_
                    </span>
                    <input
                      type="text"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toUpperCase().replace(/^ROLE_/, '') })}
                      placeholder="MODERATOR, SUPPORT..."
                      className="input input-sm input-bordered w-full rounded-l-none focus:border-blue-500 font-mono text-xs uppercase"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1">Hệ thống sẽ tự động thêm tiền tố ROLE_</span>
                </div>

                <div className="form-control">
                  <label className="label font-semibold text-xs text-gray-700">Mô tả vai trò</label>
                  <input
                    type="text"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    placeholder="Ví dụ: Kiểm duyệt viên nội dung sản phẩm..."
                    className="input input-sm input-bordered w-full focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* PHÂN NHÓM CHỌN QUYỀN HẠN (PERMISSIONS) */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                    <KeyRound size={16} className="text-blue-500" />
                    <span>Cấp quyền hạn cho vai trò này</span>
                  </label>
                  <span className="text-xs text-blue-600 font-semibold">
                    Đã chọn {roleForm.permissionIds.length} / {permissions.length} quyền
                  </span>
                </div>

                {/* Danh sách các nhóm quyền */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {PERMISSION_GROUPS.map((group, gIdx) => {
                    const groupPerms = permissions.filter((p) =>
                      group.prefixKeywords.some((kw) => p.name?.includes(kw))
                    );

                    if (groupPerms.length === 0) return null;

                    const groupPermIds = groupPerms.map((p) => p.id);
                    const isAllSelected = groupPermIds.every((id) => roleForm.permissionIds.includes(id));

                    return (
                      <div key={gIdx} className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-700 flex items-center gap-1.5">
                            <span>{group.icon}</span>
                            <span>{group.groupName}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSelectGroupPermissions(groupPermIds)}
                            className="text-[11px] text-blue-600 hover:underline font-semibold"
                          >
                            {isAllSelected ? 'Bỏ chọn nhóm' : 'Chọn tất cả nhóm'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {groupPerms.map((perm) => {
                            const isChecked = roleForm.permissionIds.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100/60'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermissionInRole(perm.id)}
                                  className="checkbox checkbox-xs checkbox-primary mt-0.5"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold font-mono text-[11px] truncate">{perm.name}</div>
                                  {perm.description && (
                                    <div className="text-[10px] text-gray-500 line-clamp-1">{perm.description}</div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="btn btn-sm btn-ghost"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="btn btn-sm bg-[#3b82f6] hover:bg-blue-600 text-white border-none px-6"
                >
                  {savingRole ? <span className="loading loading-spinner loading-xs"></span> : 'Lưu vai trò'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM / SỬA QUYỀN HẠN (PERMISSION) ================= */}
      {showPermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 text-base">
                {isEditingPerm ? 'Sửa quyền hạn' : 'Thêm quyền hạn mới'}
              </h3>
              <button
                onClick={() => setShowPermModal(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePerm} className="p-6 space-y-4">
              <div className="form-control">
                <label className="label font-semibold text-xs text-gray-700">
                  Mã quyền (Permission Code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={permForm.name}
                  onChange={(e) => setPermForm({ ...permForm, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  placeholder="Ví dụ: EXPORT_ORDER_REPORT..."
                  className="input input-sm input-bordered w-full focus:border-blue-500 font-mono uppercase text-xs"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label font-semibold text-xs text-gray-700">Mô tả quyền hạn</label>
                <textarea
                  value={permForm.description}
                  onChange={(e) => setPermForm({ ...permForm, description: e.target.value })}
                  placeholder="Mô tả mục đích và phạm vi sử dụng của quyền này..."
                  className="textarea textarea-bordered w-full focus:border-blue-500 text-xs h-20"
                ></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPermModal(false)}
                  className="btn btn-sm btn-ghost"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingPerm}
                  className="btn btn-sm bg-[#3b82f6] hover:bg-blue-600 text-white border-none px-6"
                >
                  {savingPerm ? <span className="loading loading-spinner loading-xs"></span> : 'Lưu quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL PHÂN VAI TRÒ CHO NGƯỜI DÙNG ================= */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-800 text-base">Phân vai trò người dùng</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">{selectedUser.fullName || 'Người dùng'}</div>
                  <div className="text-xs text-gray-500">{selectedUser.email}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-xs text-gray-700">
                  Chọn các vai trò áp dụng cho người dùng này:
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50/40">
                  {roles.map((r) => {
                    const isChecked = assignedRoleIds.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50/80 border-blue-300'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setAssignedRoleIds((prev) =>
                                isChecked ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                              );
                            }}
                            className="checkbox checkbox-sm checkbox-primary"
                          />
                          <div>
                            <span className="font-bold text-xs text-gray-800">{r.name}</span>
                            {r.description && (
                              <p className="text-[11px] text-gray-500 mt-0.5">{r.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="badge badge-xs badge-ghost text-[10px]">
                          {r.permissions?.length || 0} quyền
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-sm btn-ghost"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignRoles}
                  disabled={savingAssign}
                  className="btn btn-sm bg-[#3b82f6] hover:bg-blue-600 text-white border-none px-6"
                >
                  {savingAssign ? <span className="loading loading-spinner loading-xs"></span> : 'Lưu phân quyền'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
