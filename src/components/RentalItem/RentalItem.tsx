"use client";
import Link from 'next/link';

interface RentalItemProps {
  title: string;
  categoryId: string;
  borderColor?: string;
}

export const RentalItem = ({ title, categoryId, borderColor = "border-red-500" }: RentalItemProps) => (
  <div className="flex flex-col items-center p-2">
    <style>{`
      @keyframes bounce-scale {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .hover-bounce:hover {
        animation: bounce-scale 0.8s ease-in-out infinite;
      }
    `}</style>
    <Link href={`/products/${categoryId}`}>
      <div
        className={`relative w-[150px] h-[150px] md:w-[215px] md:h-[215px] rounded-full border-4 ${borderColor} 
                    overflow-hidden mb-4 hover-bounce cursor-pointer`}
      >
        <img
          src="/api/placeholder/215/215"
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className={`text-center px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm border-4 ${borderColor} 
                   min-w-20 md:min-w-24 hover-bounce cursor-pointer font-bold`}
        dir="rtl"
      >
        {title}
      </div>
    </Link>
  </div>
); 