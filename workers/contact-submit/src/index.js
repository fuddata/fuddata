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
		const destinationURL = "http://192.168.8.40:8080";
		const statusCode = 301;
		return Response.redirect(destinationURL, statusCode);
	},
};
