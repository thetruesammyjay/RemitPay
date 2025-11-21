import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSolBalance } from '../../services/solana';

// Fetch Balance Thunk
export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (publicKeyStr, { rejectWithValue }) => {
    try {
      if (!publicKeyStr) throw new Error("No public key provided");
      const balance = await getSolBalance(publicKeyStr);
      return balance;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    publicKey: null,
    balance: 0,
    isConnected: false,
    loading: false,
    error: null,
  },
  reducers: {
    setWalletConnected: (state, action) => {
      state.isConnected = true;
      state.publicKey = action.payload;
    },
    setWalletDisconnected: (state) => {
      state.isConnected = false;
      state.publicKey = null;
      state.balance = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { setWalletConnected, setWalletDisconnected } = walletSlice.actions;

// CRITICAL: This default export is required for store/index.js
export default walletSlice.reducer;