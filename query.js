fetch('https://i4-o-z27-dxt.vercel.app/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ __type(name: "UserType") { name fields { name type { name kind } } } }' })
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2)));
