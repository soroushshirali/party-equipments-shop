"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { Edit, Delete, Add, ArrowBack } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { db, storage } from '@/lib/firebase';
import { CategoryGroup, CategoryItem } from '@/types/types';
import { ref, uploadBytes, getDownloadURL, deleteObject, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { FirebaseWrapper } from '@/components/FirebaseWrapper';
import axios from 'axios';

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

        // Calculate new dimensions while maintaining aspect ratio
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
          if (blob) {
            resolve(blob);
          }
        }, file.type);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Update the handleImageUpload function
const handleImageUpload = async (
  file: File, 
  setUploadProgress: (progress: number) => void
) => {
  try {
    // Resize the image before uploading
    const resizedImage = await resizeImage(file);
    
    // Create a unique filename using UUID
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `category_${uuidv4()}.${fileExtension}`;

    // Create upload task
    const imageRef = ref(storage, `categories/${uniqueFilename}`);
    const uploadTask = uploadBytesResumable(imageRef, resizedImage);

    // Return a promise that resolves with the download URL
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Update progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          // Handle errors
          console.error('Error uploading image:', error);
          reject(new Error('خطا در آپلود تصویر'));
        },
        async () => {
          // Upload completed successfully
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('خطا در آپلود تصویر');
  }
};

