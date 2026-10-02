FROM ruby:3.1.4-slim

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      curl \
      git \
      python3 \
      nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

COPY . .

RUN mkdir -p tmp/pids tmp/cache log storage

ENV RAILS_ENV=production
ENV RACK_ENV=production

EXPOSE 4000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
