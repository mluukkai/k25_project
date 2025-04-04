FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT}

# Start the application
CMD ["node", "index.js"]

# TAG=6 ; docker build --platform linux/amd64 -t mluukkai/project-todo-app:$TAG . ; docker push mluukkai/project-todo-app:$TAG
