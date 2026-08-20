import { gql } from '@apollo/client';

/**
 * GET_TENANT_USERS
 * -----------------
 * Fetches the list of users/customers for this tenant.
 * Backend query: tenantUsers (requires auth token).
 * Fields confirmed present on the backend UserType.
 */
export const GET_TENANT_USERS = gql`
  query GetTenantUsers {
    tenantUsers {
      id
      name
      email
      mobilenumber
      role
      tenantId
    }
    totalUsers
  }
`;

export const ADMIN_USER_CART = gql`
  query AdminUserCart($userId: UUID!) {
    adminUserCart(userId: $userId) {
      id
      items {
        id
        quantity
        product {
          title
          media {
            mediaUrl
          }
        }
      }
    }
  }
`;
