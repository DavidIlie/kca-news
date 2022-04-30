/** @type {import('next').NextConfig} */
module.exports = {
   reactStrictMode: false,
   swcMinify: true,
   images: {
      domains: [
         "lh3.googleusercontent.com",
         "s3.davidapps.dev",
         "media.davidapps.dev",
         "cdn.davidilie.com",
      ],
   },
   experimental: {
      outputStandalone: true,
      concurrentFeatures: true,
   },
};
