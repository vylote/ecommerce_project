import React, { useState, useEffect } from 'react';
import { Search, Lock, Unlock, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: {
          page: page,
          size: 10,
          email: searchQuery || undefined
        }
      });
      const data = res.data.result;
      setUsers(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'Khóa' : 'Mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản ${user.email}?`)) return;

    try {
      await api.patch(`/users/${user.id}/status`);
      toast.success(`${action} tài khoản thành công!`);
      fetchUsers();
    } catch (error) {
      toast.error(`Lỗi khi ${action.toLowerCase()} tài khoản`);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full animate-fade-in p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldAlert className="text-blue-500" />
          Quản lý người dùng
        </h2>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-[300px]">
          <input 
            type="text" 
            placeholder="Tìm kiếm theo email..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input input-bordered input-sm w-full pl-9 focus:border-blue-500"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </form>
      </div>

      <div className="overflow-x-auto w-full border border-gray-100 rounded-lg">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Người dùng</th>
              <th className="px-5 py-4">SĐT</th>
              <th className="px-5 py-4">Vai trò</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10"><span className="loading loading-spinner text-blue-500"></span></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-gray-500">Không tìm thấy người dùng nào</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">{u.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 rounded-full border border-gray-200">
                           <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || 'User')}`} alt="Avatar" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{u.fullName}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{u.phone || 'Chưa cập nhật'}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles?.map((r, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded">
                          {r.name.replace('ROLE_', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {u.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Hoạt động</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Bị Khóa</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button 
                      onClick={() => handleToggleStatus(u)}
                      className={`btn btn-sm btn-ghost ${u.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                      title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                    >
                      {u.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <div className="join gap-1">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="join-item btn btn-sm bg-white border-gray-300">«</button>
            <button className="join-item btn btn-sm bg-blue-500 text-white border-blue-500 hover:bg-blue-600">{page}</button>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="join-item btn btn-sm bg-white border-gray-300">»</button>
          </div>
        </div>
      )}
    </div>
  );
}
