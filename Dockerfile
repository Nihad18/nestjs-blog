# Stage 1: Build the app
FROM node:21-alpine3.18 as build

WORKDIR /frontend

COPY /frontend/nextjs-blog-frontend/package*.json ./

RUN npm install

COPY ./frontend/nextjs-blog-frontend/ .

RUN npm run build

#-------------------------------------------------------------------
EXPOSE 3000

# # Command to run the application
CMD ["npm", "run", "start"]