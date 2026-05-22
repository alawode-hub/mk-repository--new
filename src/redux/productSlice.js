import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProducts } from "../services/prodService";

// This fetches products from backend
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const data = await getProducts();
    return data;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true; // Show loading
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Save products
      });
  },
});

export default productSlice.reducer;