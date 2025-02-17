"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, ListSubheader, TablePagination, LinearProgress, Typography
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FirebaseWrapper } from '@/components/FirebaseWrapper';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { collection, getDocs, addDoc, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Product, CategoryGroup } from '@/types/types';
import Link from 'next/link';

export default function ProductManagement() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productData, setProductData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    image: '',
    originalImage: '',
    categoryId: '',
    categoryTitle: '',
    description: '',
    specs: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0
    }
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('groupTitle'));
      const snapshot = await getDocs(q);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryGroup[];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const resizeImage = async (file: File, maxSize: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, file.type);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveProduct = async () => {
    if (!selectedFile && !editingProduct) {
      alert('لطفا یک تصویر انتخاب کنید');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      let thumbnailUrl = productData.image;
      let originalImageUrl = productData.originalImage;

      if (selectedFile) {
        // Delete old images if editing
        if (editingProduct) {
          if (editingProduct.image) {
            const oldThumbnailRef = ref(storage, editingProduct.image);
            await deleteObject(oldThumbnailRef).catch(console.error);
          }
          if (editingProduct.originalImage) {
            const oldOriginalRef = ref(storage, editingProduct.originalImage);
            await deleteObject(oldOriginalRef).catch(console.error);
          }
        }

        // Upload original image
        const originalImageRef = ref(storage, `products/original/${uuidv4()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(originalImageRef, selectedFile);
        
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
            setUploadProgress(progress);
          }
        );

        await uploadTask;
        originalImageUrl = await getDownloadURL(originalImageRef);

        // Resize and upload thumbnail
        const resizedImage = await resizeImage(selectedFile, 500);
        const thumbnailRef = ref(storage, `products/thumbnails/${uuidv4()}_${selectedFile.name}`);
        const thumbnailTask = uploadBytesResumable(thumbnailRef, resizedImage);
        
        thumbnailTask.on('state_changed',
          (snapshot) => {
            const progress = 50 + (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
            setUploadProgress(progress);
          }
        );

        await thumbnailTask;
        thumbnailUrl = await getDownloadURL(thumbnailRef);
      }

      const newProductData = {
        name: productData.name,
        price: Number(productData.price),
        image: thumbnailUrl,
        originalImage: originalImageUrl,
        categoryId: productData.categoryId,
        description: productData.description,
        categoryTitle: productData.categoryTitle,
        specs: {
          length: Number(productData.specs.length) || 0,
          width: Number(productData.specs.width) || 0,
          height: Number(productData.specs.height) || 0,
          weight: Number(productData.specs.weight) || 0
        }
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), newProductData);
      } else {
        await addDoc(collection(db, 'products'), newProductData);
      }

      setIsDialogOpen(false);
      setProductData({
        name: '',
        price: 0,
        image: '',
        originalImage: '',
        categoryId: '',
        categoryTitle: '',
        description: '',
        specs: {
          length: 0,
          width: 0,
          height: 0,
          weight: 0
        }
      });
      setSelectedFile(null);
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('خطا در ذخیره محصول');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      try {
        // Delete both images from storage
        if (product.image) {
          try {
            // Extract path after /o/ and before ?
            const imagePath = product.image.split('/o/')[1].split('?')[0];
            const decodedPath = decodeURIComponent(imagePath);
            const imageRef = ref(storage, decodedPath);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting thumbnail:', error);
          }
        }

        if (product.originalImage) {
          try {
            const originalPath = product.originalImage.split('/o/')[1].split('?')[0];
            const decodedPath = decodeURIComponent(originalPath);
            const originalRef = ref(storage, decodedPath);
            await deleteObject(originalRef);
          } catch (error) {
            console.error('Error deleting original image:', error);
          }
        }

        // Delete product document
        await deleteDoc(doc(db, 'products', product.id));
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('خطا در حذف محصول');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductData({
      name: product.name,
      price: product.price,
      image: product.image,
      originalImage: product.originalImage,
      categoryId: product.categoryId,
      categoryTitle: product.categoryTitle,
      description: product.description || '',
      specs: product.specs
    });
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setProductData({
      name: '',
      price: 0,
      image: '',
      originalImage: '',
      categoryId: '',
      categoryTitle: '',
      description: '',
      specs: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0
      }
    });
    setSelectedFile(null);
  };

  if (loading) return <LoadingSpinner />;
  if (!user || !isAdmin) {
    router.push('/login');
    return null;
  }

  return (
    <FirebaseWrapper>
      <div dir="rtl" className="p-6">
        <div className="mb-4">
          <Link href="/admin-panel" className="text-blue-500 hover:underline">
            بازگشت به پنل مدیریت
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">مدیریت محصولات</h1>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsDialogOpen(true)}
          >
            افزودن محصول جدید
          </Button>
        </div>

        <Dialog 
          open={isDialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}
          </DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-4">
              <TextField
                fullWidth
                label="نام محصول"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="قیمت"
                type="number"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: Number(e.target.value) })}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>دسته‌بندی</InputLabel>
                <Select
                  value={productData.categoryId}
                  onChange={(e) => {
                    const selectedCategory = categories
                      .flatMap(group => group.items)
                      .find(item => item.categoryId === e.target.value);
                    
                    setProductData({
                      ...productData,
                      categoryId: e.target.value,
                      categoryTitle: selectedCategory?.title || ''
                    });
                  }}
                  label="دسته‌بندی"
                >
                  {categories.map((group) => [
                    <ListSubheader key={group.id}>
                      {group.groupTitle}
                    </ListSubheader>,
                    ...group.items.map((item) => (
                      <MenuItem 
                        key={item.categoryId} 
                        value={item.categoryId}
                        className="pr-8"
                      >
                        {item.title}
                      </MenuItem>
                    ))
                  ])}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="طول (سانتی‌متر)"
                type="number"
                value={productData.specs.length}
                onChange={(e) => setProductData({
                  ...productData,
                  specs: { ...productData.specs, length: Number(e.target.value) }
                })}
              />
              <TextField
                fullWidth
                label="عرض (سانتی‌متر)"
                type="number"
                value={productData.specs.width}
                onChange={(e) => setProductData({
                  ...productData,
                  specs: { ...productData.specs, width: Number(e.target.value) }
                })}
              />
              <TextField
                fullWidth
                label="ارتفاع (سانتی‌متر)"
                type="number"
                value={productData.specs.height}
                onChange={(e) => setProductData({
                  ...productData,
                  specs: { ...productData.specs, height: Number(e.target.value) }
                })}
              />
              <TextField
                fullWidth
                label="وزن (کیلوگرم)"
                type="number"
                value={productData.specs.weight}
                onChange={(e) => setProductData({
                  ...productData,
                  specs: { ...productData.specs, weight: Number(e.target.value) }
                })}
              />
              <TextField
                fullWidth
                label="توضیحات"
                multiline
                rows={4}
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full"
              />
              {isUploading && (
                <div className="mt-2">
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" color="textSecondary" align="center">
                    {Math.round(uploadProgress)}%
                  </Typography>
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>انصراف</Button>
            <Button 
              onClick={handleSaveProduct}
              variant="contained"
              disabled={isUploading || !productData.name || !productData.price || !productData.categoryId}
            >
              {isUploading ? 'در حال آپلود...' : 'ذخیره'}
            </Button>
          </DialogActions>
        </Dialog>

        <TableContainer component={Paper} className="mt-6">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>تصویر</TableCell>
                <TableCell>نام محصول</TableCell>
                <TableCell>قیمت</TableCell>
                <TableCell>دسته‌بندی</TableCell>
                <TableCell>ابعاد (سانتی‌متر)</TableCell>
                <TableCell>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price.toLocaleString()} تومان</TableCell>
                    <TableCell>{product.categoryTitle}</TableCell>
                    <TableCell>
                      {product.specs ? 
                        `${product.specs.length}×${product.specs.width}×${product.specs.height} - ${product.specs.weight}kg` : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleEditProduct(product)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteProduct(product)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={products.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="تعداد در صفحه:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} از ${count}`
            }
          />
        </TableContainer>
      </div>
    </FirebaseWrapper>
  );
} 