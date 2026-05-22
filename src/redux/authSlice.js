import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 1. REGISTER USER THUNK
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };
      const { data } = await axios.post("http://localhost:4000/api/users/register", userData, config);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 2. LOGIN USER THUNK
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };
      const { data } = await axios.post("http://localhost:4000/api/users/login", userData, config);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 3. UPDATE PROFILE THUNK
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.user.token}`,
        },
      };
      const { data } = await axios.put("http://localhost:4000/api/users/profile", userData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem("user");
      localStorage.removeItem("cartItems");
      state.user = null;
      state.error = null;
      state.successMessage = null;
      window.location.reload();
    },
    resetError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = "Registration successful";
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = "Login successful";
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutUser, resetError, resetSuccess } = authSlice.actions;
export default authSlice.reducer;