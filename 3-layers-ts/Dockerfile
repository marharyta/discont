# Base image
# FROM alpine
# FROM node:6.14
FROM node:alpine

WORKDIR ./
COPY ./ ./
# Install some dependencies
RUN yarn install

# Default command
CMD ["yarn", "dev"]

#run docker build .
# run docker build -t riittagirl/discont .

#docker run -p 8000:8000 riittagirl/discont:latest

# Successfully built f073faf38e00
# Successfully tagged riittagirl/discont:latest 
# 192.168.99.100.
# 192.168.99.100:8080
#docker run -it  riittagirl/discont:latest sh

# https://github.com/facebook/docusaurus/issues/2648