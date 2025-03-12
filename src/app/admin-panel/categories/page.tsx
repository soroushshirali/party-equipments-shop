"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  TextField, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Typography,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { CategoryGroup, CategoryItem } from '@/types/types';
import Link from 'next/link';
import axios from '@/lib/axios';

// Add this function to resize the image
async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 255;
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
}

export default function CategoryManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [groupTitle, setGroupTitle] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      loadCategories();
    }
  }, [session]);

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      const categoriesData = response.data;
      setGroups(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const resizedImage = await resizeImage(file);
      const formData = new FormData();
      formData.append('image', resizedImage);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveGroup = async () => {
    if (!groupTitle.trim()) {
      return;
    }

    try {
      if (selectedGroup) {
        await axios.put(`/api/categories/${selectedGroup.id}`, {
          groupTitle,
          groupBorderColor: selectedColor,
        });
      } else {
        await axios.post('/api/categories', {
          groupTitle,
          groupBorderColor: selectedColor,
          items: [],
        });
      }

      await loadCategories();
      setIsGroupDialogOpen(false);
      setGroupTitle('');
      setSelectedColor('#000000');
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleEditGroup = (group: CategoryGroup) => {
    setSelectedGroup(group);
    setGroupTitle(group.groupTitle);
    setSelectedColor(group.groupBorderColor || '#000000');
    setIsGroupDialogOpen(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('آیا از حذف این گروه اطمینان دارید؟')) {
      return;
    }

    try {
      await axios.delete(`/api/categories/${groupId}`);
      await loadCategories();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('خطا در حذف دسته‌بندی');
      }
    }
  };

  const handleAddItem = (group: CategoryGroup) => {
    setSelectedGroup(group);
    setItemTitle('');
    setItemImage('');
    setImageFile(null);
    setImagePreview('');
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (group: CategoryGroup, item: CategoryItem) => {
    setSelectedGroup(group);
    setItemTitle(item.title);
    setItemImage(item.image || '');
    setImageFile(null);
    setImagePreview('');
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    debugger;
    if (!selectedGroup || !itemTitle.trim()) {
      return;
    }

    try {
      let imageUrl = itemImage;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (editingItem) {
        await axios.put(`/api/categories/${selectedGroup.id}/items/${editingItem.categoryId}`, {
          title: itemTitle,
          image: imageUrl,
        });
      } else {
        await axios.post(`/api/categories/${selectedGroup.id}/items`, {
          title: itemTitle,
          image: imageUrl,
        });
      }

      await loadCategories();
      setIsItemDialogOpen(false);
      setItemTitle('');
      setItemImage('');
      setImageFile(null);
      setImagePreview('');
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDeleteItem = async (groupId: string, item: CategoryItem) => {
    if (!confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
      return;
    }

    try {
      await axios.delete(`/api/categories/${groupId}/items/${item.categoryId}`);
      await loadCategories();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('خطا در حذف آیتم');
      }
    }
  };

  if (status === 'loading') {
    return <div className="p-4">Loading...</div>;
  }

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
        <h1 className="text-2xl font-bold">مدیریت دسته‌بندی‌ها</h1>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedGroup(null);
            setGroupTitle('');
            setSelectedColor('#000000');
            setIsGroupDialogOpen(true);
          }}
        >
          افزودن گروه جدید
        </Button>
      </div>

      {groups.map((group) => (
        <div key={group.id} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">{group.groupTitle}</h2>
              <div 
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: group.groupBorderColor }}
              />
            </div>
            <div>
              <IconButton onClick={() => handleEditGroup(group)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDeleteGroup(group.id!)} color="error">
                <Delete />
              </IconButton>
            </div>
          </div>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleAddItem(group)}
            className="mb-4"
          >
            افزودن آیتم جدید
          </Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>تصویر</TableCell>
                  <TableCell>عنوان</TableCell>
                  <TableCell>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.items.map((item) => (
                  <TableRow key={item.categoryId}>
                    <TableCell>
                      <img 
                        src={`${item.image || '/api/placeholder/50/50'}?nocache=${Date.now()}`}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          // If image fails to load, show placeholder
                          e.currentTarget.src = '/api/placeholder/50/50';
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditItem(group, item)}>
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteItem(group.id!, item)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}

      {/* Group Dialog */}
      <Dialog 
        open={isGroupDialogOpen} 
        onClose={() => setIsGroupDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedGroup ? 'ویرایش گروه' : 'افزودن گروه جدید'}
        </DialogTitle>
        <DialogContent sx={{ 
          minHeight: '40vh',
          '& .MuiTextField-root': { my: 1.5 }
        }}>
          <TextField
            autoFocus
            margin="dense"
            label="نام گروه"
            type="text"
            fullWidth
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            sx={{ mb: 3 }}
          />
          <div>
            <Button
              variant="outlined"
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            >
              انتخاب رنگ حاشیه برای همه دسته‌ها
            </Button>
            {isColorPickerOpen && (
              <div className="absolute z-10">
                <ChromePicker
                  color={selectedColor}
                  onChange={(color) => setSelectedColor(color.hex)}
                />
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsGroupDialogOpen(false)}>انصراف</Button>
          <Button onClick={handleSaveGroup} variant="contained">
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog 
        open={isItemDialogOpen} 
        onClose={() => setIsItemDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}
        </DialogTitle>
        <DialogContent sx={{ 
          minHeight: '40vh',
          '& .MuiTextField-root': { my: 1.5 }
        }}>
          <TextField
            autoFocus
            margin="dense"
            label="عنوان آیتم"
            type="text"
            fullWidth
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            sx={{ mb: 3 }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {isUploading && (
            <div className="w-full">
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                className="mb-2"
              />
              <Typography variant="body2" color="textSecondary">
                {Math.round(uploadProgress)}%
              </Typography>
            </div>
          )}
          {(imagePreview || itemImage) && (
            <img 
              src={imagePreview || itemImage} 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsItemDialogOpen(false)}>انصراف</Button>
          <Button onClick={handleSaveItem} variant="contained">
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 