import { gql } from '@apollo/client';

export const CREATE_OR_UPDATE_HOMEPAGE_CONFIG = gql`
  mutation CreateOrUpdateHomepageConfig($input: CreateOrUpdateHomepageConfigInput!) {
    createOrUpdateHomepageConfig(input: $input) {
      tenantId
      version
      status
      sections {
        id
        type
        title
        order
        config
      }
    }
  }
`;

export const UPDATE_HOMEPAGE_CONFIG = gql`
  mutation UpdateHomepageConfig($input: UpdateHomepageConfigInput!) {
    updateHomepageConfig(input: $input) {
      tenantId
      version
      status
      sections {
        id
        type
        title
        order
        config
      }
    }
  }
`;
