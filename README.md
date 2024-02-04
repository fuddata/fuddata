# About
This repository contains sources code of Fuddata webpage/webstore.

For us security and user privacy are most important design priciples which why we built this from scratch without using UI frameworks, minimized usage of 3rd party libraries and we made whole codebase publicly available as open source so anyone can review it.

Contibutions are very welcome but please open issue for discussion first.

You can find more detailed readme files about each component from subfolders.

# Development
```shell
wrangler pages dev --compatibility-date=2024-02-04 --port 8888 . --kv=SESSIONS
```

# Components
## Frontend
Frontend as single page application. Implemented with vanilla HTML + CSS + JavaScript without any 3rd party frameworks for maximal security and code readability.

Borrowing core routing logic from: https://github.com/dcode-youtube/single-page-app-vanilla-js

## Login function
Minimal [Cloudflare Worker](https://developers.cloudflare.com/workers/) for handling passwordless login and logout.

* Generating 12 digits long, unique session ID for each login and store it to [Cloudflare Workers KV](https://developers.cloudflare.com/kv/) which is also used as authentication token.
  * Use SHA256 hash of user's email address as user ID.
  * Also store SHA256 hash of user's IP address
  * On this point session is valid on 5 minutes.
* Send first 6 digits back to client.
* Send rest of the digits as email to user by using SendGrid.
* Verify session when user send valid authentication token.
  * Email address hash is still same than on original request.
  * Verity that IP address has is still same than on original request.
  * Extend session validation to two hours.

Note! Because this is minimal implementation, logout will only remove session ID from client side.
Server side will be automatically cleaned up after session expires.

You can find email template on HTML and plain text formats in "sendgrid" folder.
