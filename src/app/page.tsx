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

  return (
    <div className="container mx-auto p-4 md:p-8">
      {categories.map((category, index) => (
        <CategorySection
          key={category.id}
          title={category.groupTitle}
          items={category.items}
          groupBorderColor={category.groupBorderColor}
        />
      ))}
    </div>
  );
}
