"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, ListSubheader, TablePagination, LinearProgress, Typography
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Product, CategoryGroup } from '@/types/types';
import Link from 'next/link';
import axios from '@/lib/axios';

export default function ProductManagement() {
  const { data: session, status } = useSession();
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
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      loadCategories();
      loadProducts();
    }
  }, [session]);

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const resizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
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

  const uploadImage = async (file: File): Promise<{ thumbnailUrl: string; originalUrl: string }> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload original image
      const originalFormData = new FormData();
      originalFormData.append('image', file);
      const originalResponse = await axios.post('/api/upload', originalFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total) / 2
            : 0;
          setUploadProgress(progress);
        },
      });

      // Resize and upload thumbnail
      const resizedImage = await resizeImage(file);
      const thumbnailFormData = new FormData();
      thumbnailFormData.append('image', resizedImage);
      const thumbnailResponse = await axios.post('/api/upload', thumbnailFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? 50 + Math.round((progressEvent.loaded * 100) / progressEvent.total) / 2
            : 50;
          setUploadProgress(progress);
        },
      });

      return {
        thumbnailUrl: thumbnailResponse.data.url,
        originalUrl: originalResponse.data.url,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
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
        const uploadResult = await uploadImage(selectedFile);
        thumbnailUrl = uploadResult.thumbnailUrl;
        originalImageUrl = uploadResult.originalUrl;
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
        await axios.put(`/api/products/${editingProduct.id}`, newProductData);
      } else {
        await axios.post('/api/products', newProductData);
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
        await axios.delete(`/api/products/${product.id}`);
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

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
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
  );
} 