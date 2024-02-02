export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const paramName = searchParams.get('name');
    const paramEmail = searchParams.get('email');
    const paramMessage = searchParams.get('message');

    var body = {
      "personalizations": [
        {
          "to": [
            {
              "email": env.EMAIL_ADDRESS,
            }
          ]
        }
      ],
      "from": {
        "email": env.EMAIL_ADDRESS,
        "name": env.EMAIL_NAME,
      },
      "subject": "Contact form post - " + paramName + " (" + paramEmail + ")",
      "content": [
        {
          "type": "text/plain",
          "value": paramMessage
        }
      ]
    };
    var init = {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization":"Bearer " + env.API_KEY,
      },
    };
    await fetch("https://api.sendgrid.com/v3/mail/send", init);

    const destinationURL = env.REDIRECT_URL;
    const statusCode = 301;
    return Response.redirect(destinationURL, statusCode);
  },
};
