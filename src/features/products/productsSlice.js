import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";

// Async Thunks
export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (
        { page = 1, limit = 10, search = "", category = "", status = "" },
        { rejectWithValue }
    ) => {
        try {
            const params = { page, limit, search, category, status };
            const { data } = await axios.get("/api/products", { params });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch products");
        }
    }
);

export const createProduct = createAsyncThunk(
    "products/createProduct",
    async (productData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post("/api/products", productData);
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to create product");
        }
    }
);

export const deleteProduct = createAsyncThunk(
    "products/deleteProduct",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/products/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to delete product");
        }
    }
);

// Slice
const productsSlice = createSlice({
    name: "products",
    initialState: {
        list: [],
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 1,
        },
        loading: false,
        error: null,
        currentProduct: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
                state.pagination = action.payload.meta;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Product
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.list.unshift(action.payload); // Add strictly new product to top
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Product
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.list = state.list.filter((p) => p._id !== action.payload);
            });
    },
});

export const { clearError } = productsSlice.actions;
export default productsSlice.reducer;
