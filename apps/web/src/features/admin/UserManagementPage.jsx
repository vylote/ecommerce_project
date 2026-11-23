import SearchField from "../../shared/ui/SearchField";
import Dialog from "../../shared/ui/Dialog";
import { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import Pagination from '../../shared/components/Pagination';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, pageSize: 10, email: '' });
  const { page, pageSize } = query;
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  // Modal xác nhận khóa/mở khóa
  const [confirmUser, setConfirmUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadUsers() {
      try {
        const res = await api.get('/users', {
          params: {
            page: query.page,
            size: query.pageSize,
            email: query.email || undefined,
          },
          signal,
        });
        if (signal.aborted) return;

        const data = res.data.result;
        const list = data.data || [];
        setUsers(list);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.totalElements ?? list.length);
      } catch {
        if (!signal.aborted) toast.error('Không thể tải danh sách người dùng');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }

    void loadUsers();
    return () => controller.abort();
  }, [query]);

  function updateQuery(changes) {
    setLoading(true);
    setQuery((current) => ({ ...current, ...changes }));
  }

  // Đóng modal bằng phím Esc
  useEffect(() => {
    if (!confirmUser) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !actionLoading) setConfirmUser(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmUser, actionLoading]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateQuery({ page: 1, email: searchInput });
  };

  const closeConfirm = () => {
    if (actionLoading) return;
    setConfirmUser(null);
  };

  const handleConfirmToggle = async () => {
    if (!confirmUser) return;
    const action = confirmUser.isActive ? 'Khóa' : 'Mở khóa';

    setActionLoading(true);
    try {
      await api.patch(`/users/${confirmUser.id}/status`);
      toast.success(`${action} tài khoản thành công!`);
      setConfirmUser(null);
      updateQuery({});
    } catch {
      toast.error(`Lỗi khi ${action.toLowerCase()} tài khoản`);
    } finally {
      setActionLoading(false);
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
          <SearchField value={searchInput} onChange={setSearchInput} placeholder="Tìm kiếm theo email..." />
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
                      onClick={() => setConfirmUser(u)}
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

      {!loading && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalUsers}
            pageSize={pageSize}
            onPageChange={(nextPage) => updateQuery({ page: nextPage })}
            onPageSizeChange={(newSize) => updateQuery({ page: 1, pageSize: newSize })}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>
      )}

      {/* Modal xác nhận khóa / mở khóa */}
      {confirmUser && (
        <Dialog title={confirmUser.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} onClose={closeConfirm} size="sm" busy={actionLoading} closeOnBackdrop>
          <div className="p-6">
          <p className="py-4 text-sm text-gray-600">
            Bạn có chắc chắn muốn {confirmUser.isActive ? 'khóa' : 'mở khóa'} tài khoản{' '}
            <span className="font-semibold text-gray-800">{confirmUser.email}</span>?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-sm btn-ghost"
              onClick={closeConfirm}
              disabled={actionLoading}
            >
              Hủy
            </button>
            <button
              className={`btn btn-sm text-white border-0 ${
                confirmUser.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
              onClick={handleConfirmToggle}
              disabled={actionLoading}
            >
              {actionLoading && <span className="loading loading-spinner loading-xs"></span>}
              {confirmUser.isActive ? 'Khóa' : 'Mở khóa'}
            </button>
          </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}