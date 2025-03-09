import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Product } from '@/types/types';
import axios from 'axios';
import { RootState } from './store';

interface CartState {
  items: { [key: string]: number };
  loading: boolean;
  error: string | null;
  isCartOpen: boolean;
  loadingItemId: string | null;
}

// Helper function to ensure cart items is an object
const ensureCartObject = (items: unknown): { [key: string]: number } => {
  if (typeof items === 'object' && items !== null) {
    return items as { [key: string]: number };
  }
  return {};
};

// Load initial state from localStorage if available
const loadInitialState = (): CartState => {
  if (typeof window === 'undefined') {
    return {
      items: {},
      loading: false,
      error: null,
      isCartOpen: false,
      loadingItemId: null
    };
  }

  try {
    const savedCart = localStorage.getItem('cart');
    const parsedCart = savedCart ? JSON.parse(savedCart) : {};
    return {
      items: ensureCartObject(parsedCart),
      loading: false,
      error: null,
      isCartOpen: false,
      loadingItemId: null
    };
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return {
      items: {},
      loading: false,
      error: null,
      isCartOpen: false,
      loadingItemId: null
    };
  }
};

const initialState: CartState = loadInitialState();

// Async thunks
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (product: Product, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/products/${product.id}`);
      const currentProduct = response.data;
      
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      return { productId: product.id, product: currentProduct };
    } catch (error) {
      return rejectWithValue('Failed to add product to cart');
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }: { productId: string; quantity: number }) => {
    return { productId, quantity };
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId: string) => {
    return productId;
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async () => {
    localStorage.removeItem('cart');
    return;
  }
);

export const finalizeOrder = createAsyncThunk(
  'cart/finalizeOrder',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const items = ensureCartObject(state.cart?.items);
      
      if (!items || Object.keys(items).length === 0) {
        throw new Error('Cart is empty');
      }

      // Get user info from localStorage
      const userDataStr = localStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      
      if (!userData || !userData.uid || !userData.email) {
        throw new Error('User not authenticated');
      }

      // Fetch all products in cart
      const cartItemPromises = Object.entries(items).map(async ([id, quantity]) => {
        try {
          const response = await axios.get(`/api/products/${id}`);
          const product = response.data;
          if (!product || !product.name || !product.price) {
            console.error(`Invalid product data for ${id}:`, product);
            return null;
          }
          return {
            productId: id,
            productName: product.name,
            quantity,
            price: product.price
          };
        } catch (error) {
          console.error(`Failed to fetch product ${id}:`, error);
          return null;
        }
      });

      const cartItems = await Promise.all(cartItemPromises);
      const validCartItems = cartItems.filter((item): item is NonNullable<typeof item> => 
        item !== null && 
        typeof item === 'object' &&
        'productId' in item &&
        'productName' in item &&
        'quantity' in item &&
        'price' in item
      );
      
      if (validCartItems.length === 0) {
        throw new Error('No valid items in cart');
      }

      const total = validCartItems.reduce((sum, item) => {
        const itemPrice = Number(item.price) || 0;
        const itemQuantity = Number(item.quantity) || 0;
        return sum + (itemPrice * itemQuantity);
      }, 0);

      // Create order in MongoDB
      const response = await axios.post('/api/orders', {
        userId: userData.uid,
        userEmail: userData.email,
        items: validCartItems,
        total,
        status: 'pending'
      });

      if (!response.data) {
        throw new Error('Failed to create order');
      }

      localStorage.removeItem('cart');
      return true;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create order');
    }
  }
);

// Helper function to save cart to localStorage
const saveCartToLocalStorage = (items: { [key: string]: number }) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cart', JSON.stringify(ensureCartObject(items)));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setIsCartOpen: (state, action) => {
      state.isCartOpen = action.payload;
    },
    setLoadingItemId: (state, action) => {
      state.loadingItemId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCart.pending, (state, action) => {
        state.loadingItemId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const { productId } = action.payload;
        state.items[productId] = (state.items[productId] || 0) + 1;
        state.loadingItemId = null;
        state.isCartOpen = true;
        state.error = null;
        saveCartToLocalStorage(state.items);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loadingItemId = null;
        state.error = action.payload as string;
      })
      
      // Update quantity
      .addCase(updateQuantity.pending, (state, action) => {
        state.loadingItemId = action.meta.arg.productId;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        const { productId, quantity } = action.payload;
        if (quantity > 0) {
          state.items[productId] = quantity;
        } else {
          delete state.items[productId];
        }
        state.loadingItemId = null;
        saveCartToLocalStorage(state.items);
      })
      
      // Remove from cart
      .addCase(removeFromCart.pending, (state, action) => {
        state.loadingItemId = action.meta.arg;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        delete state.items[action.payload];
        state.loadingItemId = null;
        saveCartToLocalStorage(state.items);
      })
      
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = {};
        localStorage.removeItem('cart');
      })
      
      // Finalize order
      .addCase(finalizeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(finalizeOrder.fulfilled, (state) => {
        state.items = {};
        state.loading = false;
        state.error = null;
        localStorage.removeItem('cart');
      })
      .addCase(finalizeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setIsCartOpen, setLoadingItemId } = cartSlice.actions;

// Selectors
export const selectCartItems = (state: RootState) => {
  try {
    return ensureCartObject(state.cart?.items);
  } catch (error) {
    console.error('Error in selectCartItems:', error);
    return {};
  }
};

export const selectCartItemCount = (state: RootState) => {
  try {
    const items = ensureCartObject(state.cart?.items);
    if (!items || Object.keys(items).length === 0) {
      return 0;
    }
    
    const quantities = Object.values(items);
    if (!Array.isArray(quantities)) {
      return 0;
    }

    return quantities.reduce((sum, quantity) => {
      const validQuantity = Number(quantity) || 0;
      return sum + validQuantity;
    }, 0);
  } catch (error) {
    console.error('Error in selectCartItemCount:', error);
    return 0;
  }
};

export const selectCartIsOpen = (state: RootState) => Boolean(state.cart?.isCartOpen);
export const selectLoadingItemId = (state: RootState) => state.cart?.loadingItemId || null;
export const selectCartError = (state: RootState) => state.cart?.error || null;
export const selectIsLoading = (state: RootState) => Boolean(state.cart?.loading);

export default cartSlice.reducer; 