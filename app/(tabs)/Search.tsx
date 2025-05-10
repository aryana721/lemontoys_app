import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, StatusBar, Platform, Dimensions, Modal, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/Providers/AuthProvider';
import axios from 'axios';
import { useCart } from '@/Providers/CartProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNetwork } from '@/Providers/NetworkProvider';
import { useTheme } from '@/Providers/ThemeProvider';

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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const isConnected = useNetwork();
  const theme = useTheme();
  const styles = getStyles(theme);

  const fetchProducts = async () => {
    if (!isConnected) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://lemontoys-server.vercel.app/products`);
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
      const category = await axios.get(`https://lemontoys-server.vercel.app/category`);
      setCategories(category.data.data);
      setProducts(mappedProducts);
      setFilteredProducts(mappedProducts);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isConnected]); // re-run when network state changes

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

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
                  <Ionicons name="remove-circle-outline" size={28} color={theme.primary} />
                </TouchableOpacity>
                <Text style={styles.counterText}>{quantity}</Text>
                <TouchableOpacity onPress={() => AddToCart(item)}>
                  <Ionicons name="add-circle-outline" size={28} color={theme.primary} />
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

  if (loading && !refreshing) {
    return <View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }

  if (error && !refreshing) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.background === '#FFFFFF' ? "dark-content" : "light-content"} backgroundColor={theme.background} />
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
          <Ionicons name="search" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Search here..."
            placeholderTextColor={theme.text || '#888'}
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
                        color={theme.primary}
                      />
                      <Text style={{ marginLeft: 10, color: theme.text }}>
                        {item}
                      </Text>
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
              placeholderTextColor={theme.text || '#888'}
              keyboardType="numeric"
              value={minPrice !== null ? String(minPrice) : ''}
              onChangeText={(text) => setMinPrice(text ? parseInt(text) : null)}
            />
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              placeholderTextColor={theme.text || '#888'}
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
          <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
              title="Pull to refresh"
              titleColor={theme.text}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = width / 2 - 24;

const getStyles = (theme: { background: string; text: string; primary: string; secondary: string; border: string; card: string; error: string; }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  errorText: {
    fontSize: 16,
    color: theme.error,
    textAlign: 'center',
    marginBottom: 10,
  },
  noInternetText: {
    fontSize: 16,
    color: theme.error,
    textAlign: 'center',
  },
  topSection: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 + 16 : 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    fontSize: 16,
    color: theme.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.secondary,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
    color: theme.text,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: theme.text,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  dropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: theme.secondary,
  },
  dropdownText: {
    color: theme.text,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.background,
    borderRadius: 10,
    padding: 20,
    maxHeight: '60%',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  applyButton: {
    backgroundColor: theme.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priceFilter: {
    flexDirection: 'row',
    flex: 1,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: theme.secondary,
    color: theme.text,
  },
  listContent: {
    padding: 8,
  },
  card: {
    width: CARD_WIDTH,
    margin: 8,
    backgroundColor: theme.card,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme.text,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 5,
  },
  productInfo: {
    fontSize: 12,
    color: theme.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  counterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});