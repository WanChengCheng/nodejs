# prefer the defacto image with version LTS - Latest LTS version
# ? to update this imagebase, see:https://github.com/nodejs/Release
FROM node:10

# dumb-init enables you to simply prefix your command with dumb-init. 
# It acts as PID 1 and immediately spawns your command as a child process, taking care to properly handle and forward signals as they are received.
# ? to update this binary, see:https://github.com/Yelp/dumb-init/releases
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64
RUN chmod +x /usr/local/bin/dumb-init

# set timezone
RUN echo "Asia/Shanghai" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

# Create app directory
RUN mkdir -p /service \
    && mkdir -p /tmp/dependencies \
    && mkdir -p /int/www \
    && touch /int/www/stats.html

# Install app dependencies
COPY package.json /tmp/dependencies
# install app dependencies with yarn
RUN cd /tmp/dependencies && yarn

COPY . /service
# node_modules should be ignored with configuration in .dockerignore
# still remove it just to be sure
WORKDIR /service
RUN rm -rf node_modules
# create link to where dependencies are installed
RUN ln -s /tmp/dependencies/node_modules

EXPOSE 80

CMD ["dumb-init", "npm", "run", "start"]
