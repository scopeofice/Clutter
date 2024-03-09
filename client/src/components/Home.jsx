import React from 'react'
import DisplayGrid from './DisplayGrid'

export default function Home() {
  return (
    <div style={{width:"80vw"}}>
      <h1 className='logo-heading' style={{padding:"20px"}}>Clutter</h1>
      <div  className='search-container'>
      </div>
      <DisplayGrid/>
    </div>
  )
}
