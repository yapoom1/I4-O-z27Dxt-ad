import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($search: String) {
    products(search: $search) {
      id
      title
      subtitle
      description
      descriptionLong
      sku
      productType
      thumbnailMediaId
      thumbnail {
        mediaUrl
      }
      stock
      shippingDimensions {
        weight
        length
        width
        height
      }
      categories {
        id
        title
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: UUID!) {
    product(id: $id) {
      id
      title
      subtitle
      description
      descriptionLong
      sku
      productType
      thumbnailMediaId
      stock
      shippingDimensions {
        weight
        length
        width
        height
      }
      createdAt
      updatedAt
      categories {
        id
        title
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name: title
      title
      slug: title
    }
  }
`;

export const GET_PRICING_TYPES = gql`
  query GetPricingTypes {
    pricingTypes {
      id
      name: type
    }
  }
`;

export const GET_PRODUCT_PRICES = gql`
  query GetProductPrices($productId: UUID!) {
    productPrices(productId: $productId) {
      id
      productId
      pricingTypeId
      price
      pricingType {
        id
        name: type
      }
    }
  }
`;
