import { createSlice } from '@reduxjs/toolkit';

const savedUser = localStorage.getItem('user');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    isInitialized: false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isInitialized = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.isInitialized = true; 
      localStorage.removeItem('user');
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    }
  }
});

export const { loginSuccess, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;