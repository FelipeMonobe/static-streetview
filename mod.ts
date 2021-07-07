import { sign } from './handler.ts'

addEventListener('fetch', async (event) => {
  const reqUrl = new URL(event.request.url)

  if (reqUrl.pathname === '/img') {
    const url = new URL('https://maps.googleapis.com/maps/api/streetview')

    url.search = reqUrl.searchParams.toString()
    url.search += `&key=${Deno.env.get('key')}`
  
    const signedUrl = sign(url.toString(), Deno.env.get('secret'))
    const fetchResponse = await fetch(signedUrl)
    let response = new Response(null, { status: 404 })

    if (fetchResponse.ok) {
      const blob = await fetchResponse.blob()
      response = new Response(blob, { headers: { 'content-type': 'application/octet-stream' } })
    }

    event.respondWith(response)
  } else {
    const response = new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Static streetview</title>
      </head>
      <body>
        <div>
          <label for="size">Size: </label>
          <input type="text" id="size" value="640x640">
        </div>
        <div>
          <label for="lat">Latitude: </label>
          <input type="text" id="lat" value="-23.571385006891546">
          <label for="lng">Longitude: </label>
          <input type="text" id="lng" value="-46.63972456008196">
        </div>
        <div>
          <label for="heading">Heading: </label>
          <input type="text" id="heading" value="108.78">
        </div>
        <div>
          <label for="pitch">Pitch: </label>
          <input type="text" id="pitch" value="-0.76">
        </div>
        <br>
        <div>
          <button onclick="fetchImgBlob()">
            Fetch image
          </button>
        </div>
        <br>
        <div>
          <img>
        <div>
        <script>
          const reqUrl = new URL(window.location.origin + '/img')

          function fetchImgBlob() {
            reqUrl.search = new URLSearchParams({
              size: document.querySelector('#size').value,
              location: document.querySelector('#lat').value + ',' + document.querySelector('#lng').value,
              heading: document.querySelector('#heading').value, // 0 - 360
              pitch: document.querySelector('#pitch').value, // 0 - 120
              source: 'outdoor',
              return_error_code: true,
            }).toString()
  
            fetch(reqUrl)
            .then((x) => {
              if (x.status !== 200) throw new Error('Error ' + x.status + ' fetching image.')
              return x.blob()
            })
            .then(blob => Reflect.set(document.querySelector('img'), 'src', URL.createObjectURL(blob)))
          }
        </script>
      </body>
      </html>
      `,
      { headers: { 'content-type': 'text/html; charset=UTF-8' } },
    )

    event.respondWith(response)
  }
})