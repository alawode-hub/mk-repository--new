import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice"; // We go create this later

export const store = configureStore({ // Add 'export' here
  reducer: {
    auth: authReducer, // For login/logout
    cart: cartReducer, // For cart items
  },
});

// Delete this line below:
// export default store;