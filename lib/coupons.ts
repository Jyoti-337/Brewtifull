export interface CouponData {
  id?: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount' | string;
  discount_value: number;
  min_order_value: number;
  max_uses: number;
  times_used: number;
  expires_at?: Date | string | null;
  is_active: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  discountAmount: number;
  coupon?: CouponData;
}

/**
 * Pure coupon validation function used by API endpoints and unit tests.
 */
export function validateCouponLogic(coupon: CouponData | null, subtotal: number): CouponValidationResult {
  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code', discountAmount: 0 };
  }

  if (!coupon.is_active) {
    return { valid: false, error: 'This promo code is no longer active', discountAmount: 0 };
  }

  if (coupon.expires_at) {
    const expiryDate = new Date(coupon.expires_at);
    if (expiryDate.getTime() < Date.now()) {
      return { valid: false, error: 'This promo code has expired', discountAmount: 0 };
    }
  }

  if (coupon.times_used >= coupon.max_uses) {
    return { valid: false, error: 'This promo code has reached its maximum usage limit', discountAmount: 0 };
  }

  if (subtotal < coupon.min_order_value) {
    return {
      valid: false,
      error: `Minimum order value of ₹${coupon.min_order_value} required for this promo code`,
      discountAmount: 0,
    };
  }

  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = (subtotal * coupon.discount_value) / 100;
  } else if (coupon.discount_type === 'fixed_amount') {
    discountAmount = Math.min(subtotal, coupon.discount_value);
  }

  // Round to 2 decimal places
  discountAmount = Number(discountAmount.toFixed(2));

  return {
    valid: true,
    discountAmount,
    coupon,
  };
}

/**
 * Pure order total calculation function.
 */
export function calculateOrderTotals(subtotal: number, deliveryFee: number, tax: number, discountAmount: number) {
  const finalTotal = Math.max(0, subtotal + deliveryFee + tax - discountAmount);
  return {
    subtotal: Number(subtotal.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    finalTotal: Number(finalTotal.toFixed(2)),
  };
}
