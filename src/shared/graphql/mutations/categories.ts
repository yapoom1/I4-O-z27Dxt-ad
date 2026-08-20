import { gql } from '@apollo/client';

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      title
      parentId
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: UUID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      title
      parentId
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: UUID!) {
    deleteCategory(id: $id)
  }
`;
