export default {
	async fetch(request, env, ctx) {
		const { searchParams } = new URL(request.url)
		const paramEmail = searchParams.get('email')
		let paramProductId = searchParams.get('productid')
		let paramCount = searchParams.get('count')
		return new Response('Hello ' + paramEmail, {
			status: 200,
			headers: {
			  "Content-Type": "text/plain"
			}
		  });
	},
};
