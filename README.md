# About
This repository contains sources code of Fuddata webpage/webstore.

For us security and user privacy are most important design priciples which why we built this from scratch without using UI frameworks, minimized usage of 3rd party libraries and we made whole codebase publicly available as open source so anyone can review it.

Contibutions are very welcome but please open issue for discussion first.

You can find more detailed readme files about each component from subfolders.

# Development
## Prepare
```shell
openssl req -x509 -newkey rsa:2048 -sha256 -utf8 -days 365 -nodes -config .dev/openssl.conf -keyout .dev/.cert/cert.key -out .dev/.cert/cert.crt
docker build .dev -t wrangler
```
Copy ".dev.vars.template" to ".dev.vars" on all workers folders and fill it with valid settings.

## Usage
```shell
docker compose -f .dev/docker-compose.yml up
```
