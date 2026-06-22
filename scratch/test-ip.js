const http = require('http');

http.get('http://ip-api.com/json/2406:da18:1f7e:b100:9899:4cd2:ee95:fc9d', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (e) => {
  console.error(e);
});
