import { gql } from '@apollo/client';

export const GET_DASHBOARD_PRODUCTS = gql`
  query GetDashboardProducts {
    products {
      id
      title
      sku
      stock
    }
  }
`;

export const GET_DASHBOARD_CATEGORIES = gql`
  query GetDashboardCategories {
    categories {
      id
      title
    }
  }
`;

export const GET_DASHBOARD_ORDERS = gql`
  query GetDashboardOrders {
    tenantOrders {
      id
      grandTotal
      orderStatus
      paymentStatus
      createdAt
      deliveryAddress {
        customerName
      }
      items {
        quantity
      }
    }
  }
`;
