FROM node:20.11-bullseye
RUN npm install -g wrangler
WORKDIR /worker
ENTRYPOINT ["/usr/local/bin/wrangler", "dev", "--ip", "0.0.0.0"]
USER 1000
