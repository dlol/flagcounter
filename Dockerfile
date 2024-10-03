FROM node:22-bookworm-slim

EXPOSE 5679

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get autoclean -y && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /flagcounter
COPY . .
RUN npm install

CMD ["npm", "start"]
