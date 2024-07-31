# Fuddata webpage
This repository contains open source parts of of Fuddata webpage.

For us security and high performance are most important design priciples which why we built this from scratch without using UI frameworks, minimized usage of 3rd party libraries, we only use cherry picked 3rd party services and we made whole codebase publicly available as open source so anyone can review it.

Contibutions are very welcome but please open issue for discussion first.

# Architecture
* Search engine friendly static HTML pages generated with [PostHTML](https://posthtml.org/)
* CSS managed made easy with [Tailwind CSS](https://tailwindcss.com/)
* Fast load times anywhere in the world by [Cloudflare Pages](https://pages.cloudflare.com/)
* Serveless backend code by [Cloudflace Functions](https://developers.cloudflare.com/pages/functions/) and [Cloudflare Workers KV](https://developers.cloudflare.com/kv/)
* Privacy friendly CAPTCHA alternative by [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
* Privacy-first Web Analytics by [Clouflare](https://blog.cloudflare.com/privacy-first-web-analytics/)
* Cookieless and anonymous usage tracking with EU hosted [PostHog](https://posthog.com/tutorials/cookieless-tracking)

# Development
```shell
cd website
npm run watch
npm run serve
```
