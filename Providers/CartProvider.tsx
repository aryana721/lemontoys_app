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

const CartContext = createContext({
  AddToCart: (item: any) => {},
  RemoveFromCart: (item: any) => {},
  CartItems: [] as any[],
  deleteFromCart: (item: any) => {},
});

export default function CartProvider({ children }: PropsWithChildren) {
  const [CartItems, setCartItems] = useState<any[]>([]);
  const { data } = useAuth();
  const Data = typeof data === 'string' ? JSON.parse(data) : data;
  const userId = Data?._id;


  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCartString = await AsyncStorage.getItem('cartItems');
        // console.log('storedCartString', storedCartString);
        if (storedCartString && storedCartString !== 'null') {
          try {
            setCartItems(JSON.parse(storedCartString));
          } catch (error) {
            console.error('Error parsing cart items from AsyncStorage', error);
          }
        }

        if (!userId) return;

        const response = await axios.get(`${process.env.EXPO_PUBLIC_HOST}/cart?userId=${userId}`);
        if (response.data && response.data !== null) {
          setCartItems(response.data);
          // console.log(CartItems)
          await AsyncStorage.setItem('cartItems', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };

    loadCart();
  }, [userId]);

  const saveCartToStorage = async (items: any[]) => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to storage', error);
    }
  };

  const AddToCart = async (item: any) => {
    try {
      if (!userId) throw new Error('User ID not available');
  
      const existingItemIndex = CartItems.findIndex(
        (i) => i.productId === item._id
      );
  
      let updatedCartItems = [...CartItems];
  
      if (existingItemIndex !== -1) {
        // Update local quantity
        updatedCartItems[existingItemIndex].quantity += item.MinimumOrderQuantity;
  
        setCartItems(updatedCartItems);
        saveCartToStorage(updatedCartItems);
        console.log("Itemsssssssssssssssssssssssssssssss",updatedCartItems[existingItemIndex].quantity)
        // Sync with backend
        await axios.post(`${process.env.EXPO_PUBLIC_HOST}/add-to-cart`, {
          userId,
          product: {
            ...item,
            quantity: updatedCartItems[existingItemIndex].quantity,
          },
        });
      } else {
        // Create in backend
        const response = await axios.post(`${process.env.EXPO_PUBLIC_HOST}/add-to-cart`, {
          userId,
          product: {
            ...item,
            quantity: item.MinimumOrderQuantity,
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
  
      await axios.post(`${process.env.EXPO_PUBLIC_HOST}/remove-from-cart`, {
        userId,
        productId: item._id,
      });
    } catch (error) {
      console.error('Failed to sync cart removal with backend', error);
    }
  };
  
  const deleteFromCart = async (item: any) => {
    try {
      if (!userId) throw new Error('User ID not available');
  
      const updatedCartItems = CartItems.filter((i) => i.productId !== item._id);
  
      setCartItems(updatedCartItems);
      saveCartToStorage(updatedCartItems);
  
      await axios.post(`${process.env.EXPO_PUBLIC_HOST}/remove-from-cart`, {
        userId,
        productId: item._id,
      });
    }
    catch (error) {
      console.error('Failed to delete from cart:', error);
    }
  };
  return (
    <CartContext.Provider value={{ AddToCart, RemoveFromCart, CartItems,deleteFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
