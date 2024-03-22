import React from 'react'
import Portfolio from './Portfolio/Portfolio'

export default function Home() {
    
  return (
    <div style={{width:"80vw"}}>
      <h1 style={{fontSize:"5rem",margin:"10px"}}>Save<span style={{color:"red"}}>Stock</span></h1>
      <p style={{color:"grey"}}>For designers, solving their greatest problem</p>
      <Portfolio/>
    </div>
  )
}
