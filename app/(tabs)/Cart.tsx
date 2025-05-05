import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/Providers/CartProvider';
import LottieView from 'lottie-react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/Providers/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';
import { useNetwork } from '@/Providers/NetworkProvider';

// Define proper interfaces
interface CartItem {
  _id: string;
  ProductImageURL: string;
  ProductName: string;
  Category: string;
  Price: number;
  quantity: number;
  qrCodeUrl?: string;
  MinimumOrderQuantity?: number;
  [key: string]: any; // For dynamic price keys
}

interface OrderResponse {
  message: string;
  order: {
    _id: string;
    status: string;
    userId: string;
    cartItems: any[];
    createdAt: string;
    __v: number;
  };
}

// Move this to a constants file for better organization
const CATEGORY_PRICE_MAP = {
  A: 'PriceA',
  B: 'PriceB',
  C: 'PriceC',
  D: 'PriceD',
};

export default function Cart() {
  // Navigation
  const navigation = useNavigation();
      const isConnected = useNetwork();
    
  // Use window dimensions for responsive design
  const { width, height } = useWindowDimensions();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [detailedCartItems, setDetailedCartItems] = useState<CartItem[]>([]);
  
  // Animation reference
  const successAnimation = useRef<LottieView>(null);
  
  // Providers
  const { data } = useAuth();
  const { CartItems, AddToCart, RemoveFromCart, deleteFromCart, clearCart } = useCart();
  
  // Parse user data safely
  const userData = typeof data === 'string' ? JSON.parse(data) : null;
  const userCategory = userData?.category as keyof typeof CATEGORY_PRICE_MAP;
  const userId = userData?._id;
  
  // Get the appropriate price key based on user category
  const priceKey = userCategory ? CATEGORY_PRICE_MAP[userCategory] : '';

  // No BackHandler setup - we'll rely on the Alert's native behavior

  // Calculate subtotal with memoization
  const calculateSubtotal = useCallback(() => {
    return detailedCartItems.reduce((total, item) => {
      const price = (item.Price || 0) + (item[priceKey] || 0);
      return total + price * item.quantity;
    }, 0);
  }, [detailedCartItems, priceKey]);

  // Navigate to home/products
  const navigateToProducts = () => {
    // @ts-ignore - Navigation typing is complex, simplified for this example
    navigation.navigate('Search');
  };

  // Handle order placement
  const handleOrderPlacement = async () => {
    if (!userId) {
      Alert.alert(
        "Error",
        "User ID is missing. Please log in again.",
        [{ text: "OK" }]
      );
      return;
    }

    if (detailedCartItems.length === 0) {
      Alert.alert(
        "Error",
        "Your cart is empty. Add items before placing an order.",
        [{ text: "OK" }]
      );
      return;
    }

    const orderDetails = {
      userId,
      items: detailedCartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: (item.Price || 0) + (item[priceKey] || 0)
      })),
      totalAmount: calculateSubtotal()
    };

    try {
      setIsLoading(true);
      
      const response = await axios.post<OrderResponse>(
        `${process.env.EXPO_PUBLIC_HOST}/order`, 
        { orderDetails }
      );
      
      console.log('Order placed successfully:', response.data);
      // setOrderId(response.data.order._id);
      
      // Clear cart after successful order using the clearCart function
      await clearCart();
      
      // Show success message using native Alert
      Alert.alert(
        "Order Placed!",
        `Your order #${response.data.order._id} has been successfully placed. We'll notify you once it's shipped.`,
        [
          { 
            text: "Continue Shopping", 
            onPress: navigateToProducts
          }
        ]
      );
      
      // Play success animation if available
      if (successAnimation.current) {
        successAnimation.current.play();
      }
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      Alert.alert(
        "Error",
        error.response?.data?.message || 'Failed to place order. Please try again.',
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm before deleting item
  const confirmDelete = (item: CartItem) => {
    if (Platform.OS === 'web') {
      // For web, use browser's confirm
      if (window.confirm(`Remove ${item.ProductName} from cart?`)) {
        deleteFromCart(item);
      }
    } else {
      // For mobile, use React Native Alert
      Alert.alert(
        "Remove Item",
        `Are you sure you want to remove ${item.ProductName} from your cart?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", onPress: () => deleteFromCart(item), style: "destructive" }
        ]
      );
    }
  };

  // Fetch cart details when CartItems changes
  useEffect(() => {
    const fetchCartDetails = async () => {
      if (CartItems.length === 0) {
        setDetailedCartItems([]);
        return;
      }

      try {
        setIsLoading(true);
        const productIds = CartItems.map(item => item.productId);
        const response = await axios.post(`${process.env.EXPO_PUBLIC_HOST}/details`, {
          itemIds: productIds,
        });

        const detailedData = response.data.map((item: any) => {
          const match = CartItems.find((c) => c.productId === item._id);
          return {
            ...item,
            quantity: match?.quantity || 1,
          };
        });

        setDetailedCartItems(detailedData);
      } catch (error) {
        console.error('Failed to fetch cart details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartDetails();
  }, [CartItems]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Render each cart item
  const renderItem = ({ item }: { item: CartItem }) => {
    const itemPrice = (item[priceKey] || 0) + (item.Price || 0);
    const itemTotal = itemPrice * item.quantity;
    
    return (
      <View style={[styles.cartItem, { width: width > 500 ? width * 0.8 : width - 32 }]}>
        <Image
          source={{ uri: item.ProductImageURL }}
          style={[styles.productImage, { width: width * 0.15, height: width * 0.15 }]}
          resizeMode="contain"
        />
        <View style={styles.productInfo}>
          <Text style={styles.title} numberOfLines={1}>{item.ProductName}</Text>
          <Text style={styles.subtitle}>{item.Category}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatCurrency(itemPrice)}
            </Text>
            {item.quantity > 1 && (
              <Text style={styles.totalPrice}>
                Total: {formatCurrency(itemTotal)}
              </Text>
            )}
          </View>
          <View style={styles.quantityControl}>
            <TouchableOpacity 
              onPress={() => RemoveFromCart(item)}
              disabled={isLoading}
              style={styles.quantityButton}
            >
              <Ionicons name="remove-circle-outline" size={24} color="#0d9488" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>
              {item.quantity.toString().padStart(2, '0')}
            </Text>
            <TouchableOpacity 
              onPress={() => AddToCart(item)}
              disabled={isLoading}
              style={styles.quantityButton}
            >
              <Ionicons name="add-circle-outline" size={24} color="#0d9488" />
            </TouchableOpacity>
          </View>
        </View>
        {item.qrCodeUrl && (
          <Image
            source={{ uri: item.qrCodeUrl }}
            style={styles.qrCodeImage}
            resizeMode="contain"
          />
        )}
        <TouchableOpacity 
          style={styles.deleteIcon} 
          onPress={() => confirmDelete(item)}
          disabled={isLoading}
        >
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  // Empty cart state
  if (CartItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyCartContainer}>
        <LottieView
          source={require('../../assets/animation/empty-cart.json')}
          autoPlay
          loop
          style={styles.emptyCartAnimation}
        />
        <Text style={styles.emptyCartText}>Your Cart is Empty!</Text>
        <TouchableOpacity 
          style={styles.continueShoppingButton}
          onPress={navigateToProducts}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Header with clear all button
  const CartHeader = () => (
    <View style={[styles.cartHeader, { width: width > 500 ? width * 0.8 : width - 32 }]}>
      <Text style={styles.cartTitle}>Shopping Cart ({CartItems.length})</Text>
      <TouchableOpacity 
        onPress={() => {
          if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to clear your cart?')) {
              clearCart();
            }
          } else {
            Alert.alert(
              "Clear Cart",
              "Are you sure you want to remove all items from your cart?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", onPress: () => clearCart(), style: "destructive" }
              ]
            );
          }
        }}
        disabled={isLoading}
        style={styles.clearCartButton}
      >
        <Text style={styles.clearCartText}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );

  // Order summary footer component
  const OrderSummary = () => (
    <View style={[styles.summary, { width: width > 500 ? width * 0.8 : width - 32 }]}>
      <Text style={styles.summaryTitle}>Order Summary</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Items ({detailedCartItems.length})</Text>
        <Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal())}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>{formatCurrency(calculateSubtotal())}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.placeOrderButton, 
          isLoading ? styles.disabledButton : {}
        ]} 
        onPress={handleOrderPlacement}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.placeOrderText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      )}
      
      <FlatList
        data={detailedCartItems}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.contentContainer,
          { alignItems: width > 500 ? 'center' : 'stretch' }
        ]}
        ListHeaderComponent={<CartHeader />}
        ListFooterComponent={<OrderSummary />}
      />

      {/* No AwesomeAlert component - using React Native's built-in Alert instead */}
      
      {/* Hidden success animation to pre-load */}
      <View style={{ width: 0, height: 0, overflow: 'hidden' }}>
        <LottieView
          ref={successAnimation}
          source={require('../../assets/animation/order-success.json')}
          autoPlay={false}
          loop={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16, // Extra padding for iOS
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearCartButton: {
    padding: 8,
  },
  clearCartText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
  qrCodeImage: {
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 8,
  },
  productImage: {
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#fff',
  },
  productInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  totalPrice: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    marginHorizontal: 12,
    fontWeight: '600',
    fontSize: 16,
  },
  deleteIcon: {
    marginLeft: 16,
    padding: 8,
  },
  summary: {
    marginTop: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 20,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#94a3b8',
  },
  placeOrderButton: {
    marginTop: 20,
    backgroundColor: '#0ea5e9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0369a1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 6px rgba(3, 105, 161, 0.2)',
      },
    }),
  },
  placeOrderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  emptyCartAnimation: {
    width: 300,
    height: 300,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 24,
    color: '#6b7280',
  },
  continueShoppingButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});