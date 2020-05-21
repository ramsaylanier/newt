import React from 'react'
import { Box } from '@chakra-ui/core'
import useResizeObserver from '../utils/useResizeObserver'

const ResponsiveContainer = (props) => {
  const containerRef = React.useRef(null)
  const [breakpoint, setBreakpoint] = React.useState('base')
  const breakpoints = props.components
  useResizeObserver(containerRef?.current, (entry) => {
    // do stuff here when the size changes
    props.onResize(entry)
  })

  const Component =
    props.components.find((c) => c.breakpoint === breakpoint)?.component || null

  return Component
}

export default ResponsiveContainer
