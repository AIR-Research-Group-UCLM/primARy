/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        styledComponents: true
    },
    env: {
        API_BASE: process.env.API_BASE,
        LLM_BASE: process.env.LLM_BASE ?? process.env.API_BASE
    }
};

export default nextConfig;
