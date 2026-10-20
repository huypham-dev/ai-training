/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // @copilotkit/shared pulls posthog-node (telemetry) into the client bundle,
      // and its node build imports `node:fs` / `node:readline`, which webpack
      // can't resolve for the browser. Strip the scheme and stub the modules.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        readline: false,
      };
    }
    return config;
  },
};

export default nextConfig;
