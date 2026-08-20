import { gql } from '@apollo/client';

export const GET_COUPONS = gql`
  query GetCoupons {
    coupons {
      id
      code
      description
      discountType
      discountValue
      minOrderValue
      maxDiscountAmount
      startDate
      endDate
      usageLimitTotal
      usageLimitPerUser
      usageCount
      isActive
    }
  }
`;

export const GET_COUPON = gql`
  query GetCoupon($code: String!) {
    coupon(code: $code) {
      id
      code
      description
      discountType
      discountValue
      minOrderValue
      maxDiscountAmount
      startDate
      endDate
      usageLimitTotal
      usageLimitPerUser
      usageCount
      isActive
    }
  }
`;
