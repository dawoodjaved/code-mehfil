FROM ruby:3.2.0-alpine

RUN apk add --no-cache \
  build-base \
  postgresql-dev \
  nodejs \
  yarn \
  git \
  docker-cli

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 4000

CMD ["rails", "server", "-b", "0.0.0.0", "-p", "4000"]

