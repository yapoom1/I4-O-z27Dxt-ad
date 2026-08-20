import { gql } from '@apollo/client';

export const GET_PLATFORM_GATEWAYS = gql`
  query GetPlatformGateways {
    platformGateways {
      id
      name
      code
      isActive
    }
  }
`;

export const GET_ACTIVE_PLATFORM_GATEWAY = gql`
  query GetActivePlatformGateway {
    activePlatformGateway {
      id
      name
      code
      isActive
    }
  }
`;

export const GET_TENANT_GATEWAYS = gql`
  query GetTenantGateways {
    tenantGateways {
      id
      tenantId
      gatewayId
      credentials
      webhookSecret
      isActive
    }
  }
`;
