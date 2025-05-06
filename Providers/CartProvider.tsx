import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthProvider';

// Define proper types for cart context
interface CartItem {
  productId: string;
  quantity: number;
  [key: string]: any;
}

interface CartContextType {
  AddToCart: (item: any) => Promise<void>;
  RemoveFromCart: (item: any) => Promise<void>;
  deleteFromCart: (item: any) => Promise<void>;
  clearCart: () => Promise<void>;
  CartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  AddToCart: async () => {},
  RemoveFromCart: async () => {},
  deleteFromCart: async () => {},
  clearCart: async () => {},
  CartItems: [],
  setCartItems: () => {},
});

export default function CartProvider({ children }: PropsWithChildren) {
  const [CartItems, setCartItems] = useState<CartItem[]>([]);
  const { data } = useAuth();
  const Data = typeof data === 'string' ? JSON.parse(data) : data;
  const userId = Data?._id;

  // Load cart items on component mount or when userId changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        // First try to load from local storage
        const storedCartString = await AsyncStorage.getItem('cartItems');
        if (storedCartString && storedCartString !== 'null') {
          try {
            setCartItems(JSON.parse(storedCartString));
          } catch (error) {
            console.error('Error parsing cart items from AsyncStorage', error);
          }
        }

        // If user is logged in, fetch from server
        if (!userId) return;

        const response = await axios.get(`http://44.222.24.96:3001/cart?userId=${userId}`);
        if (response.data && response.data !== null) {
          setCartItems(response.data);
          await AsyncStorage.setItem('cartItems', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };

    loadCart();
  }, [userId]);

  // Save cart to AsyncStorage
  const saveCartToStorage = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to storage', error);
    }
  };

  // Add item to cart
  const AddToCart = async (item: any) => {
    try {
      if (!userId) throw new Error('User ID not available');
  
      const existingItemIndex = CartItems.findIndex(
        (i) => i.productId === item._id
      );
  
      let updatedCartItems = [...CartItems];
  
      if (existingItemIndex !== -1) {
        // Update local quantity
        updatedCartItems[existingItemIndex].quantity += item.MinimumOrderQuantity || 1;
  
        setCartItems(updatedCartItems);
        saveCartToStorage(updatedCartItems);
        
        // Sync with backend
        await axios.post(`http://44.222.24.96:3001/add-to-cart`, {
          userId,
          product: {
            ...item,
            quantity: updatedCartItems[existingItemIndex].quantity,
          },
        });
      } else {
        // Create in backend
        const response = await axios.post(`http://44.222.24.96:3001/add-to-cart`, {
          userId,
          product: {
            ...item,
            quantity: item.MinimumOrderQuantity || 1,
          },
        });
  
        const createdItem = response.data?.item;
  
        if (!createdItem) {
          throw new Error("No item returned from backend");
        }
  
        // Push only if not already present
        updatedCartItems.push(createdItem);
        setCartItems(updatedCartItems);
        saveCartToStorage(updatedCartItems);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };
  
  // Remove item from cart (reduce quantity)
  const RemoveFromCart = async (item: any) => {
    try {
      if (!userId) throw new Error('User ID not available');
  
      const existingItemIndex = CartItems.findIndex((i) => i.productId === item._id);
      if (existingItemIndex === -1) return;
  
      const updatedCartItems = [...CartItems];
      const currentItem = updatedCartItems[existingItemIndex];
      const quantityToRemove = item.MinimumOrderQuantity || 1;
  
      currentItem.quantity -= quantityToRemove;
  
      if (currentItem.quantity <= 0) {
        updatedCartItems.splice(existingItemIndex, 1);
      }
  
      setCartItems(updatedCartItems);
      saveCartToStorage(updatedCartItems);
  
      await axios.post(`http://44.222.24.96:3001/remove-from-cart`, {
        userId,
        productId: item._id,
        quantity: quantityToRemove,
      });
    } catch (error) {
      console.error('Failed to sync cart removal with backend', error);
    }
  };
  
  // Delete item completely from cart
  const deleteFromCart = async (item: any) => {
    try {
      if (!userId) throw new Error('User ID not available');
  
      const updatedCartItems = CartItems.filter((i) => i.productId !== item._id);
  
      setCartItems(updatedCartItems);
      saveCartToStorage(updatedCartItems);
  
      await axios.post(`http://44.222.24.96:3001/delete-from-cart`, {
        userId,
        productId: item._id,
      });
    } catch (error) {
      console.error('Failed to delete from cart:', error);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (!userId) {
        setCartItems([]);
        await AsyncStorage.removeItem('cartItems');
        return;
      }
      
      // Clear local cart
      setCartItems([]);
      await AsyncStorage.removeItem('cartItems');
      
      // Sync with backend
      await axios.post(`http://44.222.24.96:3001/clear-cart`, {
        userId,
      });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      
      // Even if backend sync fails, clear local cart
      setCartItems([]);
      await AsyncStorage.removeItem('cartItems');
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        AddToCart, 
        RemoveFromCart, 
        CartItems, 
        deleteFromCart, 
        clearCart, 
        setCartItems 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);