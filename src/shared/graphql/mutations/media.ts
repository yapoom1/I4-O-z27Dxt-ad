import { gql } from '@apollo/client';

export const CREATE_MEDIA = gql`
  mutation CreateMedia($input: CreateMediaInput!) {
    createMedia(input: $input) {
      id
      mediaUrl
    }
  }
`;

export const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: UUID!) {
    deleteMedia(id: $id)
  }
`;
