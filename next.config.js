/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@ant-design/icons",
    "antd",
    "@ant-design/cssinjs",
    "rc-util",
    "rc-pagination",
    "rc-picker",
  ],
};

module.exports = nextConfig;
