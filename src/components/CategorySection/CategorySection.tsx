"use client";
import { Card, CardHeader, CardContent, Typography } from '@mui/material';
import { RentalItem } from '../RentalItem';
import { CategoryItem } from '@/types/types';

interface CategorySectionProps {
  title: string;
  items: CategoryItem[];
  groupBorderColor: string;
}

export const CategorySection = ({ title, items, groupBorderColor }: CategorySectionProps) => (
  <Card className="mb-8">
    <CardHeader>
      <Typography className="text-2xl text-center text-gray-800" dir="rtl">
        {title}
      </Typography>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-4 md:gap-8">
        {items.map((item, index) => (
          <RentalItem 
            key={index} 
            {...item}
            borderColor={groupBorderColor}
          />
        ))}
      </div>
    </CardContent>
  </Card>
); 