export default function CategoryManagement() {
  const { user, isAdmin, loading } = useAuth();
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
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      const categoriesData = response.data;
      setGroups(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleEditGroup = (group: CategoryGroup) => {
    setSelectedGroup(group);
    setGroupTitle(group.groupTitle);
    setSelectedColor(group.groupBorderColor || '#000000');
    setIsGroupDialogOpen(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    // Find the group first
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;

    // Check if group has items
    if (group.items && group.items.length > 0) {
      alert('لطفاً ابتدا تمام دسته‌بندی‌های این گروه را حذف کنید');
      return;
    }

    if (confirm('آیا از حذف این گروه اطمینان دارید؟')) {
      try {
        await axios.delete(`/api/categories/${groupId}`);
        await loadCategories();
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('خطا در حذف گروه');
      }
    }
  };

  const handleSaveGroup = async () => {
    try {
      // Ensure we have required fields
      if (!groupTitle.trim()) {
        alert('لطفا عنوان گروه را وارد کنید');
        return;
      }

      const groupData = {
        groupTitle: groupTitle.trim(),
        groupBorderColor: selectedColor || '#000000',
        items: []
      };

      if (selectedGroup) {
        // Editing existing group
        const updatedGroup = {
          ...selectedGroup,
          groupTitle: groupTitle.trim(),
          groupBorderColor: selectedColor
        };

        const response = await axios.put(`/api/categories/${selectedGroup.id}`, updatedGroup);
        const savedGroup = response.data;
        
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group.id === selectedGroup.id ? savedGroup : group
          )
        );
      } else {
        // Creating new group
        try {
          console.log('Attempting to create new group with data:', groupData);
          const response = await axios.post('/api/categories', groupData);
          console.log('Server response:', response.data);
          const createdGroup = response.data;
          
          setGroups(prevGroups => [...prevGroups, createdGroup]);
        } catch (error: any) {
          console.error('Failed to create group. Server response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          console.error('Error message:', error.message);
          throw error;
        }
      }
      
      setIsGroupDialogOpen(false);
      setGroupTitle('');
      setSelectedColor('#000000');
    } catch (error: any) {
      console.error('Error saving group:', error);
      const errorMessage = error.response?.data?.message || 'خطا در ذخیره گروه';
      alert(errorMessage);
    }
  };

  const handleAddItem = async (group: CategoryGroup) => {
    setSelectedGroup(group);
    setEditingItem(null);
    setItemTitle('');
    setItemImage('');
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (group: CategoryGroup, item: CategoryItem) => {
    setSelectedGroup(group);
    setEditingItem(item);
    setItemTitle(item.title);
    setItemImage(item.image);
    setIsItemDialogOpen(true);
  };

  const handleDeleteItem = async (groupId: string, item: CategoryItem) => {
    try {
      // Check if any products use this category
      // const productsRef = collection(db, 'products');
      // const q = query(productsRef, where('categoryId', '==', item.categoryId));
      // const snapshot = await getDocs(q);

      // if (!snapshot.empty) {
      //   alert('لطفاً ابتدا تمام محصولات مرتبط با این دسته‌بندی را حذف کنید');
      //   return;
      // }

      if (window.confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
        // Delete image and category as before
        if (item.image) {
          try {
            const imageRef = ref(storage, item.image);
            await deleteObject(imageRef);
          } catch (error) {
            console.log('Error deleting image:', error);
          }
        }

        const group = groups.find(g => g.id === groupId);
        if (!group) return;

        const updatedItems = group.items.filter(i => i.categoryId !== item.categoryId);
        
        // Changed from setDoc to axios.put
        await axios.put(`/api/categories/${groupId}`, {
          ...group,
          items: updatedItems
        });

        setGroups(prevGroups =>
          prevGroups.map(g =>
            g.id === groupId ? { ...g, items: updatedItems } : g
          )
        );
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('خطا در حذف دسته‌بندی');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Instead of uploading here, just show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async () => {
    if (!selectedGroup) return;

    try {
      setIsUploading(true);
      let imageUrl = itemImage;
      
      if (imageFile) {
        try {
          // Delete previous image if it exists and we're editing
          if (editingItem?.image) {
            try {
              const oldImageRef = ref(storage, editingItem.image);
              await deleteObject(oldImageRef);
            } catch (error: any) {
              // Just log the error and continue
              console.log('Error deleting old image:', error.message);
            }
          }

          // Upload new image
          imageUrl = await handleImageUpload(imageFile, setUploadProgress);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('خطا در آپلود تصویر');
          return;
        }
      }

      if (!itemTitle) {
        alert('لطفا عنوان آیتم را وارد کنید');
        return;
      }

      const newItem = {
        title: itemTitle,
        categoryId: editingItem ? editingItem.categoryId : uuidv4(),
        image: imageUrl
      };

      const updatedItems = editingItem
        ? selectedGroup.items.map(item => 
            item.categoryId === editingItem.categoryId ? newItem : item
          )
        : [...selectedGroup.items, newItem];

      const updatedGroup = {
        ...selectedGroup,
        items: updatedItems
      };

      await axios.put(`/api/categories/${selectedGroup.id}`, updatedGroup);
      
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );
      
      setIsItemDialogOpen(false);
      setImagePreview('');
      setImageFile(null);
      setItemTitle('');
      setItemImage('');
    } catch (error) {
      console.error('Error saving item:', error);
      alert('خطا در ذخیره آیتم');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // const handleDelete = async (categoryId: string, imagePath: string) => {
  //   try {
  //     // Try to delete the image first
  //     try {
  //       const imageRef = ref(storage, imagePath);
  //       await deleteObject(imageRef);
  //     } catch (error: any) {
  //       // Just log the error and continue with category deletion
  //       console.log('Error deleting image:', error.message);
  //     }

  //     // Always delete the category document, regardless of image deletion success
  //     await deleteDoc(doc(db, 'categories', categoryId));
      
  //     // Update the categories list
  //     setGroups(groups.filter(cat => cat.id !== categoryId));
  //   } catch (error) {
  //     console.error('Error deleting category document:', error);
  //     alert('خطا در حذف دسته‌بندی');
  //   }
  // };

  if (loading || !user || !isAdmin) return null;

  return (
    <FirebaseWrapper>
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
                          src={item.image || '/api/placeholder/50/50'} 
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
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

        {/* Group Edit Dialog */}
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
            <Button 
              onClick={handleSaveItem}
              variant="contained" 
              color="primary"
              disabled={isUploading || !itemTitle}
            >
              {isUploading ? 'در حال آپلود...' : 'ذخیره'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </FirebaseWrapper>
  );
} 