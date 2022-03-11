import React from 'react'
import { NextSeo } from 'next-seo'

const Home: React.FC = () => {
  return (
    <>
      <NextSeo title="Home" />
      <div className="flex min-h-screen flex-col items-center justify-center py-2"></div>
    </>
  )
}

export default Home
