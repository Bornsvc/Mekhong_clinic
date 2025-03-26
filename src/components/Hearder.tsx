import React, { FC } from 'react'

interface HearderProps {
    title: string;
}

const Hearder: FC<HearderProps> = ( {title} ) => {
  return (
    <div>{title}</div>
  )
}

export default Hearder