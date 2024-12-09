import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./layout";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
const queryClient = new QueryClient();

const kefir = localFont({
  src: [
    {
      path: "../fonts/Kefir-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
});

const filsonPro = localFont({
  src: [
    {
      path: '../fonts/FilsonProBook.otf',
      weight: '350',
      style: 'normal',
    },

    {
      path: '../fonts/FilsonProRegular.otf',
      weight: '400',
      style: 'normal',
    },

    {
      path: '../fonts/FilsonProMedium.otf',
      weight: '500',
      style: 'normal',
    },

    {
      path: '../fonts/FilsonProBookItalic.otf',
      weight: '350',
      style: 'italic',
    },
    {
      path: '../fonts/FilsonProBold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/FilsonProBoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <style jsx global>{`
          html {
            font-family: ${filsonPro.style.fontFamily}, ${kefir.style.fontFamily};
          }
        `}</style>
        <Layout>
          <Analytics />
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </QueryClientProvider>
  );
}
