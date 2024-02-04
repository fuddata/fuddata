# Login
Minimal [Cloudflare Worker](https://developers.cloudflare.com/workers/) for handling passwordless login and logout.

## Architecture
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
