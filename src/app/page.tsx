// src/app/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { CategorySection } from '@/components/CategorySection';
import { useCategories } from '@/hooks/useCategories';

export default function Home() {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Group categories by groupTitle
  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.groupTitle]) {
      acc[category.groupTitle] = [];
    }
    acc[category.groupTitle].push(category);
    return acc;
  }, {} as Record<string, typeof categories>);

  return (
    <div className="container mx-auto p-4 md:p-8">
      {Object.entries(groupedCategories).map(([groupTitle, groupCategories]) => (
        <div key={groupTitle} className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-center">{groupTitle}</h2>
          {groupCategories.map((category) => (
            <CategorySection
              key={category.id}
              title={category.title}
              items={category.items}
              groupBorderColor={category.groupBorderColor}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
