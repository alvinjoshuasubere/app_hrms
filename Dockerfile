# build stage
FROM node:10-alpine as build-stage
WORKDIR /usr/src/app
COPY package*.json ./

RUN apk update
RUN apk add --no-cache git

# for install digital font
# RUN apk --no-cache add msttcorefonts-installer fontconfig && \
#     update-ms-fonts && \
#     fc-cache -f


# COPY ./install-font.sh /
# RUN chmod +x /install-font.sh
# CMD ["/install-font.sh"]

RUN npm install
COPY . .
RUN npm run build



# production stage
FROM nginx:stable-alpine as production-stage
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /usr/src/app/dist /usr/share/nginx/html
EXPOSE 4004
CMD ["nginx", "-g", "daemon off;"]
