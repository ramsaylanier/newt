import React from 'react'
import Head from 'next/head'
import Layout from '../shared/layout'
import { Box } from '@chakra-ui/core'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { drag } from 'd3-drag'
import { forceSimulation, forceLink, forceCollide } from 'd3-force'
import { select, event } from 'd3-selection'
import { zoom, zoomIdentity } from 'd3-zoom'

let simulation, node, link, label

const NODE_SIZE = 10
const DISTANCE = NODE_SIZE * 20
const LABEL_SIZE = 12
const LINK_DISTANCE = 50

const query = gql`
  query Graph($name: String!) {
    graph(name: $name) {
      name
      edges {
        _id
        _key
        from {
          _id
        }
        to {
          _id
        }
        blockKeys
      }
      nodes {
        _id
        _key
        title
      }
    }
  }
`

export default function Graph() {
  const rootRef = React.useRef(null)
  const svgRef = React.useRef(null)
  const zoomRef = React.useRef(null)
  const [offset, setOffset] = React.useState({ x: 0, y: 0, k: 1 })

  const { data } = useQuery(query, {
    variables: { name: 'pages_graph' },
  })

  let nodes = data?.graph?.nodes || []
  const edges = data?.graph?.edges || []
  const links = []
  edges.forEach((edge) => {
    const link = { ...edge }
    if (edge.from && edge.to) {
      link.source = edge.from._id
      link.target = edge.to._id
      links.push(link)
    }
  })
  nodes = nodes.map((n) => {
    return {
      id: n._id,
      ...n,
    }
  })

  const width = rootRef?.current?.offsetWidth
  const height = rootRef?.current?.offsetHeight

  // setup initial simulation
  React.useEffect(() => {
    link = select(zoomRef.current)
      .append('g')
      .attr('class', 'links')
      .selectAll('.link')

    label = select(zoomRef.current)
      .append('g')
      .attr('class', 'labels')
      .selectAll('.label')

    node = select(zoomRef.current)
      .append('g')
      .attr('class', 'nodes')
      .selectAll('.node')

    simulation = forceSimulation()
      .velocityDecay(0.9)
      .force('collision', forceCollide().radius(DISTANCE * 2))

    return () => {
      simulation.stop()
    }
  }, [])

  // handle render
  React.useEffect(() => {
    if (nodes.length) {
      render()
    }
  }, [nodes.length, links.length])

  // handle node events
  React.useEffect(() => {
    node = select('.nodes').selectAll('.node').on('.drag', null)
    node.call(handleDrag())

    select(svgRef.current).call(handleZoom()).on('dblclick.zoom', null)

    // set zoom to cached offset
    if (svgRef.current && svgRef.current.width) {
      const t = zoomIdentity.translate(offset.x, offset.y).scale(offset.k)
      select(svgRef.current).call(handleZoom(true).transform, t)
    }

    return () => {
      select(svgRef.current).call(clearZoom())
    }
  }, [nodes.length])

  React.useEffect(() => {
    if (svgRef.current && svgRef.current.width) {
      console.log(offset)
      const t = zoomIdentity.translate(offset.x, offset.y).scale(offset.k)
      select(svgRef.current).call(handleZoom(true).transform, t)
      simulation.alphaTarget(0).restart()
    }
  }, [offset.x, offset.y, offset.k])

  // ZOOM
  const handleZoom = (initialLoad = false) => {
    const zoomStart = () => {}

    const zoomed = () => {
      select(zoomRef.current).attr('transform', event.transform)
    }

    const zoomEnd = () => {
      if (!initialLoad) {
        setOffset({ ...event.transform })
      }
    }

    return zoom().on('start', zoomStart).on('end', zoomEnd).on('zoom', zoomed)
  }

  const clearZoom = () => {
    return zoom().on('start', null).on('end', null).on('zoom', null)
  }

  function handleDrag() {
    function dragstarted(d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
      d.fixed = true
    }

    function dragged(d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(d) {
      if (!event.active) simulation.alphaTarget(0).restart()
    }

    return drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  }

  function tick() {
    label
      .attr('x', (d) => d.x)
      .attr('y', (d) => {
        const offset = NODE_SIZE + LABEL_SIZE * 2
        return d.y + offset
      })

    node
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('stroke', (d) => 'black')
      .attr('r', NODE_SIZE)
      .classed('selected', (d) => d.selected)
      .classed('fixed', (d) => d.fixed)
      .classed('emphasis', (d) => d.emphasis)
      .classed('deemphasis', (d) => d.emphasis === false)

    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .attr('stroke', (d) => 'black')
  }

  function render() {
    // UPDATE LABELS
    label = label.data(nodes, (d) => d.title)
    label.exit().remove()
    label = label
      .enter()
      .append('text')
      .classed('label', true)
      .text((d) => d.title)
      .attr('text-anchor', 'middle')
      .attr('font-size', LABEL_SIZE)
      .attr('stroke', '#000')
      .attr('fill', 'black')
      .attr('stroke-width', 0.5)
      .merge(label)

    // UPDATE NODES
    node = node.data(nodes, (d) => d._id)
    node.exit().remove()
    node = node
      .enter()
      .append('circle')
      .classed('node', true)
      .attr('r', NODE_SIZE)
      .attr('stroke', 'black')
      .attr('stroke-width', 4)
      .attr('fill', '#fff')
      .attr('cursor', 'pointer')
      .merge(node)

    // UPDATE LINKS
    link = link.data(links, (d) => {
      return d._id
    })
    link.exit().remove()
    link = link
      .enter()
      .append('line')
      .classed('link', true)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('cursor', 'help')
      .merge(link)

    simulation.force(
      'link',
      forceLink()
        .id((d) => d.id)
        .distance(LINK_DISTANCE * 3)
    )
    simulation.force('collision', forceCollide().radius(NODE_SIZE * 3))
    simulation.nodes(nodes).on('tick', tick)
    simulation.force('link').links(links)
    simulation.alpha(0.1).restart()
  }
  return (
    <div className="container">
      <Head>
        <title>Knwoledge Graph</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Box width="100%" height="100%" ref={rootRef}>
          <svg ref={svgRef} width={width || 0} height={height || 0}>
            <g
              ref={zoomRef}
              id="zoom-container"
              className="graph-root-container"
            />
          </svg>
        </Box>
      </Layout>
    </div>
  )
}
