import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { MapPin, FileText, Image as ImageIcon, Camera, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { api, extractErrorMessage } from '../../lib/api';
import { colors } from '../../lib/colors';

const { width } = Dimensions.get('window');

interface ImageItem {
  uri: string;
  type: string;
  fileName: string;
}

export default function ReportScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    priority: 'medium',
  });
  const [images, setImages] = useState<ImageItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: '#15803D' },
    { value: 'medium', label: 'Medium', color: '#D97706' },
    { value: 'high', label: 'High', color: '#EA580C' },
    { value: 'critical', label: 'Critical', color: '#DC2626' },
  ];

  const MAX_IMAGES = 3;

  const requestCameraPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.granted !== true) {
      Alert.alert('Permission required', 'Camera access is needed to take photos.');
      return false;
    }
    return true;
  };

  const requestMediaPermissions = async () => {
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus.granted !== true) {
      Alert.alert('Permission required', 'Media library access is needed to choose photos.');
      return false;
    }
    return true;
  };

  const openCamera = async () => {
    const granted = await requestCameraPermissions();
    if (!granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        fileName: asset.fileName || 'image.jpg',
      }));
      if (images.length + newImages.length <= MAX_IMAGES) {
        setImages([...images, ...newImages]);
      } else {
        Alert.alert(
          'Limit reached',
          `You can upload up to ${MAX_IMAGES} images.`
        );
      }
    }
  };

  const openGallery = async () => {
    const granted = await requestMediaPermissions();
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        fileName: asset.fileName || 'image.jpg',
      }));
      if (images.length + newImages.length <= MAX_IMAGES) {
        setImages([...images, ...newImages]);
      } else {
        Alert.alert(
          'Limit reached',
          `You can upload up to ${MAX_IMAGES} images.`
        );
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!form.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!form.latitude || !form.longitude) {
      setError('Location is required');
      return;
    }

    setSubmitting(true);

    try {
      // Build multipart form data
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('address', form.address);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      formData.append('priority', form.priority);

      images.forEach((image, index) => {
        const parts = image.uri.split('/');
        const fileName = parts[parts.length - 1];
        const ext = fileName.split('.').pop() || 'jpg';
        formData.append('images', {
          uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
          name: `photo_${index}.${ext}`,
          type: image.type,
        } as any);
      });

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Complaint reported successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to report complaint. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <ShieldCheck size={32} color={colors.white} />
          </View>
          <Text style={styles.appName}>Swach City</Text>
          <Text style={styles.subtitle}>Report a cleanliness complaint</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>New complaint</Text>
          <Text style={styles.cardSubtitle}>Help keep your city clean by reporting issues.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Garbage piled up on Main Street"
                autoCapitalize="words"
                autoComplete="off"
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <View style={styles.inputWrapper}>
              <FileText size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { textAlignVertical: 'top', minHeight: 80 }]}
                placeholder="Describe the issue in detail..."
                autoCapitalize="sentences"
                autoComplete="off"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address / Location</Text>
            <View style={styles.inputWrapper}>
              <ImageIcon size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 123 Main Street, Bengaluru"
                autoCapitalize="words"
                autoComplete="off"
                value={form.address}
                onChangeText={(text) => setForm({ ...form, address: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Latitude</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 12.9716"
                keyboardType="numeric"
                autoComplete="off"
                value={form.latitude}
                onChangeText={(text) => setForm({ ...form, latitude: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Longitude</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 77.5946"
                keyboardType="numeric"
                autoComplete="off"
                value={form.longitude}
                onChangeText={(text) => setForm({ ...form, longitude: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITY_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityButton,
                    form.priority === p.value && styles.priorityButtonSelected,
                  ]}
                  onPress={() => setForm({ ...form, priority: p.value })}
                >
                  <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                  <Text style={[styles.priorityText, form.priority === p.value && styles.priorityTextSelected]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Photos (up to {MAX_IMAGES})</Text>
            <View style={styles.imageRow}>
              {images.map((img, index) => (
                <View key={index} style={styles.imageCard}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.imageThumb}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <AlertCircle size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < MAX_IMAGES && (
                <>
                  <TouchableOpacity style={styles.addImageButton} onPress={openCamera}>
                    <Camera size={20} color={colors.primary} />
                    <Text style={[styles.addImageText, { color: colors.primary }]}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addImageButton} onPress={openGallery}>
                    <ImageIcon size={20} color={colors.primary} />
                    <Text style={[styles.addImageText, { color: colors.primary }]}>Gallery</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={colors.critical} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
            <View style={styles.submitButtonContent}>
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Report complaint</Text>
              )}
              <ArrowRight size={18} color={colors.white} style={styles.submitArrow} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: 14,
    paddingLeft: 8,
    paddingRight: 30,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  priorityButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface3,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  priorityTextSelected: {
    color: colors.primary,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageCard: {
    position: 'relative',
    width: (width - 60 - 20) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.critical,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  addImageButton: {
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.criticalBg,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.critical,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 13,
    color: colors.critical,
    flex: 1,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  submitArrow: {
    marginLeft: 4,
  },
});
