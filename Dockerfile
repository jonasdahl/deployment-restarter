FROM denoland/deno:1.34.1

WORKDIR /app
USER deno

COPY deps.ts .
RUN deno cache deps.ts

ADD . .
RUN deno cache main.ts

EXPOSE 8080
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--allow-run", "--unstable", "main.ts"]