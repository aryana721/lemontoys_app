import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, StatusBar, Platform, Dimensions, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/Providers/AuthProvider';
import axios from 'axios';
import { useCart } from '@/Providers/CartProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNetwork } from '@/Providers/NetworkProvider';

const { width } = Dimensions.get('window');
const categoryPriceMap = {
  A: 'priceA',
  B: 'priceB',
  C: 'priceC',
  D: 'priceD',
};

export default function TabTwoScreen() {
  const { data } = useAuth();
  const { AddToCart, RemoveFromCart, CartItems } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const isConnected = useNetwork();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isConnected) return;
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${process.env.EXPO_PUBLIC_HOST}/products`);
        const mappedProducts = response.data.data.map((product: any) => ({
          _id: product._id,
          name: product.ProductName,
          price: product.Price,
          image: { uri: product.ProductImageURL },
          MinimumOrderQuantity: product.MinimumOrderQuantity,
          priceA: product.PriceA,
          priceB: product.PriceB,
          priceC: product.PriceC,
          priceD: product.PriceD,
          Category: product.Category,
          PriceType: product.PriceType,
          ProductOwner: product.ProductOwner,
          ProductDescription: product.ProductDescription,
          qrCodeUrl: product.qrCodeUrl,
        }));
        const category = await axios.get(`${process.env.EXPO_PUBLIC_HOST}/category`);
        setCategories(category.data.data);
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isConnected]); // re-run when network state changes

  useEffect(() => {
    const filterProducts = () => {
      let filtered = [...products];
      if (searchQuery) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (minPrice !== null) {
        filtered = filtered.filter((product) => product.price >= minPrice);
      }
      if (maxPrice !== null) {
        filtered = filtered.filter((product) => product.price <= maxPrice);
      }
      if (selectedCategories.length > 0) {
        filtered = filtered.filter((product) =>
          selectedCategories.includes(product.Category)
        );
      }
      setFilteredProducts(filtered);
    };

    filterProducts();
  }, [searchQuery, minPrice, maxPrice, selectedCategories, products]);

  const renderItem = ({ item }: any) => {
    const cartItem = Array.isArray(CartItems)
      ? CartItems.find((cartItem) => cartItem.productId === item._id)
      : undefined;
    const quantity = cartItem?.quantity || 0;

    const userCategory = typeof data === 'string' ? JSON.parse(data).category as keyof typeof categoryPriceMap : undefined;
    const priceKey = userCategory ? categoryPriceMap[userCategory] : '';
    let dynamicPrice = item[priceKey] + item.price;
    if (isNaN(dynamicPrice) || dynamicPrice === undefined || dynamicPrice === null) {
      dynamicPrice = item.price;
    }

    return (
      <TouchableOpacity onPress={() => router.push({
        pathname: '/ProductDetail',
        params: {
          item: JSON.stringify(item),
          userCategory,
        },
      })}>
        <SafeAreaView style={styles.card}>
          <Image source={item.image} style={styles.productImage} />
          <View style={styles.infoContainer}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>₹{dynamicPrice}</Text>
            <Text style={styles.productInfo}>Minimum Order Quantity: {item.MinimumOrderQuantity}</Text>

            {quantity === 0 ? (
              <TouchableOpacity style={styles.button} onPress={() => AddToCart(item)}>
                <Text style={styles.buttonText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.counterContainer}>
                <TouchableOpacity onPress={() => RemoveFromCart(item)}>
                  <Ionicons name="remove-circle-outline" size={28} color="#084C61" />
                </TouchableOpacity>
                <Text style={styles.counterText}>{quantity}</Text>
                <TouchableOpacity onPress={() => AddToCart(item)}>
                  <Ionicons name="add-circle-outline" size={28} color="#084C61" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.noInternetText}>No Internet Connection</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#084C61" /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.topSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
          <Image
            source={require('../../assets/images/user2.gif')}
            style={styles.avatar}
            defaultSource={require('../../assets/images/avatar-placeholder.jpg')}
          />
          <Text style={styles.greeting}>
            Hello! <Text style={{ fontWeight: 'bold' }}>{typeof data === 'string' ? JSON.parse(data).name : 'Guest'}</Text>
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder="Search here..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownVisible(true)}>
            <Text style={styles.dropdownText}>
              {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Select Categories'}
            </Text>
          </TouchableOpacity>

          <Modal visible={isDropdownVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={categories}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.categoryItem} onPress={() => toggleCategory(item)}>
                      <Ionicons
                        name={selectedCategories.includes(item) ? 'checkbox-outline' : 'square-outline'}
                        size={24}
                        color="#084C61"
                      />
                      <Text style={{ marginLeft: 10 }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity style={styles.applyButton} onPress={() => setDropdownVisible(false)}>
                  <Text style={styles.applyButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.priceFilter}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              keyboardType="numeric"
              value={minPrice !== null ? String(minPrice) : ''}
              onChangeText={(text) => setMinPrice(text ? parseInt(text) : null)}
            />
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              keyboardType="numeric"
              value={maxPrice !== null ? String(maxPrice) : ''}
              onChangeText={(text) => setMaxPrice(text ? parseInt(text) : null)}
            />
          </View>
        </View>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>No products found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = width / 2 - 24;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: '#e9ecef',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  noInternetText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  topSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  greeting: {
    fontSize: 18,
    marginVertical: 10,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dropdown: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  categoryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    width: 70,
    height: 40,
  },
  applyButton: {
    backgroundColor: '#084C61',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    margin: 7,
    borderRadius: 12,
    overflow: 'hidden',
    width: CARD_WIDTH,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  infoContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#084C61',
    marginBottom: 5,
  },
  productInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#084C61',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  counterText: {
    fontSize: 16,
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: '#084C61',
  },
});
