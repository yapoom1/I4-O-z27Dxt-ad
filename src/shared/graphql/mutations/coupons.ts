import { gql } from '@apollo/client';

export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) {
      id
      code
    }
  }
`;

export const UPDATE_COUPON_STATUS = gql`
  mutation UpdateCouponStatus($id: UUID!, $isActive: Boolean!) {
    updateCouponStatus(id: $id, isActive: $isActive) {
      id
      isActive
    }
  }
`;
