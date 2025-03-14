// src/app/page.tsx
"use client";
import { useEffect, useState, useRef } from 'react';
import { CircularProgress } from '@mui/material';
import { CategorySection } from '@/components/CategorySection';
import axios from '@/lib/axios';
import { CategoryGroup } from '@/types/types';
import './home.css';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Remove focus and prevent text cursor
  useEffect(() => {
    // Blur any focused element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Add event listener to prevent text cursor
    const container = containerRef.current;
    if (container) {
      const preventTextCursor = (e: MouseEvent) => {
        if (!(e.target instanceof HTMLInputElement) && 
            !(e.target instanceof HTMLTextAreaElement) && 
            !(e.target as HTMLElement).isContentEditable) {
          document.body.style.cursor = 'default';
        }
      };

      container.addEventListener('mousedown', preventTextCursor);
      container.addEventListener('click', preventTextCursor);

      return () => {
        container.removeEventListener('mousedown', preventTextCursor);
        container.removeEventListener('click', preventTextCursor);
      };
    }
  }, [loading]);

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
    <div 
      ref={containerRef}
      className="container mx-auto p-4 md:p-8 home-container" 
      style={{ cursor: 'default' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {categories.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="flex justify-center mb-4">
            <div 
              className="text-center text-2xl md:text-3xl font-bold"
              dir="rtl"
            >
              {category.groupTitle}
            </div>
          </div>
          <CategorySection
            title={category.groupTitle}
            items={category.items}
            groupBorderColor={category.groupBorderColor}
          />
        </div>
      ))}
    </div>
  );
}
