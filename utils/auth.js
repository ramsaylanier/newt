import React, { useState, useEffect, useContext } from 'react'

export const Auth0Context = React.createContext()
export const useAuth = () => useContext(Auth0Context)
export const Auth0Provider = ({ children }) => {
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('useEffect')
    const initAuth0 = async () => {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:3000/api/auth/me')
        console.log(res)
        if (res.ok) {
          const user = await res.json()
          setUser(user)
        }
        setLoading(false)
      } catch (e) {
        console.log(e)
      }
    }
    initAuth0()
    // eslint-disable-next-line
  }, [])

  return (
    <Auth0Context.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </Auth0Context.Provider>
  )
}
