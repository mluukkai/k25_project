FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT}

CMD ["node", "index.js"]

# TAG=5 ; docker build --platform linux/amd64 -t mluukkai/project-todo-wikipedia:$TAG . ; docker push mluukkai/project-todo-wikipedia:$TAG
