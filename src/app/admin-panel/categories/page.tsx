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
} from '@mui/material';
import { Edit, Delete, Add, ArrowBack } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { CategoryGroup, CategoryItem } from '@/types/types';

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

  const handleSaveGroup = async () => {
    if (!selectedGroup) return;
    try {
      const updatedGroup = {
        ...selectedGroup,
        groupTitle,
        groupBorderColor: selectedColor,
        items: selectedGroup.items
      };

      await setDoc(doc(db, 'categories', selectedGroup.id!), updatedGroup);
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === selectedGroup.id ? updatedGroup : group
        )
      );
      setIsGroupDialogOpen(false);
    } catch (error) {
      console.error('Error saving group:', error);
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
        const updatedItems = group.items.filter(i => i.categoryId !== item.categoryId);
        await setDoc(doc(db, 'categories', group.id!), {
          ...group,
          items: updatedItems
        });
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

  const handleSaveItem = async () => {
    if (!selectedGroup) return;

    try {
      const newItem = {
        title: itemTitle,
        categoryId: itemTitle.toLowerCase().replace(/ /g, '-'),
        image: itemImage
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
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  if (loading || !user || !isAdmin) return null;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <IconButton onClick={() => router.push('/admin-panel')}>
          <ArrowBack />
        </IconButton>
        <h1 className="text-2xl font-bold">مدیریت دسته‌بندی‌ها</h1>
      </div>

      {groups.map((group) => (
        <div key={group.id} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{group.groupTitle}</h2>
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
        <DialogTitle>ویرایش گروه</DialogTitle>
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
        onClose={() => setIsItemDialogOpen(false)}
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
            />
            <TextField
              fullWidth
              label="آدرس تصویر"
              value={itemImage}
              onChange={(e) => setItemImage(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsItemDialogOpen(false)}>انصراف</Button>
          <Button onClick={handleSaveItem} variant="contained">
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 