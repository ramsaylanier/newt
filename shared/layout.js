import React from 'react'
import Sidebar from './sidebar'
import { GridItem, Grid } from '@chakra-ui/react'

export default function Layout(props) {
  return (
    <Grid
      display="grid"
      templateAreas={`
        "sidebar main"
      `}
      gridTemplateColumns={{ md: 'auto 1fr' }}
      gridTemplateRows={{ base: '100vh' }}
    >
      <GridItem area="sidebar">
        <Sidebar />
      </GridItem>
      <GridItem area="main" position="relative">
        {props.children}
      </GridItem>
    </Grid>
  )
}
