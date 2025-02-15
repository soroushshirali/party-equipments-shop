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
} from '@mui/material';
import { Edit, Delete, Add, ArrowBack } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, addDoc } from 'firebase/firestore';
import { CategoryGroup, CategoryItem } from '@/types/types';
import { ref, uploadBytes, getDownloadURL, deleteObject, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Add this function to resize the image
async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 215;
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
const handleImageUpload = async (file: File): Promise<string> => {
  try {
    // Resize the image before uploading
    const resizedImage = await resizeImage(file);
    
    const storageRef = ref(storage, `categories/${file.name}`);
    await uploadBytes(storageRef, resizedImage);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
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
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('groupTitle'));
      const snapshot = await getDocs(q);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryGroup[];
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
    if (confirm('آیا از حذف این گروه اطمینان دارید؟')) {
      try {
        await deleteDoc(doc(db, 'categories', groupId));
        await loadCategories();
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleCreateGroup = async () => {
    try {
      const newGroup = {
        groupTitle,
        groupBorderColor: selectedColor,
        items: []
      };

      const docRef = await addDoc(collection(db, 'categories'), newGroup);
      
      setGroups(prevGroups => [...prevGroups, { ...newGroup, id: docRef.id }]);
      setIsGroupDialogOpen(false);
      setGroupTitle('');
      setSelectedColor('#000000');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('خطا در ایجاد گروه');
    }
  };

  const handleSaveGroup = async () => {
    try {
      if (selectedGroup) {
        // Editing existing group
        const updatedGroup = {
          ...selectedGroup,
          groupTitle,
          groupBorderColor: selectedColor,
        };

        await setDoc(doc(db, 'categories', selectedGroup.id!), updatedGroup);
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group.id === selectedGroup.id ? updatedGroup : group
          )
        );
      } else {
        // Creating new group
        await handleCreateGroup();
      }
      setIsGroupDialogOpen(false);
    } catch (error) {
      console.error('Error saving group:', error);
      alert('خطا در ذخیره گروه');
    }
  };

  const handleAddItem = (group: CategoryGroup) => {
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

  const handleDeleteItem = async (group: CategoryGroup, item: CategoryItem) => {
    if (confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
      try {
        // Delete the image from Firebase Storage
        if (item.image) {
          const imageRef = storageRef(storage, item.image);
          await deleteObject(imageRef);
        }

        // Update the items in the group
        const updatedItems = group.items.filter(i => i.categoryId !== item.categoryId);
        await setDoc(doc(db, 'categories', group.id!), {
          ...group,
          items: updatedItems
        });

        // Update the local state
        setGroups(prevGroups => 
          prevGroups.map(g => 
            g.id === group.id ? { ...g, items: updatedItems } : g
          )
        );
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      try {
        const imageUrl = await handleImageUpload(file);
        setImagePreview(imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('خطا در آپلود تصویر');
      }
    }
  };

  const handleSaveItem = async () => {
    if (!selectedGroup) return;

    try {
      let imageUrl = itemImage;
      
      if (imageFile) {
        try {
          imageUrl = await handleImageUpload(imageFile);
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

      await setDoc(doc(db, 'categories', selectedGroup.id!), updatedGroup);
      
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
    }
  };

  if (loading || !user || !isAdmin) return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => router.push('/admin-panel')}>
            <ArrowBack />
          </IconButton>
          <h1 className="text-2xl font-bold">مدیریت دسته‌بندی‌ها</h1>
        </div>
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
                        onClick={() => handleDeleteItem(group, item)}
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
      >
        <DialogTitle>
          {selectedGroup ? 'ویرایش گروه' : 'افزودن گروه جدید'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="نام گروه"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
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
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGroupDialogOpen(false)}>انصراف</Button>
          <Button onClick={handleSaveGroup} variant="contained">
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog 
        open={isItemDialogOpen} 
        onClose={(event, reason) => {
          if (reason === 'backdropClick' && isUploading) return;
          if (!isUploading) setIsItemDialogOpen(false);
        }}
        disableEscapeKeyDown={isUploading}
      >
        <DialogTitle>
          {editingItem ? 'ویرایش آیتم' : 'افزودن آیتم جدید'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="عنوان آیتم"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              disabled={isUploading}
            />
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  disabled={isUploading}
                  sx={{ textAlign: 'center' }}
                >
                  {imageFile ? 'تغییر تصویر' : 'انتخاب تصویر'}
                </Button>
              </label>
              {isUploading && (
                <div className="mt-2">
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <p className="text-center text-sm mt-1">
                    در حال آپلود: {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
              {(imagePreview || itemImage) && (
                <div className="mt-2">
                  <img
                    src={imagePreview || itemImage}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsItemDialogOpen(false)}
            disabled={isUploading}
          >
            انصراف
          </Button>
          <Button 
            onClick={handleSaveItem} 
            variant="contained"
            disabled={!itemTitle || isUploading}
          >
            {isUploading ? 'در حال آپلود...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 