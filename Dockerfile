FROM node:22-bookworm-slim

EXPOSE 5679

RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get autoclean -y && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /flagcounter
COPY . .
RUN mkdir static-tmp
RUN mv /flagcounter/src/static/* /flagcounter/static-tmp

RUN npm install

RUN chmod +x /flagcounter/entrypoint.sh

ENTRYPOINT ["/bin/sh", "-c", "/flagcounter/entrypoint.sh"]
