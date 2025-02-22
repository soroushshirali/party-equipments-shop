export interface ProductSpec {
    width: number;
    height: number;
    weight: number;
    length: number;
  }
  
  export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    originalImage: string;
    categoryId: string;
    categoryTitle: string;
    description?: string;
    specs: ProductSpec;
    quantity?: number;
  }
  
  export interface ProductCategory {
    title: string;
    products: Product[];
  }
  
  export interface ProductData {
    title: string;
    products: Product[];
  }
  
  export interface CategoryItem {
    title: string;
    categoryId: string;
    image: string;
  }
  
  export interface Category {
    title: string;
    items: CategoryItem[];
  }
  
  export interface CategoryGroup {
    id?: string;
    groupTitle: string;
    groupBorderColor: string;
    items: CategoryItem[];
  }
  
  export interface Order {
    id: string;
    userId: string;
    userEmail: string | null;
    userName: string;
    items: Product[];
    totalPrice: number;
    createdAt: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    finalized: boolean;
  }