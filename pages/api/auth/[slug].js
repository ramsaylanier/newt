import auth0 from '../../../utils/auth-server'

export default async function auth(req, res) {
  const {
    query: { slug },
  } = req

  try {
    if (slug === 'login') {
      await auth0.handleLogin(req, res)
    }

    if (slug === 'logout') {
      await auth0.handleLogout(req, res)
    }

    if (slug === 'callback') {
      await auth0.handleCallback(req, res, { redirectTo: '/' })
    }

    if (slug === 'me') {
      await auth0.handleProfile(req, res)
    }
  } catch (error) {
    console.error(error)
    res.status(error.status || 400).end(error.message)
  }
}
