import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch recent transactions
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transactions?page=${page}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Create new transaction record (called after blockchain success)
export const recordTransaction = createAsyncThunk(
  'transactions/record',
  async (txData, { rejectWithValue }) => {
    try {
      const response = await api.post('/transactions', txData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record transaction');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    list: [],
    currentTransaction: null,
    pagination: { page: 1, total: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload; // Handle pagination structure
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Record Transaction
      .addCase(recordTransaction.fulfilled, (state, action) => {
        state.list.unshift(action.payload); // Add new tx to top of list
        state.currentTransaction = action.payload;
      });
  },
});

export const { clearTransactionError } = transactionSlice.actions;
export default transactionSlice.reducer;