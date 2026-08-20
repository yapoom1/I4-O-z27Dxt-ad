import { gql } from '@apollo/client';

export const GET_DELIVERY_RULES = gql`
  query GetDeliveryRules {
    deliveryRules {
      id
      field
      operator
      value
      carrier
      createdAt
      updatedAt
    }
  }
`;

export const GET_DELIVERY_AGENTS = gql`
  query GetDeliveryAgents {
    deliveryAgents {
      id
      name
      zone
      activeOrders
      status
      createdAt
      updatedAt
    }
  }
`;
