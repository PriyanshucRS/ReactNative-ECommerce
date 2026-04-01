import React, { useState, useEffect } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { styles } from './AddProductStyles';
import {
  addProductStart,
  fetchProductsStart,
} from '../../../store/slices/addProductSlice';
import type { RootState } from '../../../store/rootReducer';
import { resetAddProductState } from '../../../store/slices/addProductSlice';

interface FormData {
  title: string;
  price: string;
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
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const addProductState = useSelector((state: RootState) => state.addProduct);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      price: '',
      description: '',
      category: '',
      image: '',
    },
  });

  const imageValue = watch('image');

  const onSubmit = (data: FormData) => {
    dispatch(addProductStart(data));
  };

  useEffect(() => {
    if (addProductState.addProductStatus === 'succeeded') {
      dispatch(fetchProductsStart());

      Alert.alert('Success', 'Product added successfully!', [
        {
          text: 'OK',
          onPress: () => {
            reset();
            setImageMode('url');
            setValue('image', '');
            dispatch(resetAddProductState());

            navigation.goBack();
          },
        },
      ]);
    }
  }, [
    addProductState.addProductStatus,
    dispatch,
    navigation,
    reset,
    setValue,
    setImageMode,
  ]);

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
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Add New Product</Text>

        <Controller
          control={control}
          name="title"
          rules={{ required: 'Product name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter product name"
                placeholderTextColor="#9CA3AF"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />
        {errors.title && (
          <Text style={styles.errorText}>{errors.title.message}</Text>
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
              rules={{ required: 'Image is required' }}
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
          {errors.image && (
            <Text style={styles.errorText}>{errors.image.message}</Text>
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
            addProductState.loading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit, errors => {
            console.log('Form invalid:', errors);
            Alert.alert('Validation Error', 'Please fill all required fields');
          })}
          disabled={addProductState.loading}
        >
          {addProductState.loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Add Product</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddProductScreen;
