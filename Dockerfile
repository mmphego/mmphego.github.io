FROM ruby:3.3.9-slim-bookworm
LABEL maintainer="Mpho Mphego <mpho@mphomphego.co.za>"

COPY custom-ca.pem* /tmp/
RUN if [ -f /tmp/custom-ca.pem ]; then \
      cat /tmp/custom-ca.pem >> /usr/lib/ssl/cert.pem && \
      cat /tmp/custom-ca.pem >> /etc/ssl/certs/ca-certificates.crt && \
      rm /tmp/custom-ca.pem; \
    fi

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential cmake python3 python3-venv && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /site
COPY Gemfile Gemfile.lock ./
ENV BUNDLE_FROZEN=true
RUN gem install bundler -v 2.5.22 && bundle install --jobs 4 --retry 3
COPY requirements-images.txt ./
RUN python3 -m venv /opt/images && /opt/images/bin/pip install -r requirements-images.txt
ENV PATH="/opt/images/bin:$PATH"

COPY entrypoint.sh /usr/local/bin/
RUN chmod a+x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
CMD ["bundle", "exec", "jekyll", "serve", "--force_polling", "-H", "0.0.0.0", "-P", "4000"]
