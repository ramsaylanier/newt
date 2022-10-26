import Cors from 'cors'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

async function getPages(filter = null, offset = 0, count = 10) {
  try {
    const query = `
      query AllPages($filters: [FilterInput], $offset: Int, $count: Int) {
        currentUser {
          id
          pages(filters: $filters, offset: $offset, count: $count) {
            _id
            _key
            title
            private
            owner {
              id
            }
          }
        }
      }
    `

    const filters = filter ? [{ filter }] : []

    const res = await fetch('http://localhost:3000/api/graphql', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify({ query, variables: { filters, offset, count } }),
    })
    console.log({ res })
    const { data } = await res.json()
    console.log({ data })

    return data
  } catch (e) {
    console.log(e)
  }
}

async function handler(req, res) {
  await runMiddleware(req, res, cors)
  const pages = await getPages()
  console.log({ pages })
  res.json({ pages })
}

export default handler
