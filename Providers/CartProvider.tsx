import Cart from '@/app/(tabs)/Cart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const CartContext = createContext({
  AddToCart: (item: any) => {},
  RemoveFromCart: (item: any) => {},
  CartItems: [] as any[],
});

export default function CartProvider({ children }: PropsWithChildren) {
  const [CartItems, setCartItems] = useState<any[]>([]);

  // 👉 Load cart from AsyncStorage when app starts
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('cartItems');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to load cart from storage', error);
      }
    };

    loadCart();
  }, []);

  const saveCartToStorage = async (items: any[]) => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to storage', error);
    }
  };

  const AddToCart = async (item: any) => {
    const existingItemIndex = CartItems.findIndex((i) => i.id === item.id);
    let updatedCartItems = [...CartItems];

    if (existingItemIndex !== -1) {
      updatedCartItems[existingItemIndex].quantity += item.MinimumOrderQuantity;
    } else {
      const newItem = { ...item, quantity: item.MinimumOrderQuantity };
      updatedCartItems.push(newItem);
    }

    setCartItems(updatedCartItems);
    saveCartToStorage(updatedCartItems);
  };

  const RemoveFromCart = async (item: any) => {
    const existingItemIndex = CartItems.findIndex((i) => i.id === item.id);
    if (existingItemIndex !== -1) {
      let updatedCartItems = [...CartItems];
      updatedCartItems[existingItemIndex].quantity -= item.MinimumOrderQuantity;
      if (updatedCartItems[existingItemIndex].quantity <= 0) {
        updatedCartItems.splice(existingItemIndex, 1);
      }

      setCartItems(updatedCartItems);
      saveCartToStorage(updatedCartItems);
    }
  };

  return (
    <CartContext.Provider value={{ AddToCart, RemoveFromCart, CartItems }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export const useCart = () => useContext(CartContext);
