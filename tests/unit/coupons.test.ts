import { describe, it, expect } from 'vitest';
import { validateCouponLogic, calculateOrderTotals, CouponData } from '@/lib/coupons';

describe('Coupon Validation Logic Unit Tests', () => {
  const samplePercentageCoupon: CouponData = {
    id: 'c1',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10, // 10%
    min_order_value: 100,
    max_uses: 500,
    times_used: 10,
    is_active: true,
  };

  const sampleFixedCoupon: CouponData = {
    id: 'c2',
    code: 'BREW20',
    discount_type: 'fixed_amount',
    discount_value: 20, // ₹20
    min_order_value: 150,
    max_uses: 200,
    times_used: 5,
    is_active: true,
  };

  it('should successfully validate a active percentage coupon and return correct discount', () => {
    const result = validateCouponLogic(samplePercentageCoupon, 200);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(20); // 10% of 200 = 20
    expect(result.error).toBeUndefined();
  });

  it('should successfully validate a fixed amount coupon', () => {
    const result = validateCouponLogic(sampleFixedCoupon, 200);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(20);
  });

  it('should reject non-existent / null coupon', () => {
    const result = validateCouponLogic(null, 200);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid coupon code');
  });

  it('should reject inactive promo codes', () => {
    const inactiveCoupon: CouponData = {
      ...samplePercentageCoupon,
      is_active: false,
    };
    const result = validateCouponLogic(inactiveCoupon, 200);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('no longer active');
  });

  it('should reject expired promo codes', () => {
    const expiredCoupon: CouponData = {
      ...samplePercentageCoupon,
      expires_at: new Date(Date.now() - 86400000), // Yesterday
    };
    const result = validateCouponLogic(expiredCoupon, 200);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('has expired');
  });

  it('should reject coupons that exceeded max uses', () => {
    const maxedCoupon: CouponData = {
      ...samplePercentageCoupon,
      max_uses: 10,
      times_used: 10,
    };
    const result = validateCouponLogic(maxedCoupon, 200);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('maximum usage limit');
  });

  it('should reject order subtotal below minimum order value', () => {
    const result = validateCouponLogic(samplePercentageCoupon, 50); // Min required is 100
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Minimum order value of ₹100 required');
  });
});

describe('Order Total Calculation Unit Tests', () => {
  it('should accurately calculate subtotal + tax + delivery - discount', () => {
    const subtotal = 200;
    const deliveryFee = 49;
    const tax = 10;
    const discountAmount = 20;

    const totals = calculateOrderTotals(subtotal, deliveryFee, tax, discountAmount);
    expect(totals.subtotal).toBe(200);
    expect(totals.deliveryFee).toBe(49);
    expect(totals.tax).toBe(10);
    expect(totals.discountAmount).toBe(20);
    expect(totals.finalTotal).toBe(239); // 200 + 49 + 10 - 20 = 239
  });

  it('should not allow final total to drop below zero', () => {
    const totals = calculateOrderTotals(10, 0, 0, 50);
    expect(totals.finalTotal).toBe(0);
  });
});
