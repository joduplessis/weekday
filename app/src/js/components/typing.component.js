import React from 'react'
import Loader from 'react-loader-spinner'

export const TypingComponent = props => {
  return <Loader type="ThreeDots" color="#def5ff" height={10} width={15} timeout={3000} />
}
