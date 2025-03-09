import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Order } from '@/types/types';
import { RootState } from '@/store/store';
import axios from '@/lib/axios';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId: string) => {
    const response = await axios.get(`/api/orders?userId=${userId}`);
    return response.data as Order[];
  }
);

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      });
  }
});

export default ordersSlice.reducer;

// Add selector
export const selectPendingOrders = (state: RootState) => 
  state.orders.items.filter(order => order.status === 'pending'); 