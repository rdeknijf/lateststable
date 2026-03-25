FROM oven/bun:1-alpine
WORKDIR /app
COPY src/ src/
RUN adduser -D -u 1001 app
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["bun", "run", "src/server.ts"]
