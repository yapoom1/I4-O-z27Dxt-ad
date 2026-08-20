import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query GetCategories($search: String) {
    categories(search: $search) {
      id
      parentId
      title
      subtitle
      description
      descriptionLong
      sku
      thumbnailMediaId
      thumbnail {
        id
        mediaUrl
      }
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: UUID!) {
    category(id: $id) {
      id
      parentId
      title
      subtitle
      description
      descriptionLong
      sku
      thumbnailMediaId
      thumbnail {
        id
        mediaUrl
      }
    }
  }
`;
