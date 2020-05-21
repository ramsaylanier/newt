import React from 'react'
import Sidebar from './sidebar'
import { Box, Grid } from '@chakra-ui/core'

export default function Layout(props) {
  return (
    <Grid
      display="grid"
      templateAreas={`sidebar main`}
      templateColumns={{ md: 'auto 1fr' }}
      templateRows={{ base: 'auto 1fr', md: '100vh' }}
    >
      <Box gridTemplateArea="sidebar">
        <Sidebar />
      </Box>
      <Box gridTemplateArea="main" position="relative">
        {props.children}
      </Box>
    </Grid>
  )
}
