import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useNavigation } from "expo-router";
import * as Sharing from 'expo-sharing';
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  GestureResponderEvent,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import ViewShot from "react-native-view-shot";
import { PhotoData, usePhotoContext } from "../context/PhotoContext";
import { useTabBarVisibilityContext } from "../context/TabBarVisibilityContext";
const width = Dimensions.get("window").width;
const COLUMN_COUNT = 2;
const SPACING = 12;
const CARD_WIDTH = (width - (COLUMN_COUNT + 1) * SPACING) / COLUMN_COUNT;

// Animated Photo Card Component
const AnimatedPhotoCard = ({ photo, onPress, onLongPress, isSelected, actionMode }: {
  photo: PhotoData;
  onPress: () => void;
  onLongPress: () => void;
  isSelected: boolean;
  actionMode: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [imageHeight, setImageHeight] = useState(200);

  useEffect(() => {
    // Fade in animation when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Scale in animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Calculate image aspect ratio for masonry effect
    Image.getSize(photo.uri, (w, h) => {
      const aspectRatio = h / w;
      const calculatedHeight = CARD_WIDTH * aspectRatio;
      // Clamp height between 150 and 300 for better layout
      setImageHeight(Math.max(150, Math.min(300, calculatedHeight)));
    });
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.photoCard,
          {
            width: CARD_WIDTH,
            height: imageHeight,
            borderWidth: isSelected ? 3 : 0,
            borderColor: isSelected ? "#34C759" : "transparent",
            opacity: actionMode && !isSelected ? 0.5 : 1,
          }
        ]}
      >
        <View style={styles.gradientBorder}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.cardOverlay} />
          {photo.address && (
            <View style={styles.addressTag}>
              <Ionicons name="location" size={12} color="white" />
              <Text style={styles.addressText} numberOfLines={1}>
                {photo.address}
              </Text>
            </View>
          )}
          {actionMode && isSelected && (
            <View style={styles.selectedTick}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const Gallery = () => {
  const { photos, saveToGallery, deletePhoto } = usePhotoContext();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [actionMode, setActionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'location' | 'weather'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'thisMonth' | 'thisYear'>('all');
  const { hideTabBar, showTabBar } = useTabBarVisibilityContext();
  const { photoId } = useLocalSearchParams<{ photoId?: string }>();
  const navigation = useNavigation();

  // For swipe detection
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Reference for screenshot capture
  const viewShotRef = useRef<ViewShot>(null);

  // Reset selection when navigating away
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setActionMode(false);
      setSelectedIds([]);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (selectedPhoto) {
      hideTabBar();
    } else {
      showTabBar();
    }
  }, [selectedPhoto]);

  useEffect(() => {
    if (photoId) {
      handleSelectPhoto(photoId);
    }
  }, [photoId]);

  // NAVIGATION
  const goToPhoto = (idx: number) => {
    if (idx >= 0 && idx < photos.length) {
      setSelectedIndex(idx);
      setSelectedPhoto(photos[idx].id);
    }
  };

  const nextPhoto = () => goToPhoto(selectedIndex + 1);
  const prevPhoto = () => goToPhoto(selectedIndex - 1);

  // SIMPLE SWIPE HANDLERS
  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    touchEndX.current = e.nativeEvent.pageX;
    handleSwipe();
  };

  const handleSwipe = () => {
    // Minimum distance for swipe
    const minSwipeDistance = 50;
    const swipeDistance = touchEndX.current - touchStartX.current;

    if (swipeDistance > minSwipeDistance) {
      // Swiped right → go to previous photo
      prevPhoto();
    } else if (swipeDistance < -minSwipeDistance) {
      // Swiped left → go to next photo
      nextPhoto();
    }
  };

  // Updated share function to capture screenshot
  const handleSharePhoto = async () => {
    try {
      if (!viewShotRef.current || !viewShotRef.current.capture) {
        Alert.alert("Error", "Unable to capture screenshot");
        return;
      }

      // Capture the screenshot
      const uri = await viewShotRef.current.capture();

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      // Share the screenshot
      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share your memory'
      });

    } catch (error) {
      console.error('Error sharing screenshot:', error);
      Alert.alert("Error", "Unable to share screenshot");
    }
  };

  const handleSaveToDevice = async (photoId: string) => {
    setLoading(true);
    try {
      const success = await saveToGallery(photoId);
      if (success) {
        Alert.alert("✅ Success", "Photo saved to device gallery");
      } else {
        Alert.alert("❌ Error", "Failed to save photo to device gallery");
      }
    } catch (e) {
      Alert.alert("❌ Error", "Failed to save photo");
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component logic...
  const handleThumbnailPress = (id: string) => {
    if (actionMode) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(x => x !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      handleSelectPhoto(id);
    }
  };

  const handleThumbnailLongPress = (id: string) => {
    if (!actionMode) {
      setActionMode(true);
      setSelectedIds([id]);
    }
  };

  const exitActionMode = () => {
    setActionMode(false);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    Alert.alert(
      "🗑️ Delete Photos",
      `Are you sure you want to delete ${selectedIds.length} photo${selectedIds.length > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            for (let id of selectedIds) {
              await deletePhoto(id);
            }
            exitActionMode();
          },
        },
      ]
    );
  };

  const handleSelectPhoto = (photoId: string) => {
    const index = photos.findIndex((p) => p.id === photoId);
    if (index !== -1) {
      setSelectedIndex(index);
      setSelectedPhoto(photoId);
    }
  };

  // Utility functions for filtering and sorting
  const getPhotosBreakdown = () => {
    const now = new Date();
    const thisMonth = photos.filter(photo => {
      const photoDate = new Date(photo.timestamp);
      return photoDate.getMonth() === now.getMonth() && photoDate.getFullYear() === now.getFullYear();
    }).length;
    
    const thisYear = photos.filter(photo => {
      const photoDate = new Date(photo.timestamp);
      return photoDate.getFullYear() === now.getFullYear();
    }).length;

    return { total: photos.length, thisMonth, thisYear };
  };

  const filterPhotos = (photos: PhotoData[]) => {
    let filtered = photos;

    // Apply text search
    if (searchQuery.trim()) {
      filtered = filtered.filter(photo => 
        photo.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.weather?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(photo.timestamp).toLocaleDateString().includes(searchQuery)
      );
    }

    // Apply date filter
    if (filterBy !== 'all') {
      const now = new Date();
      filtered = filtered.filter(photo => {
        const photoDate = new Date(photo.timestamp);
        if (filterBy === 'thisMonth') {
          return photoDate.getMonth() === now.getMonth() && photoDate.getFullYear() === now.getFullYear();
        } else if (filterBy === 'thisYear') {
          return photoDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    return filtered;
  };

  const sortPhotos = (photos: PhotoData[]) => {
    return [...photos].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'location':
          comparison = (a.address || '').localeCompare(b.address || '');
          break;
        case 'weather':
          comparison = (a.weather || '').localeCompare(b.weather || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const processedPhotos = sortPhotos(filterPhotos(photos));
  const photoBreakdown = getPhotosBreakdown();

  // Masonry layout calculation
  const getMasonryData = () => {
    const columns: PhotoData[][] = Array(COLUMN_COUNT).fill(null).map(() => []);
    const columnHeights = Array(COLUMN_COUNT).fill(0);

    processedPhotos.forEach((photo) => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columns[shortestColumnIndex].push(photo);
      
      // Estimate height for layout (will be corrected by individual cards)
      columnHeights[shortestColumnIndex] += 200; // Average estimated height
    });

    return columns;
  };

  const masonryColumns = getMasonryData();

  const renderMasonryColumn = (columnPhotos: PhotoData[], columnIndex: number) => {
    return (
      <View key={columnIndex} style={styles.masonryColumn}>
        {columnPhotos.map((photo) => (
          <AnimatedPhotoCard
            key={photo.id}
            photo={photo}
            onPress={() => handleThumbnailPress(photo.id)}
            onLongPress={() => handleThumbnailLongPress(photo.id)}
            isSelected={selectedIds.includes(photo.id)}
            actionMode={actionMode}
          />
        ))}
      </View>
    );
  };

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="camera" size={60} color="white" />
          </View>
          <Text style={styles.emptyText}>No Memories Yet</Text>
          <Text style={styles.emptySubText}>
            Start capturing your moments to see them here
          </Text>
        </View>
      </View>
    );
  }

  // Get the current photo being displayed
  const currentPhoto = photos.find(p => p.id === selectedPhoto);

  // Format date in more compact way
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        {actionMode ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacity onPress={exitActionMode} style={{ padding: 6, marginRight: 10 }}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>{selectedIds.length} selected</Text>
            <TouchableOpacity
              onPress={handleBulkDelete}
              style={{ padding: 6, marginLeft: 10 }}
              disabled={selectedIds.length === 0}
            >
              <Ionicons name="trash" size={28} color={selectedIds.length > 0 ? "white" : "#cfd2ff"} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Main Header Row */}
            <View style={styles.headerMainRow}>
              <View style={styles.headerTitleSection}>
                <Text style={styles.title}>Your Memories 📸</Text>
                <View style={styles.photoBreakdownContainer}>
                  <View style={styles.photoBreakdownRow}>
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownNumber}>{photoBreakdown.total}</Text>
                      <Text style={styles.breakdownLabel}>Total</Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownNumber}>{photoBreakdown.thisMonth}</Text>
                      <Text style={styles.breakdownLabel}>This Month</Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownItem}>
                      <Text style={styles.breakdownNumber}>{photoBreakdown.thisYear}</Text>
                      <Text style={styles.breakdownLabel}>This Year</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.searchToggle}
                    onPress={() => setShowSearchBar(!showSearchBar)}
                  >
                    <Ionicons name="search" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Search Bar (Expandable) */}
            {showSearchBar && (
              <View style={styles.searchSection}>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={16} color="rgba(255,255,255,0.7)" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by location, date, or weather..."
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Filter and Sort Controls */}
            <View style={styles.controlsSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlsScrollView}>
                {/* Date Filter Pills */}
                <TouchableOpacity 
                  style={[styles.filterPill, filterBy === 'all' && styles.filterPillActive]}
                  onPress={() => setFilterBy('all')}
                >
                  <Text style={[styles.filterPillText, filterBy === 'all' && styles.filterPillTextActive]}>
                    All
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.filterPill, filterBy === 'thisMonth' && styles.filterPillActive]}
                  onPress={() => setFilterBy('thisMonth')}
                >
                  <Text style={[styles.filterPillText, filterBy === 'thisMonth' && styles.filterPillTextActive]}>
                    This Month
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.filterPill, filterBy === 'thisYear' && styles.filterPillActive]}
                  onPress={() => setFilterBy('thisYear')}
                >
                  <Text style={[styles.filterPillText, filterBy === 'thisYear' && styles.filterPillTextActive]}>
                    This Year
                  </Text>
                </TouchableOpacity>

                <View style={styles.sortControlsContainer}>
                  {/* Sort By */}
                  <TouchableOpacity 
                    style={[styles.sortPill, sortBy === 'date' && styles.sortPillActive]}
                    onPress={() => setSortBy('date')}
                  >
                    <Ionicons name="calendar" size={14} color={sortBy === 'date' ? '#667eea' : 'rgba(255,255,255,0.8)'} />
                    <Text style={[styles.sortPillText, sortBy === 'date' && styles.sortPillTextActive]}>Date</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.sortPill, sortBy === 'location' && styles.sortPillActive]}
                    onPress={() => setSortBy('location')}
                  >
                    <Ionicons name="location" size={14} color={sortBy === 'location' ? '#667eea' : 'rgba(255,255,255,0.8)'} />
                    <Text style={[styles.sortPillText, sortBy === 'location' && styles.sortPillTextActive]}>Location</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.sortPill, sortBy === 'weather' && styles.sortPillActive]}
                    onPress={() => setSortBy('weather')}
                  >
                    <Ionicons name="partly-sunny" size={14} color={sortBy === 'weather' ? '#667eea' : 'rgba(255,255,255,0.8)'} />
                    <Text style={[styles.sortPillText, sortBy === 'weather' && styles.sortPillTextActive]}>Weather</Text>
                  </TouchableOpacity>

                  {/* Sort Order Toggle */}
                  <TouchableOpacity 
                    style={styles.sortOrderButton}
                    onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <Ionicons 
                      name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                      size={16} 
                      color="rgba(255,255,255,0.8)" 
                    />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            {/* Results Summary */}
            {(searchQuery || filterBy !== 'all') && (
              <View style={styles.resultsSummary}>
                <Text style={styles.resultsText}>
                  {processedPhotos.length} of {photos.length} photos
                  {searchQuery && ` matching "${searchQuery}"`}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.scrollContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.masonryContainer}>
            {masonryColumns.map((columnPhotos, columnIndex) => 
              renderMasonryColumn(columnPhotos, columnIndex)
            )}
          </View>
        </ScrollView>
      </View>

      {selectedPhoto && currentPhoto && (
        <Modal
          visible={!!selectedPhoto}
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
          statusBarTranslucent={true}
        >
          <ViewShot
            ref={viewShotRef}
            options={{
              fileName: "memory_screenshot",
              format: "jpg",
              quality: 0.9,
              result: 'tmpfile'
            }}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPhoto(null)}
              >
                <Ionicons name="close-circle" size={32} color="white" />
              </TouchableOpacity>
              <View style={styles.counterContainer}>
                <Text style={styles.photoCounter}>
                  {selectedIndex + 1} of {photos.length}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleSharePhoto}
              >
                <Ionicons name="share" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* DIRECT SWIPE ON IMAGE */}
            <View
              style={styles.imageContainer}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                source={{ uri: currentPhoto.uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>

            {/* SIMPLIFIED FIXED LAYOUT for info panel and button */}
            <View style={styles.infoPanel}>
              {/* Fixed info content - no scrolling */}
              <View style={styles.infoPanelContent}>
                <Text style={styles.modalDate}>
                  {formatDate(currentPhoto.timestamp)}
                </Text>

                {currentPhoto.address && (
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={18} color="#667eea" />
                    <Text style={styles.infoText} numberOfLines={1}>{currentPhoto.address}</Text>
                  </View>
                )}

                {currentPhoto.weather && (
                  <View style={styles.infoRow}>
                    <Ionicons name="partly-sunny" size={18} color="#667eea" />
                    <Text style={styles.infoText} numberOfLines={1}>{currentPhoto.weather}</Text>
                  </View>
                )}
                <View style={styles.actionButtonContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSaveToDevice(currentPhoto.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Ionicons name="download" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Save to Device</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ViewShot>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa"
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#34C759',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    fontWeight: "500",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: SPACING,
    paddingTop: SPACING,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  masonryColumn: {
    flex: 1,
    marginHorizontal: SPACING / 2,
  },
  animatedContainer: {
    marginBottom: SPACING,
  },
  photoCard: {
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 12,
    overflow: "hidden",
    position: "relative",
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.4)', // Gradient effect with transparency
  },
  addressTag: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  selectedTick: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#667eea',
  },
  emptyContent: {
    alignItems: "center",
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  emptySubText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    fontWeight: "500",
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#667eea',
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  counterContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoCounter: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  shareButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: "60%",
    width: "100%",
    position: "relative",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  infoPanel: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    justifyContent: 'space-between', // This positions content at top and button at bottom
    padding: 0,
  },
  infoPanelContent: {
    padding: 16,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: "white",
    marginLeft: 10,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    fontWeight: "500",
  },
  actionButtonContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: "center",
    backgroundColor: "#667eea",
    width: "80%",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  spacer: {
    flex: 1,
  },
  photoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  // Enhanced Header Styles
  headerMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 4,
  },
  headerTitleSection: {
    flex: 1,
  },
  photoBreakdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  photoBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#667eea',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  breakdownLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    fontWeight: '500',
  },
  breakdownDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  searchToggle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 10,
    marginLeft: 12,
  },
  searchSection: {
    marginTop: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  controlsSection: {
    marginTop: 12,
  },
  controlsScrollView: {
    flexGrow: 0,
  },
  filterPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#667eea',
  },
  filterPillText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  filterPillTextActive: {
    color: 'white',
  },
  sortControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  sortPillActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  sortPillText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  sortPillTextActive: {
    color: '#667eea',
  },
  sortOrderButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 6,
    marginLeft: 4,
  },
  resultsSummary: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  resultsText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

export default Gallery;