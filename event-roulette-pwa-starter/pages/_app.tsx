import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (<>
    <Head>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#111827" />
      <link rel="icon" href="/favicon.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Component {...pageProps} />
  </>);
}
