// ------------------------------------------------------------
// Apollo Client – real backend endpoint with auth headers
// ------------------------------------------------------------
import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { getStoredToken, clearStoredAuth, getStoredTenantId } from '@/shared/auth';

// -------------------------------------------------------------------
// Auth link – inject x-tenant-id (always) and Authorization (if token).
// Uses the centralized auth utility – no broad localStorage scan.
// -------------------------------------------------------------------
const authLink = new ApolloLink((operation, forward) => {
  const token = getStoredToken();
  const tenantId = getStoredTenantId();
  
  const headers: Record<string, string> = {};
  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  operation.setContext({ headers });
  return forward(operation);
});

// -------------------------------------------------------------------
// Error link – handle auth errors by clearing session and redirecting.
// Only clears auth for genuine UNAUTHENTICATED/unauthorized errors –
// not for intermittent DB/network failures like "connection is closed".
// -------------------------------------------------------------------
const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const code = (err.extensions?.code as string) || '';
      const msg = (err.message || '').toLowerCase();
      // Only force logout on hard auth failures, not transient DB errors.
      if (
        code === 'UNAUTHENTICATED' ||
        (msg.includes('unauthorized') && !msg.includes('connection'))
      ) {
        clearStoredAuth();
        window.location.href = '/login';
      }
    }
  }
  if (networkError) {
    console.error('[Network error]:', networkError);
    // Dispatch a global event so UI layouts or error components can display a warning banner or overlay.
    window.dispatchEvent(
      new CustomEvent('backend-connection-error', {
        detail: {
          message: networkError.message || 'Failed to fetch. The backend server might be offline or unreachable.',
          url: import.meta.env.VITE_GRAPHQL_ENDPOINT,
        },
      })
    );
  }
});

// ------------------------------------------------------------
// HTTP link – points to the real GraphQL endpoint.
// ------------------------------------------------------------
const httpLink = new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_ENDPOINT });

const link = ApolloLink.from([errorLink, authLink, httpLink]);

export const apolloClient = new ApolloClient({
  link,
  // Default to cache-first to avoid redundant network calls when data is
  // already cached. Pages that need fresh data (after mutations) should
  // override fetchPolicy at the query level or use refetchQueries.
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all' as any,
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all' as any,
    },
  },
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            merge: (_, incoming) => incoming,
          },
          tenantOrders: {
            merge: (_, incoming) => incoming,
          },
          tenantUsers: {
            merge: (_, incoming) => incoming,
          },
          categories: {
            merge: (_, incoming) => incoming,
          },
        },
      },
    },
  }),
});

export default apolloClient;
