FROM postgres:17

WORKDIR /myapp

COPY script.sh script.sh
COPY package.json package.json
COPY index.js index.js

RUN apt-get update && apt-get install -y curl && \
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
  apt-get install -y nodejs && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

RUN npm install

RUN chmod +x script.sh

CMD ["./script.sh"]

# TAG=14 ; docker build --platform linux/amd64 -t mluukkai/project-backup:$TAG . ; docker push mluukkai/project-backup:$TAG
