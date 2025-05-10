import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useNetwork } from '@/Providers/NetworkProvider';
import { useTheme } from '@/Providers/ThemeProvider';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const { item, userCategory } = useLocalSearchParams();
  const isConnected = useNetwork();
  const theme = useTheme();
  
  const category = userCategory;
  const ITEM = typeof item === 'string' ? JSON.parse(item) : item;
  const categoryPrice = ITEM[`price${category}`] || 0;
  const finalPrice = ITEM.price + categoryPrice;

  // Handle sharing the QR code URL
  const shareQRCode = async () => {
    try {
      const result = await Share.share({
        message: `Check out product : https://lemontoys.co.in/toydetails/${ITEM._id}`, // Android only
        url: ITEM.qrCodeUrl, // iOS only
        title: `${ITEM.name} QR Code`,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', (error as Error).message);
    }
  };

  // Create styles with the theme
  const dynamicStyles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: theme.background 
    },
    content: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 20,
      marginTop: -40,
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    name: { 
      fontSize: 24, 
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    badge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    badgeText: {
      color: '#fff',
      fontWeight: '500',
      fontSize: 12,
    },
    priceContainer: {
      backgroundColor: theme.secondary,
      borderRadius: 15,
      padding: 12,
      marginTop: 10,
      marginBottom: 20,
    },
    priceLabel: { 
      fontSize: 16,
      color: theme.text,
      marginBottom: 4,
    },
    price: { 
      color: theme.text, 
      fontWeight: 'bold',
      fontSize: 22,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 8,
      color: theme.text,
    },
    descriptionText: { 
      fontSize: 15, 
      lineHeight: 22,
      color: theme.text, 
    },
    detailRow: {
      flexDirection: 'row',
      marginVertical: 8,
      alignItems: 'center',
    },
    detailLabel: {
      width: 100,
      fontSize: 14,
      color: theme.text,
      opacity: 0.7,
    },
    detailValue: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
    },
    qrContainer: {
      marginTop: 25,
      alignItems: 'center',
      padding: 15,
      backgroundColor: theme.secondary,
      borderRadius: 20,
    },
    qrLabel: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 15,
      textAlign: 'center',
    },
    backButton: { 
      position: 'absolute', 
      top: 40, 
      left: 20, 
      zIndex: 10,
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: 20,
      padding: 5,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 15,
    },
    shareButton: {
      backgroundColor: theme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginTop: 15,
    },
    shareButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
    qrWrapper: {
      marginBottom: 10,
    }
  });

  return (
    <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
      <Image source={ITEM.image} style={styles.image} resizeMode="cover" />

      <TouchableOpacity style={dynamicStyles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={theme.primary} />
      </TouchableOpacity>

      <View style={dynamicStyles.content}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.name}>{ITEM.name}</Text>
          <View style={dynamicStyles.badge}>
            <Text style={dynamicStyles.badgeText}>{ITEM.Category}</Text>
          </View>
        </View>

        <View style={dynamicStyles.priceContainer}>
          <Text style={dynamicStyles.priceLabel}>Price </Text>
          <Text style={dynamicStyles.price}>₹{finalPrice}</Text>
          
        </View>

        <Text style={dynamicStyles.sectionTitle}>Description</Text>
        <Text style={dynamicStyles.descriptionText}>{ITEM.Description}</Text>

        <View style={dynamicStyles.divider} />

        <Text style={dynamicStyles.sectionTitle}>Product Details</Text>
        
        <View style={dynamicStyles.detailRow}>
          <Text style={dynamicStyles.detailLabel}>ID</Text>
          <Text style={dynamicStyles.detailValue}>{ITEM._id}</Text>
        </View>

        <View style={dynamicStyles.detailRow}>
          <Text style={dynamicStyles.detailLabel}>Category</Text>
          <Text style={dynamicStyles.detailValue}>{ITEM.Category}</Text>
        </View>

        {ITEM.Specifications && (
          <View style={dynamicStyles.detailRow}>
            <Text style={dynamicStyles.detailLabel}>Specifications</Text>
            <Text style={dynamicStyles.detailValue}>{ITEM.Specifications}</Text>
          </View>
        )}

        {ITEM.Brand && (
          <View style={dynamicStyles.detailRow}>
            <Text style={dynamicStyles.detailLabel}>Brand</Text>
            <Text style={dynamicStyles.detailValue}>{ITEM.Brand}</Text>
          </View>
        )}

        {ITEM.Weight && (
          <View style={dynamicStyles.detailRow}>
            <Text style={dynamicStyles.detailLabel}>Weight</Text>
            <Text style={dynamicStyles.detailValue}>{ITEM.Weight}</Text>
          </View>
        )}

        {ITEM.Availability !== undefined && (
          <View style={dynamicStyles.detailRow}>
            <Text style={dynamicStyles.detailLabel}>Availability</Text>
            <Text style={dynamicStyles.detailValue}>
              {ITEM.Availability ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        )}

        {!isConnected && (
          <View style={dynamicStyles.detailRow}>
            <Text style={[dynamicStyles.detailValue, {color: theme.error}]}>
              Currently offline. Some features may be limited.
            </Text>
          </View>
        )}

        <View style={dynamicStyles.qrContainer}>
          <Text style={dynamicStyles.qrLabel}>Scan QR Code for Additional Information</Text>
          
          <View style={dynamicStyles.qrWrapper}>
            <Image source={{ uri: ITEM.qrCodeUrl }} style={styles.qrCode} />
          </View>
          
          <TouchableOpacity 
            style={dynamicStyles.shareButton}
            onPress={shareQRCode}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={dynamicStyles.shareButtonText}>Share </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Keep static styles separate
const styles = StyleSheet.create({
  image: { width: width, height: 300 },
  qrCode: { width: 120, height: 120 },
});