import { createSlice } from "@reduxjs/toolkit";

const getInitialUser = () => {
  const savedUser = localStorage.getItem("user");

  // Bỏ qua nếu không có dữ liệu hoặc dữ liệu là chuỗi 'undefined'
  if (!savedUser || savedUser === "undefined") {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    // Xóa ngay dữ liệu rác nếu parse lỗi
    console.log("Lỗi k parse dc user: ", error)
    localStorage.removeItem("user");
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getInitialUser(),
    isInitialized: false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isInitialized = true;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.isInitialized = true;
      localStorage.removeItem("user");
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { loginSuccess, logout, setInitialized, updateUser } = authSlice.actions;
export default authSlice.reducer;
