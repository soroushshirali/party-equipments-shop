"use client";
import { Card, CardContent } from '@mui/material';
import { RentalItem } from '../RentalItem';
import { CategoryItem } from '@/types/types';

interface CategorySectionProps {
  title: string;
  items: CategoryItem[];
  groupBorderColor: string;
}

export const CategorySection = ({ title, items, groupBorderColor }: CategorySectionProps) => (
  <Card className="mb-8 shadow-lg max-w-5xl mx-auto">
    <CardContent className="py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-center gap-4">
        {items.map((item, index) => (
          <div key={item.categoryId || index} className="flex justify-center">
            <RentalItem 
              {...item}
              borderColor={groupBorderColor}
            />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
); 