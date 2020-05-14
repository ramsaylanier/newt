export const getEntitiesFromText = (text, blockKey) => {
  console.trace('GETTING')
  const options = {
    method: 'POST',
    body: JSON.stringify({ text }),
  }

  return fetch('http://localhost:5000/api/token_tagger', options)
    .then((r) => {
      return r.json()
    })
    .then((r) => {
      return { blockKey, data: r }
    })
}
