FROM node:14 
COPY . /app
WORKDIR /app
RUN npm install 
COPY . .
EXPOSE 9146 

CMD ["npm" , "run" , "start"]


