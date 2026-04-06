/**
 * RV Nomad — Copyright (c) 2026 Kieran Woll Creative Works LLC
 * All Rights Reserved. Unauthorized copying or distribution is prohibited.
 * See LICENSE file for details.
 */
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  Dimensions,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import {
  getPhotosForSite,
  addPhoto,
  deletePhoto,
  type SitePhoto,
} from "@/lib/photo-store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THUMB_SIZE = (SCREEN_WIDTH - 48 - 12) / 3; // 3 columns with gaps

interface PhotoGalleryProps {
  siteId: string;
  siteName: string;
}

export function PhotoGallery({ siteId, siteName }: PhotoGalleryProps) {
  const colors = useColors();
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [siteNumber, setSiteNumber] = useState("");
  const [selectedUri, setSelectedUri] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    const loaded = await getPhotosForSite(siteId);
    setPhotos(loaded);
  }, [siteId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedUri(result.assets[0].uri);
      setShowAddForm(true);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Needed", "Camera permission is required to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedUri(result.assets[0].uri);
      setShowAddForm(true);
    }
  };

  const handleAddPhoto = async () => {
    if (!selectedUri) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addPhoto({
      siteId,
      uri: selectedUri,
      caption: caption.trim() || undefined,
      siteNumber: siteNumber.trim() || undefined,
      authorName: "You",
    });
    setShowAddForm(false);
    setCaption("");
    setSiteNumber("");
    setSelectedUri(null);
    loadPhotos();
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deletePhoto(photoId);
          loadPhotos();
          if (viewerVisible) setViewerVisible(false);
        },
      },
    ]);
  };

  const showPhotoOptions = () => {
    if (Platform.OS === "web") {
      pickFromLibrary();
      return;
    }
    Alert.alert("Add Photo", "Choose a source", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="photo-library" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Camper Photos
          </Text>
          {photos.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>{photos.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={showPhotoOptions}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add-a-photo" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <View style={styles.grid}>
          {photos.slice(0, 9).map((photo, index) => (
            <TouchableOpacity
              key={photo.id}
              style={[styles.thumb, { borderColor: colors.border }]}
              onPress={() => openViewer(index)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: photo.uri }} style={styles.thumbImage} contentFit="cover" />
              {index === 8 && photos.length > 9 && (
                <View style={styles.moreOverlay}>
                  <Text style={styles.moreText}>+{photos.length - 9}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="camera-alt" size={32} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No photos yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Be the first to share a photo of {siteName}!
          </Text>
        </View>
      )}

      {/* Add Photo Form Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: colors.foreground }]}>Add Photo</Text>
              <TouchableOpacity onPress={() => { setShowAddForm(false); setSelectedUri(null); }}>
                <MaterialIcons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedUri && (
                <Image source={{ uri: selectedUri }} style={styles.previewImage} contentFit="cover" />
              )}

              <View style={styles.formFields}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>Caption (optional)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="e.g., Beautiful sunset from site #42"
                  placeholderTextColor={colors.muted}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  maxLength={200}
                  returnKeyType="done"
                />

                <Text style={[styles.fieldLabel, { color: colors.muted }]}>Site Number (optional)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                  placeholder="e.g., Site #12"
                  placeholderTextColor={colors.muted}
                  value={siteNumber}
                  onChangeText={setSiteNumber}
                  maxLength={20}
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddPhoto}
                activeOpacity={0.8}
              >
                <MaterialIcons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Save Photo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full-Screen Photo Viewer */}
      <Modal visible={viewerVisible} animationType="fade" transparent>
        <View style={styles.viewerContainer}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity onPress={() => setViewerVisible(false)} style={styles.viewerClose}>
              <MaterialIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.viewerCount}>
              {viewerIndex + 1} / {photos.length}
            </Text>
            <TouchableOpacity
              onPress={() => photos[viewerIndex] && handleDeletePhoto(photos[viewerIndex].id)}
              style={styles.viewerDelete}
            >
              <MaterialIcons name="delete" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setViewerIndex(idx);
            }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.viewerSlide}>
                <Image source={{ uri: item.uri }} style={styles.viewerImage} contentFit="contain" />
                {(item.caption || item.siteNumber) && (
                  <View style={styles.viewerCaption}>
                    {item.siteNumber && (
                      <Text style={styles.viewerSiteNum}>{item.siteNumber}</Text>
                    )}
                    {item.caption && (
                      <Text style={styles.viewerCaptionText}>{item.caption}</Text>
                    )}
                    <Text style={styles.viewerDate}>
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: { fontSize: 12, fontWeight: "700" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  thumbImage: { width: "100%", height: "100%" },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  emptyState: {
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 6,
  },
  emptyTitle: { fontSize: 15, fontWeight: "600" },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
  // Modal Form
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  formContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  formTitle: { fontSize: 18, fontWeight: "700" },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  formFields: { gap: 8, marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    minHeight: 44,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 30,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  // Viewer
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  viewerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  viewerClose: { padding: 4 },
  viewerCount: { color: "#fff", fontSize: 15, fontWeight: "600" },
  viewerDelete: { padding: 4 },
  viewerSlide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  viewerCaption: {
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  viewerSiteNum: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "700",
  },
  viewerCaptionText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
  },
  viewerDate: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 4,
  },
});
