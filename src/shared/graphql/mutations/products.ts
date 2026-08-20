import { gql } from '@apollo/client';

/**
 * CREATE_PRODUCT
 * ---------------
 * Only requests safe scalar fields that are always resolvable immediately
 * after creation — NO price, effectivePrice, stock, thumbnail, or media.
 * Those require pricing types and media to already be configured and are
 * fetched separately after creation.
 */
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      title
      subtitle
      description
      descriptionLong
      sku
      productType
      thumbnailMediaId
      shippingDimensions {
        weight
        length
        width
        height
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * UPDATE_PRODUCT
 * ---------------
 * Same caution — omit fields that require pricing resolvers.
 */
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: UUID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      title
      subtitle
      description
      descriptionLong
      sku
      productType
      thumbnailMediaId
      shippingDimensions {
        weight
        length
        width
        height
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: UUID!) {
    deleteProduct(id: $id)
  }
`;

export const UPDATE_PRODUCT_STOCK = gql`
  mutation UpdateProductStock($productId: UUID!, $stock: Int!) {
    updateProductStock(productId: $productId, stock: $stock) {
      id
      productId
      stock
    }
  }
`;

export const SET_PRODUCT_PRICE = gql`
  mutation SetProductPrice($input: SetProductPriceInput!) {
    setProductPrice(input: $input) {
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

export const SET_PRODUCT_CATEGORIES = gql`
  mutation SetProductCategories($productId: UUID!, $categoryIds: [UUID!]!) {
    setProductCategories(productId: $productId, categoryIds: $categoryIds) {
      id
    }
  }
`;

export const CREATE_PRICING_TYPE = gql`
  mutation CreatePricingType($input: CreatePricingTypeInput!) {
    createPricingType(input: $input) {
      id
      type
    }
  }
`;
