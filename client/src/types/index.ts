export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface Product {
    _id: string;
    slug?: string;
    title: string;
    description: string;
    price: number;
    salePrice?: number;
    discountPercentage?: number;
    images: string[];
    category?: {
        id: string;
        name: string;
        slug: string;
    } | string;
    stock: number;
    vendor: User | string;
    ratingsAverage: number;
    ratingsQuantity: number;
    reviewCount: number;
    lowStockThreshold?: number;
    vendorNotes?: string;
    createdAt: string;
}

export interface Review {
    id: string;
    user: User | string;
    product: string;
    rating: number;
    comment: string;
    sentimentScore: number;
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    priceAtPurchase: number;
}

export interface Cart {
    user: string;
    items: CartItem[];
    totalPrice: number;
}

export interface ShippingAddress {
    id: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    items: {
        product: Product;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    paymentStatus: 'pending' | 'paid';
    orderStatus: OrderStatus;
    trackingNumber: string;
    appliedCoupon?: string;
    discountAmount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface WishlistItem {
    product: Product;
    addedAt: string;
}

export interface Wishlist {
    id: string;
    user: string;
    items: WishlistItem[];
}

export interface Coupon {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    discountAmount: number;
    newTotal: number;
}

