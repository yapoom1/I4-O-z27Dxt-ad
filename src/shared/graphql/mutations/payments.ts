import { gql } from '@apollo/client';

export const CONFIGURE_PLATFORM_GATEWAY = gql`
  mutation ConfigurePlatformGateway($input: ConfigurePlatformGatewayInput!) {
    configurePlatformGateway(input: $input) {
      id
      isActive
    }
  }
`;

export const ACTIVATE_PLATFORM_GATEWAY = gql`
  mutation ActivatePlatformGateway($id: UUID!) {
    activatePlatformGateway(id: $id) {
      id
      isActive
    }
  }
`;

export const CONFIGURE_TENANT_GATEWAY = gql`
  mutation ConfigureTenantGateway($input: ConfigureTenantGatewayInput!) {
    configureTenantGateway(input: $input) {
      id
      isActive
    }
  }
`;

export const ACTIVATE_TENANT_GATEWAY = gql`
  mutation ActivateTenantGateway($id: UUID!) {
    activateTenantGateway(id: $id) {
      id
      isActive
    }
  }
`;
