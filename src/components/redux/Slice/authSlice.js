import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log("authslice");
      console.log(action.payload);
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      console.log("token", token);
      console.log("user", user);
    },
    // logout: (state) => {
    //   state.user = null;
    //   state.token = null;
    // },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
