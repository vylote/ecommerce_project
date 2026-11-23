import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import { logout } from "../../store/slice/authSlice";

export default function usePortalLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return async function handleLogout() {
    try {
      await api.post("/auth/logout").catch(() => {});
      dispatch(logout());
      toast.success("Đã đăng xuất thành công");
      navigate("/login");
    } catch {
      toast.error("Lỗi khi đăng xuất");
    }
  };
}
