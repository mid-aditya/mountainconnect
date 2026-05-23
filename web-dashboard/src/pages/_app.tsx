import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import '@/styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const getLayout = (Component as any).getLayout || ((page: React.ReactNode) => page);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {getLayout(<Component {...pageProps} />)}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: { primary: '#2E7D32', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#D32F2F', secondary: '#fff' },
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
