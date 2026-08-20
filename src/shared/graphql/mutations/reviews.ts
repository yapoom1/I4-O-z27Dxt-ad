import { gql } from '@apollo/client';

export const UPDATE_PRODUCT_REVIEW_STATUS = gql`
  mutation UpdateProductReviewStatus($id: UUID!, $status: String!) {
    updateProductReviewStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_ORDER_REVIEW_STATUS = gql`
  mutation UpdateOrderReviewStatus($id: UUID!, $status: String!) {
    updateOrderReviewStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_COMPANY_REVIEW_STATUS = gql`
  mutation UpdateCompanyReviewStatus($id: UUID!, $status: String!) {
    updateCompanyReviewStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;
