import { gql } from '@apollo/client';

export const UPDATE_TENANT_GENERAL = gql`
  mutation UpdateTenantGeneral($input: UpdateTenantInput!) {
    updateTenant(input: $input) {
      id
      businessName
      contactTelephone
      whatsappNumber
      supportEmail
      gstinCode
      currency
    }
  }
`;

export const UPDATE_TENANT_API_KEYS = gql`
  mutation UpdateTenantApiKeys($input: UpdateTenantInput!) {
    updateTenant(input: $input) {
      id
      paymentPublicKey
      paymentSandboxMode
    }
  }
`;
