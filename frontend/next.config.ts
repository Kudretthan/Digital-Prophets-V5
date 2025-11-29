import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Source map uyarılarını kapat
  productionBrowserSourceMaps: false,
  
  // Webpack source-map ayarları
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    
    // Source map loader uyarılarını ignore et
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { message: /source-map/ },
      { message: /sourceMapURL/ },
    ];
    
    return config;
  },
};

export default nextConfig;
