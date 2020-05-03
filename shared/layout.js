import React from 'react'
import Sidebar from './sidebar'
import { Box, Grid } from '@chakra-ui/core'

export default function Layout(props) {
  return (
    <Grid
      display="grid"
      templateAreas={`sidebar main`}
      templateColumns="auto 1fr"
      templateRows="100vh"
    >
      <Box gridTemplateArea="sidebar">
        <Sidebar />
      </Box>
      <Box gridTemplateArea="sidebar" position="relative">
        {props.children}
      </Box>
    </Grid>
  )
}
