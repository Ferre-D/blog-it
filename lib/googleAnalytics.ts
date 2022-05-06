export const pageview = (url) => {
  const window = global.window as any;
  window.gtag("config", process.env.FIREBASE_MEASUREMENT_ID, {
    path_url: url,
  });
};
