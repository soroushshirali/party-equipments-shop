export interface ProductSpec {
    width: string;
    height: string;
    weight: string;
  }
  
  export interface Product {
    id: number;
    name: string;
    price: string;
    specs: ProductSpec;
    image: string;
    quantity?: number;
    categoryTitle: string;
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