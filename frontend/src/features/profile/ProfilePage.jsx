import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../../shared/utils/api";
import Navbar from "../../shared/components/Navbar";
import ProfileSidebar from "./ProfileSidebar";
import { updateUser } from "../../store/slice/authSlice";
import UserAvatar from "../../shared/components/UserAvatar";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(""); // chỉ cho ảnh blob mới chọn
  const [saving, setSaving] = useState(false);


  // Dọn blob URL khi đổi ảnh hoặc unmount (effect này đồng bộ với hệ thống ngoài nên hợp lệ)
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Chỉ hỗ trợ định dạng .JPEG, .PNG");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("Dung lượng file tối đa là 1MB");
      return;
    }
    setAvatarFile(file);
    setLocalPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        "request",
        new Blob([JSON.stringify({ fullName, phone })], {
          type: "application/json",
        }),
      );
      if (avatarFile) formData.append("file", avatarFile);

      const res = await api.put("/users/profile", formData);

      const updated = res.data?.result ?? res.data;
      dispatch(updateUser(updated));
      setAvatarFile(null);
      setLocalPreview(""); // quay về dùng avatarUrl từ Redux (URL Cloudinary mới)

      toast.success("Cập nhật hồ sơ thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-10">
      <Navbar />
      <div className="max-w-[1200px] mx-auto py-6 flex gap-5">
        <ProfileSidebar />

        <div className="flex-1 bg-white rounded-sm shadow-sm p-8">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-xl font-medium text-gray-800">Hồ sơ của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin hồ sơ để bảo mật tài khoản
            </p>
          </div>

          <div className="flex gap-10">
            {/* Form */}
            <div className="flex-1 pr-10 border-r border-gray-100">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center">
                  <label className="w-32 text-right pr-5 text-sm text-gray-500">
                    Email
                  </label>
                  <div className="text-sm font-medium text-gray-800">
                    {user?.email || "Chưa cập nhật"}
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="w-32 text-right pr-5 text-sm text-gray-500">
                    Tên
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-32 text-right pr-5 text-sm text-gray-500">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <div className="w-32 pr-5"></div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#ee4d2d] hover:bg-[#d73211] text-white px-8 py-2 rounded-sm text-sm font-medium disabled:opacity-70 transition-colors"
                  >
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </form>
            </div>

            {/* Upload Avatar */}
            <div className="w-64 shrink-0 flex flex-col items-center justify-start pt-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 mb-5 bg-gray-100">
                <UserAvatar
                  user={user}
                  src={localPreview}
                  className="w-full h-full"
                />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm rounded-sm hover:bg-gray-50 transition-colors"
              >
                Chọn Ảnh
              </button>

              <div className="text-gray-400 text-xs mt-4 text-center leading-relaxed">
                Dụng lượng file tối đa 1 MB <br />
                Định dạng: .JPEG, .PNG
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
