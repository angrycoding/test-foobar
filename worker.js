
const html = `<!DOCTYPE html>
<body>
<script>
   const name = "Ruslan";
   const quote = "Curiosity kill the cat";
 </script>
 <script src="/foo"></script>
 
 <h1>Hello World</h1>
  <p>This markup was generated by a Cloudflare Worker.</p>
</body>`;

async function handleRequestHTML(request) {
  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  });
}

async function handleRequestPost(request) {

	let clonedBody = await request.clone().json();

	return new Response(`{"visitorIP": "127.0.0.1"}`, {
		headers: {
			'content-type': 'application/json',
			'Set-Cookie': `name=${clonedBody.name}; quote=${clonedBody.quote}`,
			// 'Set-Cookie': `; Expires=${new Date().getTime() + 1000 * 60 * 60 * 24}`
		}
	})
}

async function handleRequestScript(request) {
	return new Response(`
		const getCookie = (name) => {
			var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
			if (match) return match[2];
	  	};
		const nameCookie = getCookie('name');
		const quoteCookie = getCookie('quote');
		if (nameCookie && quoteCookie) {
			console.info(nameCookie, quoteCookie);
		} else {

			fetch('/post', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({name, quote})
			})
			
			.then(response => response.json())
			.then(response => {
				console.info(response);
			})
		}
		
	`, {
	  headers: {
		'content-type': 'text/javascript;charset=UTF-8',
	  },
	});
  }

  
addEventListener('fetch', event => {
	
	if (event.request.url.endsWith('/foo')){
		return event.respondWith(handleRequestScript(event.request));
	}
	
	else if (event.request.url.endsWith('/post')){
		return event.respondWith(handleRequestPost(event.request));
	}
	
	else {
		return event.respondWith(handleRequestHTML(event.request));
	}
});

// addEventListener('fetch', event => {
//   event.respondWith(handleRequest(event.request))
// })
// /**
//  * Respond with hello worker text
//  * @param {Request} request
//  */
// async function handleRequest(request) {
//   return new Response('Hello worker!', {
//     headers: { 'content-type': 'text/plain' },
//   })
// }
