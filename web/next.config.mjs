/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        styledComponents: true
    },
    env: {
        API_BASE: process.env.API_BASE,
        LLM_BASE: process.env.LLM_BASE ?? process.env.API_BASE,
        STATIC_BASE: process.env.STATIC_BASE ?? `${process.env.API_BASE}/static`
    }
};

export default nextConfig;
