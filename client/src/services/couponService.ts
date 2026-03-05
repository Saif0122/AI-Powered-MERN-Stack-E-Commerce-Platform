import api from './api';
import type { Coupon } from '../types';

export const applyCoupon = async (code: string, cartTotal: number) => {
    const response = await api.post('/coupons/apply', { code, cartTotal });
    return response.data.data as Coupon;
};

const couponService = {
    applyCoupon,
};

export default couponService;
