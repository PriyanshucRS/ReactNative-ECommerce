import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAddProductMutation } from '../../../services/api';
import { useUpdateProductMutation } from '../../../services/productsApi';
import { showAppNotification } from '../../../services/notificationService';
import { styles } from './AddProductStyles';
import BottomTabs, {
  useBottomTabsContentPadding,
} from '../../../components/BottomTabs';

interface FormData {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

const categoryOptions = [
  'Electronics',
  'Clothing',
  'Home',
  'Beauty',
  'Toys',
  'Books',
];

const AddProductScreen = () => {
  const bottomSpacing = useBottomTabsContentPadding();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingProduct = route.params?.product;
  const isEdit = !!editingProduct;
  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');

  const initialValues: FormData = useMemo(
    () =>
      editingProduct
        ? {
            title: editingProduct.title || editingProduct.name || '',
            price: editingProduct.price || 0,
            description: editingProduct.description || '',
            category: editingProduct.category || '',
            image: editingProduct.image || '',
          }
        : {
            title: '',
            price: '',
            description: '',
            category: '',
            image: '',
          },
    [editingProduct],
  );

  const { control, handleSubmit, watch, reset, setValue } = useForm<FormData>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    // Ensure autofill also works if screen stays mounted and params change.
    reset(initialValues);
  }, [reset, initialValues]);

  const imageValue = watch('image');

  const onSubmit = async (data: FormData) => {
    try {
      // Trim and validate data
      if (
        !data.title?.trim() ||
        !data.description?.trim() ||
        !data.image?.trim() ||
        !data.category
      ) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      const price = parseFloat(data.price.toString());
      if (isNaN(price) || price <= 0) {
        Alert.alert('Error', 'Please enter a valid price');
        return;
      }

      const payload = {
        ...data,
        title: data.title.trim(),
        description: data.description.trim(),
        price: price,
      };

      if (isEdit) {
        const id = editingProduct.id || editingProduct._id;
        await updateProduct({ id, data: payload }).unwrap();
        await showAppNotification(
          'Product Updated Successfully',
          `<b>${payload.title}</b> has been updated. Your latest changes are now live.`,
        );
        Alert.alert('Success', 'Product updated successfully!');
      } else {
        await addProduct(payload).unwrap();
        await showAppNotification(
          '✅ Product Added Successfully',
          `<b>${payload.title}</b> is now live in your product list.`,
        );
        Alert.alert('Success', 'Product added successfully!');
      }
      navigation.goBack();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        (typeof error?.data === 'string' ? error.data : undefined) ||
        error?.error ||
        'Failed to add product';
      Alert.alert('Error', errorMessage);
    }
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

  const handleRemoveImage = () => {
    setValue('image', '');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: bottomSpacing },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack?.()) {
              navigation.goBack();
              return;
            }
            navigation.navigate('MainDrawer', { screen: 'homeScreen' });
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.header}>
          {isEdit ? 'Update Product' : 'Add New Product'}
        </Text>

        <Controller
          control={control}
          name="title"
          rules={{ required: 'Product name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={[styles.input]}
                placeholder="Enter product name"
                placeholderTextColor="#9CA3AF"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="price"
          rules={{ required: 'Price is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={[styles.input]}
                placeholder="Enter price"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value.toString()}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="description"
          rules={{ required: 'Description is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
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

        <Controller
          control={control}
          name="category"
          rules={{ required: 'Category is required' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select category" value="" />
                  {categoryOptions.map(item => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        />

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
              rules={{ required: 'Image is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input]}
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
              render={({ field: { onChange } }) => (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleUploadFromDevice(onChange)}
                >
                  <Text style={styles.uploadText}>Upload from device</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {imageValue ? (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: imageValue }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
            >
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (isAdding || isUpdating) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isAdding || isUpdating}
        >
          {isAdding || isUpdating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Update Product' : 'Add Product'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <BottomTabs activeTab="add" />
    </View>
  );
};

export default AddProductScreen;
