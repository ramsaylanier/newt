import React from 'react'

const useResizeObserver = (containerRef, callback) => {
  if (typeof window !== 'undefined') {
    const resizeObserver = React.useMemo(() => {
      return new ResizeObserver((entries) => {
        for (let entry of entries) {
          callback(entry)
        }
      })
    }, [callback])

    React.useLayoutEffect(() => {
      if (containerRef) {
        resizeObserver.observe(containerRef)
        return () => {
          resizeObserver.unobserve(containerRef)
        }
      }
    }, [containerRef])
  }
}

export default useResizeObserver
