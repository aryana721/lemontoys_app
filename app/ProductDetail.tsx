import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '@/Providers/CartProvider';
import { useLocalSearchParams } from 'expo-router';
import { useNetwork } from '@/Providers/NetworkProvider';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const { item, userCategory } = useLocalSearchParams();
  const { AddToCart, CartItems, RemoveFromCart } = useCart();
    const isConnected = useNetwork();
  
  const category = userCategory;
  const ITEM = typeof item === 'string' ? JSON.parse(item) : item;
  const categoryPrice = ITEM[`price${category}`] || 0;
  const finalPrice = ITEM.price + categoryPrice;

  const cartItem = CartItems.find(cart => cart.productId === ITEM._id);
  const [quantity, setQuantity] = useState(cartItem?.quantity || 0);

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    } else {
      setQuantity(0);
    }
  }, [CartItems]);

  const handleAdd = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    AddToCart(ITEM);
  };

  const handleRemove = () => {
    if (quantity <= 1) {
      RemoveFromCart(ITEM);
      setQuantity(0);
    } else {
      const newQty = quantity - 1;
      setQuantity(newQty);
      RemoveFromCart(ITEM);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={ITEM.image} style={styles.image} resizeMode="cover" />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="black" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.name}>{ITEM.name}</Text>
        <Text style={styles.priceLabel}>
          Price: <Text style={styles.price}>₹{finalPrice}</Text>
        </Text>

        <Text style={styles.text}>Description:</Text>
        <Text style={styles.text}>{ITEM.Description}</Text>
        <Text style={styles.text}>Category: {ITEM.Category}</Text>

        <Text style={[styles.text, { marginTop: 10 }]}>Scan QR Code for Product Details:</Text>
        <Image source={{ uri: ITEM.qrCodeUrl }} style={styles.qrCode} />

        {quantity > 0 ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyButton} onPress={handleRemove}>
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{quantity}</Text>

            <TouchableOpacity style={styles.qtyButton} onPress={handleAdd}>
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => {
              AddToCart(ITEM);
              setQuantity(1);
            }}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: width, height: 300 },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -40,
  },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  priceLabel: { fontSize: 16 },
  price: { color: '#0095f6', fontWeight: 'bold' },
  text: { fontSize: 14, marginVertical: 4 },
  qrCode: { width: 100, height: 100, marginTop: 10 },
  cartButton: {
    backgroundColor: '#0095f6',
    padding: 12,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  cartButtonText: { color: '#fff', fontSize: 16, marginLeft: 10 },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#0095f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'center',
    backgroundColor: '#f0f8ff',
  },
  qtyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0095f6',
    marginHorizontal: 5,
  },
  qtyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: { marginHorizontal: 12, fontSize: 18 },
});
