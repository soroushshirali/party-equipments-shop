"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import { ShoppingCart, X, ChevronUp, ChevronDown } from 'lucide-react';
import Typography from '@mui/material/Typography';

// Product data
const productData = {
  "chair-hire": {
    title: "صندلی",
    products: [
      {
        id: 1,
        name: "Kids Chair Hire",
        price: "$2.50",
        specs: {
          width: "38cm",
          height: "38cm",
          weight: "Ultra durable plastic chair",
        },
        image: "/api/placeholder/215/215",
      },
      {
        id: 2,
        name: "Kids Mesh Chair",
        price: "$3.00",
        specs: {
          width: "41cm",
          height: "38cm",
          weight: "Durable mesh design",
        },
        image: "/api/placeholder/215/215",
      },
      {
        id: 3,
        name: "White Plastic Stackable Chair",
        price: "$2.50",
        specs: {
          width: "45cm",
          height: "45cm",
          weight: "Stackable design",
        },
        image: "/api/placeholder/215/215",
      },
    ]
  },
  // Add other categories as needed
};

interface ProductSpec {
  width: string;
  height: string;
  weight: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  specs: ProductSpec;
  image: string;
  quantity?: number;
}

const CartItem = ({ item, onRemove, onUpdateQuantity }) => (
  <div className="flex items-center justify-between p-2 border-b">
    <div className="flex items-center gap-2">
      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
      <div>
        <p className="font-bold">{item.name}</p>
        <p className="text-sm">{item.price}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronUp size={16} />
        </button>
        <span>{item.quantity}</span>
        <button 
          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronDown size={16} />
        </button>
      </div>
      <button 
        onClick={() => onRemove(item.id)}
        className="p-1 hover:bg-red-100 rounded"
      >
        <X size={16} className="text-red-500" />
      </button>
    </div>
  </div>
);

const Cart = ({ items, onRemove, onUpdateQuantity, isOpen, onToggle }) => {
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-80">
        <div 
          className="p-4 bg-gray-50 rounded-t-lg flex justify-between items-center cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <span className="font-bold">سبد خرید</span>
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
              {items.length}
            </span>
          </div>
          <span>${total.toFixed(2)}</span>
        </div>
        {isOpen && (
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-center text-gray-500">سبد خرید خالی است</p>
            ) : (
              <>
                {items.map(item => (
                  <CartItem 
                    key={item.id} 
                    item={item}
                    onRemove={onRemove}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                ))}
                <div className="p-4">
                  <Button className="w-full">تکمیل خرید</Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductView = ({ category, onBack, cart, setCart }) => {
  const products = productData[category]?.products || [];
  const [isCartOpen, setIsCartOpen] = useState(true);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Cart 
        items={cart}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        isOpen={isCartOpen}
        onToggle={() => setIsCartOpen(!isCartOpen)}
      />
      
      <Button 
        onClick={onBack}
        className="mb-6"
      >
        بازگشت به دسته‌بندی‌ها
      </Button>
      
      <h2 className="text-2xl font-bold mb-6 text-right">
        {productData[category]?.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-4">
              <h3 className="font-bold mb-2 text-right">{product.name}</h3>
              <p className="text-lg mb-2 text-right">{product.price}</p>
              <div className="space-y-2 text-sm text-right">
                {Object.entries(product.specs).map(([key, value]) => (
                  <p key={key}>{key}: {value}</p>
                ))}
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => addToCart(product)}
              >
                افزودن به سبد خرید
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const RentalItem = ({ title, borderColor = "border-red-500", onSelect }) => (
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
    <div
      className={`relative w-[215px] h-[215px] rounded-full border-4 ${borderColor} overflow-hidden mb-4 
                  hover-bounce cursor-pointer`}
      onClick={onSelect}
    >
      <img
        src="/api/placeholder/215/215"
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
    <div
      className={`text-center px-4 py-2 rounded-full text-sm border-4 ${borderColor} min-w-24
                 hover-bounce cursor-pointer font-bold`}
      dir="rtl"
      onClick={onSelect}
    >
      {title}
    </div>
  </div>
);

const CategorySection = ({ title, items, onSelectCategory }) => (
  <Card className="mb-8">
    <CardHeader>
      <Typography className="text-2xl text-center text-gray-800" dir="rtl">{title}</Typography>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap justify-center gap-8">
        {items.map((item, index) => (
          <RentalItem 
            key={index} 
            {...item} 
            onSelect={() => onSelectCategory(item.categoryId)}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

const PartyRentalGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(true);

  const categories = [
    {
      title: "میز و صندلی",
      items: [
        { title: "مبلمان بار", categoryId: "bar-furniture" },
        { title: "اجاره صندلی", categoryId: "chair-hire" },
        { title: "مبل و نیمکت", categoryId: "couch-ottoman" },
        { title: "اجاره میز", categoryId: "table-hire" },
      ]
    },
    {
      title: "چادر، غرفه و چتر",
      items: [
        { title: "اجاره چادر", categoryId: "marquee-hire", borderColor: "border-purple-500" },
        { title: "اجاره غرفه", categoryId: "stall-hire", borderColor: "border-purple-500" },
        { title: "اجاره چتر", categoryId: "umbrella-hire", borderColor: "border-purple-500" },
        { title: "اجاره چادر سیار", categoryId: "popup-marquee", borderColor: "border-purple-500" },
      ]
    },
    {
      title: "صوت، نور و تصویر",
      items: [
        { title: "سیستم صوتی", categoryId: "audio" },
        { title: "دستگاه پخش موسیقی", categoryId: "jukebox" },
        { title: "تریبون", categoryId: "lectern" },
        { title: "نورپردازی", categoryId: "lighting" },
        { title: "میکروفون", categoryId: "microphone" },
        { title: "دستگاه افکت", categoryId: "effects" },
        { title: "اجاره تلویزیون", categoryId: "tv-hire" },
        { title: "پروژکتور و پرده", categoryId: "projector" },
      ]
    }
  ];

  if (selectedCategory) {
    return (
      <ProductView 
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
        cart={cart}
        setCart={setCart}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8" dir="rtl">
      <Cart 
        items={cart}
        onRemove={(id) => setCart(cart.filter(item => item.id !== id))}
        onUpdateQuantity={(id, quantity) => {
          setCart(cart.map(item =>
            item.id === id ? { ...item, quantity } : item
          ));
        }}
        isOpen={isCartOpen}
        onToggle={() => setIsCartOpen(!isCartOpen)}
      />
      {categories.map((category, index) => (
        <CategorySection 
          key={index} 
          {...category} 
          onSelectCategory={setSelectedCategory}
        />
      ))}
    </div>
  );
};

export default PartyRentalGrid;
