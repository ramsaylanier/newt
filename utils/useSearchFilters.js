import React from 'react'

const useSearchFilters = () => {
  const [filters, setFilters] = React.useState([])
  return { filters, setFilters }
}

export default useSearchFilters
