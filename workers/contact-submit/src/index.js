import { cResponse } from "../../shared.js"

export default {
  async fetch(request, env, ctx) {
    const { searchParams } = new URL(request.url);
    const paramName = searchParams.get('name');
    const paramEmail = searchParams.get('email');
    const paramMessage = searchParams.get('message');

    console.log("Name: " + paramName);
    console.log("Email: " + paramEmail);
    console.log("Message: " + paramMessage);

    body = {
      "personalizations": [
        {
          "to": [
            {
              "email": env.EMAIL,
            }
          ]
        }
      ],
      "from": {
        "email": env.EMAIL,
      },
      "subject": "Contact form post - " + paramName + " (" + paramEmail + ")",
      "content": [
        {
          "type": "text/plain",
          "value": paramMessage
        }
      ]
    };
    init = {
      body: JSON.stringify(body),
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization":"Bearer " + env.API_KEY,
      },
    };
    const Reponse = await fetch("https://api.sendgrid.com", init);
    ResponseJson = await Reponse.json();
    console.log(JSON.stringify(ResponseJson, null,  undefined));


    const destinationURL = "http://192.168.8.40:8080";
    const statusCode = 301;
    return Response.redirect(destinationURL, statusCode);
  },
};
