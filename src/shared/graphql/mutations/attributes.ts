import { gql } from '@apollo/client';

export const CREATE_ATTRIBUTE = gql`
  mutation CreateAttribute($input: CreateAttributeInput!) {
    createAttribute(input: $input) {
      id
    }
  }
`;

export const CREATE_ATTRIBUTE_VALUE = gql`
  mutation CreateAttributeValue($input: CreateAttributeValueInput!) {
    createAttributeValue(input: $input) {
      id
    }
  }
`;

export const ASSIGN_ATTRIBUTE_VALUE_TO_PRODUCT = gql`
  mutation AssignAttributeValueToProduct($productId: UUID!, $attributeValueId: UUID!) {
    assignAttributeValueToProduct(productId: $productId, attributeValueId: $attributeValueId) {
      id
    }
  }
`;
