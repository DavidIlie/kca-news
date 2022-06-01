const { withPlausibleProxy } = require("next-plausible");

/** @type {import('next').NextConfig} */
module.exports = withPlausibleProxy()({
   reactStrictMode: false,
   swcMinify: true,
   images: {
      domains: ["lh3.googleusercontent.com", "cdn.kcanews.org"],
   },
});
