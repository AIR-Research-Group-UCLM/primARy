
FROM node:20.11
ARG API_BASE
ARG LLM_BASE
ARG STATIC_BASE

ENV API_BASE=${API_BASE}
ENV LLM_BASE=${LLM_BASE:-${API_BASE}}
ENV STATIC_BASE=${STATIC_BASE:-${API_BASE}/static}

WORKDIR /app

COPY package.json package-lock.json tsconfig.json next.config.mjs ./
RUN npm ci && npm cache clean --force
COPY src/ ./src
RUN npm run build
CMD ["node", "node_modules/.bin/next", "start"]

EXPOSE 3000
