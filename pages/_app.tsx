import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import "../styles/globals.css";
import { UserContext } from "../lib/context";
import { useUserData } from "../lib/hooks";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { pageview } from "../lib/googleAnalytics";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const userData = useUserData();

  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.FIREBASE_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-script">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', '${process.env.FIREBASE_MEASUREMENT_ID}');
          `}
      </Script>
      <UserContext.Provider value={userData}>
        <Navbar />
        <Component {...pageProps} />
        <Toaster />
      </UserContext.Provider>
    </>
  );
}

export default MyApp;
