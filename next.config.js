/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  // async rewrites() {
  //   return [
  //     {
  //       source: '/proxy/:hash',
  //       destination: `https://olive-solid-chinchilla-526.mypinata.cloud/ipfs/:hash`,
  //     },
  //   ];
  // },

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      o1js: require("path").resolve("node_modules/o1js"),
    };
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  // To enable o1js for the web, we must set the COOP and COEP headers.
  // See here for more information: https://docs.minaprotocol.com/zkapps/how-to-write-a-zkapp-ui#enabling-coop-and-coep-headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
