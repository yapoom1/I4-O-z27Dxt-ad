import { gql } from '@apollo/client';

export const GET_ORDERS = gql`
  query GetOrders($status: String) {
    tenantOrders(status: $status) {
      id
      userId
      user {
        id
        name
        email
        mobilenumber
        addresses {
          customerName
          phoneNumber
          addressLine1
          addressLine2
          landmark
          pincode
          state
          district
        }
      }
      grandTotal
      orderStatus
      paymentStatus
      deliveryService
      createdAt
      deliveryAddress {
        customerName
        phoneNumber
        addressLine1
        addressLine2
        landmark
        pincode
        state
        district
      }
      items {
        quantity
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: UUID!) {
    order(id: $id) {
      id
      userId
      user {
        id
        name
        email
        mobilenumber
        addresses {
          customerName
          phoneNumber
          addressLine1
          addressLine2
          landmark
          pincode
          state
          district
        }
      }
      deliveryService
      deliveryFee
      estimatedDays
      itemTotal
      discountApplied
      tax
      grandTotal
      orderStatus
      paymentStatus
      createdAt
      deliveryAddress {
        customerName
        phoneNumber
        addressLine1
        addressLine2
        landmark
        pincode
        state
        district
      }
      items {
        id
        quantity
        unitPrice
        discountApplied
        subtotal
        product {
          title
          sku
          thumbnail {
            mediaUrl
          }
        }
      }
    }
  }
`;

export const GET_MY_ADDRESSES = gql`
  query GetMyAddresses {
    myAddresses {
      id
      isPrimary
    }
  }
`;

export const GET_DELIVERY_QUOTES = gql`
  query GetDeliveryQuotes($addressId: UUID!) {
    deliveryQuotes(addressId: $addressId) {
      serviceName
      deliveryFee
      estimatedDays
    }
  }
`;

