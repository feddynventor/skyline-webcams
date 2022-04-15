FROM node

WORKDIR /usr/share/app

COPY package*.json ./
RUN npm install

COPY * ./
CMD [ "node", "server.js" ]
