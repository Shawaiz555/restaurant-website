import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
};

const initialState = {
  currentUser: getStoredUser(),
  isAuthenticated: !!getStoredUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('currentUser', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('currentUser');
    },
    updateUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
