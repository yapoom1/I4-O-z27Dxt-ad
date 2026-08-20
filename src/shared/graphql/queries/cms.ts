import { gql } from '@apollo/client';

export const GET_HOMEPAGE_CONFIG = gql`
  query GetHomepageConfig {
    homepageConfig {
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

export const GET_PUBLISHED_HOMEPAGE = gql`
  query GetPublishedHomepage {
    publishedHomepage
  }
`;
