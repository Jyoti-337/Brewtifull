'use client';

import React, { createContext, useContext, useReducer, ReactNode, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string; size?: string } }
  | { type: 'UPDATE_QTY'; payload: { id: string; size?: string; quantity: number } }
  | { type: 'CLEAR' };

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const computeTotals = (items: CartItem[]) => {
  return items.reduce(
    (totals, item) => {
      const validQty = Math.max(0, Math.min(99, Math.floor(item.quantity || 0)));
      const validPrice = Math.max(0, item.price || 0);
      totals.totalItems += validQty;
      totals.totalPrice += validPrice * validQty;
      return totals;
    },
    { totalItems: 0, totalPrice: 0 }
  );
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS': {
      const sanitized = action.payload.map((item) => ({
        ...item,
        quantity: Math.max(1, Math.min(99, Math.floor(item.quantity || 1))),
      }));
      return {
        items: sanitized,
        ...computeTotals(sanitized),
      };
    }
    case 'ADD_ITEM': {
      const addQty = Math.max(1, Math.min(99, Math.floor(action.payload.quantity || 1)));
      const existingIndex = state.items.findIndex(
        (i) => i.id === action.payload.id && i.size === action.payload.size
      );

      let newItems = [...state.items];
      if (existingIndex >= 0) {
        const currentQty = newItems[existingIndex].quantity;
        const nextQty = Math.min(99, currentQty + addQty);
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: nextQty,
        };
      } else {
        newItems.push({
          ...action.payload,
          quantity: addQty,
        });
      }

      return {
        ...state,
        items: newItems,
        ...computeTotals(newItems),
      };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        (i) => !(i.id === action.payload.id && i.size === action.payload.size)
      );
      return {
        ...state,
        items: newItems,
        ...computeTotals(newItems),
      };
    }
    case 'UPDATE_QTY': {
      const targetQty = Math.floor(action.payload.quantity);
      let newItems: CartItem[];

      if (targetQty <= 0) {
        newItems = state.items.filter(
          (i) => !(i.id === action.payload.id && i.size === action.payload.size)
        );
      } else {
        const safeQty = Math.min(99, targetQty);
        newItems = state.items.map((i) => {
          if (i.id === action.payload.id && i.size === action.payload.size) {
            return { ...i, quantity: safeQty };
          }
          return i;
        });
      }

      return {
        ...state,
        items: newItems,
        ...computeTotals(newItems),
      };
    }
    case 'CLEAR':
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: session } = useSession();
  const hasSyncedDbRef = useRef(false);

  // 1. Initial Load: Load local guest cart on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('brewtiful_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'SET_ITEMS', payload: parsed });
        }
      }
    } catch (e) {
      console.error('Error reading localStorage cart:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Persist local state changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('brewtiful_cart', JSON.stringify(state.items));
    }
  }, [state.items, isLoaded]);

  // 3. User Authentication Sync (Runs ONCE when session becomes available)
  useEffect(() => {
    if (!session?.user || !isLoaded || hasSyncedDbRef.current) return;
    hasSyncedDbRef.current = true;

    async function syncOnLogin() {
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            // DB has cart items -> use DB cart as source of truth
            dispatch({ type: 'SET_ITEMS', payload: data.items });
          } else if (state.items.length > 0) {
            // DB cart empty but user had guest cart -> push guest cart to DB
            const postRes = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: state.items.map((i) => ({ id: i.id, quantity: i.quantity, size: i.size })),
              }),
            });
            if (postRes.ok) {
              const postData = await postRes.json();
              if (postData.items) dispatch({ type: 'SET_ITEMS', payload: postData.items });
            }
          }
        }
      } catch (err) {
        console.error('Error syncing cart with DB on login:', err);
      }
    }

    syncOnLogin();
  }, [session, isLoaded]);

  // Sync helper for user cart actions
  const syncCartToDb = (newItems: CartItem[]) => {
    if (!session?.user) return;
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: newItems.map((i) => ({ id: i.id, quantity: i.quantity, size: i.size })),
      }),
    }).catch((err) => console.error('Failed to sync updated cart to DB:', err));
  };

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    const existingIndex = state.items.findIndex((i) => i.id === item.id && i.size === item.size);
    let nextItems = [...state.items];
    const addQty = Math.max(1, item.quantity || 1);
    if (existingIndex >= 0) {
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        quantity: Math.min(99, nextItems[existingIndex].quantity + addQty),
      };
    } else {
      nextItems.push({ ...item, quantity: addQty });
    }
    syncCartToDb(nextItems);
  };

  const removeItem = (id: string, size?: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size } });
    const nextItems = state.items.filter((i) => !(i.id === id && i.size === size));
    syncCartToDb(nextItems);
  };

  const updateQuantity = (id: string, quantity: number, size?: string) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, size, quantity } });
    const targetQty = Math.floor(quantity);
    let nextItems: CartItem[];
    if (targetQty <= 0) {
      nextItems = state.items.filter((i) => !(i.id === id && i.size === size));
    } else {
      nextItems = state.items.map((i) => (i.id === id && i.size === size ? { ...i, quantity: Math.min(99, targetQty) } : i));
    }
    syncCartToDb(nextItems);
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR' });
    if (session?.user) {
      fetch('/api/cart', { method: 'DELETE' }).catch((err) => console.error('Failed to clear DB cart:', err));
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
