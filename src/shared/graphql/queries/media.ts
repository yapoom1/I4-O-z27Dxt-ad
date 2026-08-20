import { gql } from '@apollo/client';

export const GET_MEDIA_LIST = gql`
  query GetMediaList($entityName: String, $entityId: UUID) {
    mediaList(entityName: $entityName, entityId: $entityId) {
      id
      entityName
      entityId
      filePath
      mediaUrl
      mediaType
      fileExtension
      altText
    }
  }
`;

export const GET_MEDIA_ITEM = gql`
  query GetMediaItem($id: UUID!) {
    media(id: $id) {
      id
      entityName
      entityId
      filePath
      mediaUrl
      mediaType
      fileExtension
      altText
    }
  }
`;
