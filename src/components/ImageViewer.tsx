"use client";
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog } from '@mui/material';

interface ImageViewerProps {
  thumbnailUrl: string;
  originalUrl: string;
  alt: string;
}

export const ImageViewer = ({ thumbnailUrl, originalUrl, alt }: ImageViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="relative group w-full h-full">
        <img 
          src={thumbnailUrl} 
          alt={alt} 
          className="w-full h-full object-contain rounded-lg"
        />
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      <Dialog 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <div className="relative p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md z-10 hover:bg-gray-100"
          >
            ✕
          </button>
          <img 
            src={originalUrl} 
            alt={alt} 
            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      </Dialog>
    </>
  );
}; 