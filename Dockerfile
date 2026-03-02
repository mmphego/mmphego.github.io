FROM ruby:3.3-slim
LABEL maintainer="Mpho Mphego <mpho@mphomphego.co.za>"

COPY custom-ca.pem* /tmp/
RUN if [ -f /tmp/custom-ca.pem ]; then \
      cat /tmp/custom-ca.pem >> /usr/lib/ssl/cert.pem && \
      cat /tmp/custom-ca.pem >> /etc/ssl/certs/ca-certificates.crt && \
      rm /tmp/custom-ca.pem; \
    fi

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential cmake && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /site
COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 4 --retry 3

COPY entrypoint.sh /usr/local/bin/
RUN chmod a+x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
CMD ["bundle", "exec", "jekyll", "serve", "--force_polling", "-H", "0.0.0.0", "-P", "4000"]
