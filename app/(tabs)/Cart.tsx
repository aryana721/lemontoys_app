import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/Providers/CartProvider';
import LottieView from 'lottie-react-native'; // << New import

const { width } = Dimensions.get('window');

export default function Cart() {
  const { CartItems, AddToCart, RemoveFromCart } = useCart();

  const calculateSubtotal = () => {
    return CartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      {/* Product Image */}
      <Image
        source={{ uri: item.image.uri }}
        style={styles.productImage}
        resizeMode="contain"
      />
  
      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.category}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
  
        {/* Quantity Control */}
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={() => RemoveFromCart(item)}>
            <Ionicons name="remove-circle-outline" size={24} color="#0d9488" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>
            {item.quantity.toString().padStart(2, '0')}
          </Text>
          <TouchableOpacity onPress={() => AddToCart(item)}>
            <Ionicons name="add-circle-outline" size={24} color="#0d9488" />
          </TouchableOpacity>
        </View>
      </View>
  
      {/* QR Code Image */}
      <Image
        source={{ uri: item.qrCodeUrl }}
        style={styles.qrCodeImage}
        resizeMode="contain"
      />
  
      {/* Delete Icon */}
      <TouchableOpacity style={styles.deleteIcon} onPress={() => RemoveFromCart({ ...item, quantity: item.quantity })}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
  
  if (CartItems.length === 0) {
    return (
      <View style={styles.emptyCartContainer}>
        <LottieView
          source={require('../../assets/animation/empty-cart.json')}
          autoPlay
          loop
          style={styles.emptyCartAnimation}
        />
        <Text style={styles.emptyCartText}>Your Cart is Empty!</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={CartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text>Items</Text>
              <Text>{CartItems.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Subtotal</Text>
              <Text>₹{calculateSubtotal()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalText}>₹{calculateSubtotal()}</Text>
            </View>
            <TouchableOpacity style={styles.placeOrderButton}>
              <Text style={styles.placeOrderText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  qrCodeImage: {
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 8,
  },
  
  
  productImage: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginVertical: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityText: {
    marginHorizontal: 8,
    fontWeight: '600',
  },
  deleteIcon: {
    marginLeft: 8,
  },
  summary: {
    marginTop: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  totalText: {
    fontWeight: 'bold',
  },
  placeOrderButton: {
    marginTop: 16,
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    color: 'white',
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    color: '#6b7280',
  },
});
