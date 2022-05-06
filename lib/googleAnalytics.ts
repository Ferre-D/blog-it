export const pageview = (url) => {
  const window = global.window as any;
  window.gtag("config", "G-GH6KWE53Q3", {
    path_url: url,
  });
};
