import React from 'react'

const CoverLetter = async({params}) => {
    const {id} = await params;
    return (
    <div>Coverletter : {id}</div>
  )
}

export default CoverLetter