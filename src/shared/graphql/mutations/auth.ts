import { gql } from '@apollo/client';

export const LOGIN_WITH_PASSWORD = gql`
  mutation AdminLoginWithPassword($emailOrMobile: String!, $password: String!) {
    adminLoginWithPassword(emailOrMobile: $emailOrMobile, password: $password) {
      tokens {
        accessToken
        refreshToken
        tokenType
      }
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      refreshToken
      tokenType
    }
  }
`;
