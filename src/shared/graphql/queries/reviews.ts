import { gql } from '@apollo/client';

export const GET_ADMIN_PRODUCT_REVIEWS = gql`
  query GetAdminProductReviews {
    adminProductReviews {
      id
      productId
      ratingPoints
      review
      status
      createdAt
      user {
        id
        email
        username
      }
    }
  }
`;

export const GET_ADMIN_ORDER_REVIEWS = gql`
  query GetAdminOrderReviews {
    adminOrderReviews {
      id
      orderId
      ratingPoints
      review
      status
      createdAt
      user {
        id
        email
        username
      }
    }
  }
`;

export const GET_ADMIN_COMPANY_REVIEWS = gql`
  query GetAdminCompanyReviews {
    adminCompanyReviews {
      id
      tenantId
      ratingPoints
      review
      status
      createdAt
      user {
        id
        email
        username
      }
    }
  }
`;
