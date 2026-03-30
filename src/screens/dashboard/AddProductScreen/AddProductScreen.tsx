import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { styles } from './AddProductStyles';

const categoryOptions = [
  'Electronics',
  'Clothing',
  'Home',
  'Beauty',
  'Toys',
  'Books',
];

const AddProductScreen = () => {
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      price: '',
      description: '',
      category: '',
      image: '',
    },
  });

  const imageValue = watch('image');

  const handleAddProduct = () => {
    Alert.alert('Product Added', 'Your product has been saved to the list.');
  };

  const handleUploadFromDevice = async (onChange: (uri: string) => void) => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
    };

    const result = await launchImageLibrary(options);

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert(
        'Upload failed',
        result.errorMessage || 'Unable to select image',
      );
      return;
    }

    const asset = result.assets?.[0];
    if (asset?.uri) {
      onChange(asset.uri);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Add New Product</Text>

        <Controller
          control={control}
          name="name"
          rules={{ required: 'Product name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter product name"
                placeholderTextColor="#9CA3AF"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}

        <Controller
          control={control}
          name="price"
          rules={{ required: 'Price is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder="Enter price"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />
        {errors.price && (
          <Text style={styles.errorText}>{errors.price.message}</Text>
        )}

        <Controller
          control={control}
          name="description"
          rules={{ required: 'Description is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                placeholder="Enter product description"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description.message}</Text>
        )}

        <Controller
          control={control}
          name="category"
          rules={{ required: 'Category is required' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryRow}>
                {categoryOptions.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoryChip,
                      value === item && styles.categoryChipActive,
                    ]}
                    onPress={() => onChange(item)}
                  >
                    <Text
                      style={
                        value === item
                          ? styles.categoryTextActive
                          : styles.categoryText
                      }
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
        {errors.category && (
          <Text style={styles.errorText}>{errors.category.message}</Text>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Product Image</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                imageMode === 'url' && styles.modeButtonActive,
              ]}
              onPress={() => setImageMode('url')}
            >
              <Text
                style={
                  imageMode === 'url' ? styles.modeTextActive : styles.modeText
                }
              >
                URL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                imageMode === 'upload' && styles.modeButtonActive,
              ]}
              onPress={() => setImageMode('upload')}
            >
              <Text
                style={
                  imageMode === 'upload'
                    ? styles.modeTextActive
                    : styles.modeText
                }
              >
                Upload
              </Text>
            </TouchableOpacity>
          </View>
          {imageMode === 'url' ? (
            <Controller
              control={control}
              name="image"
              rules={{ required: 'Image URL is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.image && styles.inputError]}
                  placeholder="Paste image URL"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          ) : (
            <Controller
              control={control}
              name="image"
              rules={{ required: 'Image is required' }}
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleUploadFromDevice(onChange)}
                >
                  <Text style={styles.uploadText}>Upload from device</Text>
                </TouchableOpacity>
              )}
            />
          )}
          {errors.image && (
            <Text style={styles.errorText}>{errors.image.message}</Text>
          )}
        </View>

        {imageValue ? (
          <Image source={{ uri: imageValue }} style={styles.previewImage} />
        ) : null}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(handleAddProduct)}
        >
          <Text style={styles.submitButtonText}>Add Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddProductScreen;
