const domain = process.env.AUTH0_ISSUER_BASE_URL
const clientId = process.env.AUTH0_MGM_CLIENT_ID
const clientSecret = process.env.AUTH0_MGM_CLIENT_SECRET
const tokenUrl = `${domain}/oauth/token`
const mgmtUrl = `${domain}/api/v2/`

async function getToken() {
  try {
    const body = {
      client_id: clientId,
      client_secret: clientSecret,
      audience: mgmtUrl,
      grant_type: 'client_credentials',
    }
    const options = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }
    const response = await fetch(tokenUrl, options)
    const tokenData = await response.json()
    return tokenData
  } catch (error) {
    console.log(error)
  }
}

export const getUserById = async (id) => {
  try {
    const token = await getToken()
    const response = await fetch(`${mgmtUrl}users/${id}`, {
      headers: { authorization: `Bearer ${token.access_token}` },
    })

    if (response.ok) {
      const { user_id, ...rest } = await response.json()
      return {
        id: user_id,
        ...rest,
      }
    }
  } catch (e) {
    console.log(e)
  }
}
