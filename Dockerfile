FROM ruby:2.5-alpine
LABEL Mpho Mphego <mpho112@gmail.com>

RUN apk add --no-cache build-base gcc bash cmake
RUN gem install bundler rails jekyll
WORKDIR /site
COPY entrypoint.sh /usr/local/bin/
RUN chmod a+x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
CMD [ "bundle", "exec", "jekyll", "serve", "--force_polling", "-H", "0.0.0.0", "-P", "4000" ]