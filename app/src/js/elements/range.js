import React from 'react'
import styled from 'styled-components'
const Container = styled.div`
  position: relative;
  width: 100%;

  input[type='range'].range {
    -webkit-appearance: none;
    outline: none;
    border: 0;
    width: 100%;
  }

  input[type='range'].range:focus {
    outline: none;
    border: 0;
  }

  input[type='range'].range::-webkit-slider-runnable-track {
    width: 100%;
    height: 4.5px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
    background: #ededed;
    border-radius: 0px;
    border: 0px solid #010101;
  }

  input[type='range'].range::-webkit-slider-thumb {
    box-shadow: 0px 0px 5.6px rgba(0, 0, 0, 0.25), 0px 0px 0px rgba(13, 13, 13, 0.25);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 24px;
    width: 24px;
    border-radius: 50px;
    background: #ffffff;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -9.75px;
  }

  input[type='range'].range:focus::-webkit-slider-runnable-track {
    background: #ffffff;
  }

  input[type='range'].range::-moz-range-track {
    width: 100%;
    height: 4.5px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
    background: #ededed;
    border-radius: 0px;
    border: 0px solid #010101;
  }

  input[type='range'].range::-moz-range-thumb {
    box-shadow: 0px 0px 5.6px rgba(0, 0, 0, 0.25), 0px 0px 0px rgba(13, 13, 13, 0.25);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 24px;
    width: 24px;
    border-radius: 50px;
    background: #ffffff;
    cursor: pointer;
  }

  input[type='range'].range::-ms-track {
    width: 100%;
    height: 4.5px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }

  input[type='range'].range::-ms-fill-lower {
    background: #c4c4c4;
    border: 0px solid #010101;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  }

  input[type='range'].range::-ms-fill-upper {
    background: #ededed;
    border: 0px solid #010101;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  }

  input[type='range'].range::-ms-thumb {
    box-shadow: 0px 0px 5.6px rgba(0, 0, 0, 0.25), 0px 0px 0px rgba(13, 13, 13, 0.25);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 24px;
    width: 24px;
    border-radius: 50px;
    background: #ffffff;
    cursor: pointer;
    height: 4.5px;
  }

  input[type='range'].range:focus::-ms-fill-lower {
    background: #ededed;
  }

  input[type='range'].range:focus::-ms-fill-upper {
    background: #ffffff;
  }

  input[type='range'].range {
    -webkit-appearance: none;
    width: 100%;
    margin: 9.75px 0;
    border: 0;
    outline: none;
  }

  input[type='range'].range:focus {
    outline: none;
    border: 0;
  }

  input[type='range'].range::-webkit-slider-runnable-track {
    width: 100%;
    height: 4.5px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
    background: #ededed;
    border-radius: 0px;
    border: 0px solid #010101;
  }

  input[type='range'].range::-webkit-slider-thumb {
    box-shadow: 0px 0px 5.6px rgba(0, 0, 0, 0.25), 0px 0px 0px rgba(13, 13, 13, 0.25);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 24px;
    width: 24px;
    border-radius: 50px;
    background: #ffffff;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -9.75px;
  }

  input[type='range'].range:focus::-webkit-slider-runnable-track {
    background: #ffffff;
  }

  input[type='range'].range::-moz-range-track {
    width: 100%;
    height: 4.5px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
    background: #ededed;
    border-radius: 0px;
    border: 0px solid #010101;
  }

  input[type='range'].range::-moz-range-thumb {
    box-shadow: 0px 0px 5.6px rgba(0, 0, 0, 0.25), 0px 0px 0px rgba(13, 13, 13, 0.25);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 24px;
    width: 24px;
    border-radius: 50px;
    background: #ffffff;
    cursor: pointer;
  }

  input[type='range'].range::-ms-track {
    width: 100%;
    height: 4.5px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }

  input[type='range'].range::-ms-fill-lower {
    background: #c4c4c4;
    border: 0px solid #010101;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  }

  input[type='range'].range::-ms-fill-upper {
    background: #ededed;
    border: 0px solid #010101;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  }

  input[type='range'].range::-ms-thumb {
    box-shadow: 0px 0px 5.6px rgba(0, 0, 0, 0.25), 0px 0px 0px rgba(13, 13, 13, 0.25);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 24px;
    width: 24px;
    border-radius: 50px;
    background: #ffffff;
    cursor: pointer;
    height: 4.5px;
  }

  input[type='range'].range:focus::-ms-fill-lower {
    background: #ededed;
  }

  input[type='range'].range:focus::-ms-fill-upper {
    background: #ddd;
  }

  input[type='range'].range {
    -webkit-appearance: none;
    width: 100%;
    margin: 9.75px 0;
    outline: none;
    border: 0;
  }

  input[type='range'].range:focus {
    outline: none;
    border: 0;
    background: #ddd;
  }

  input[type='range'].range::-webkit-slider-runnable-track {
    width: 100%;
    height: 4.5px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
    background: #ededed;
    border-radius: 0px;
    border: 0px solid #010101;
  }

  input[type='range'].range::-webkit-slider-thumb {
    box-shadow: 0px 0px 5.6px rgba(0, 0, 0, 0.25), 0px 0px 0px rgba(13, 13, 13, 0.25);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 24px;
    width: 24px;
    border-radius: 50px;
    background: #ffffff;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -9.75px;
  }

  input[type='range'].range:focus::-webkit-slider-runnable-track {
    background: #ddd;
  }

  input[type='range'].range::-moz-range-track {
    width: 100%;
    height: 4.5px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
    background: #ededed;
    border-radius: 0px;
    border: 0px solid #010101;
  }

  input[type='range'].range::-moz-range-thumb {
    box-shadow: 0px 0px 5.6px rgba(0, 0, 0, 0.25), 0px 0px 0px rgba(13, 13, 13, 0.25);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 24px;
    width: 24px;
    border-radius: 50px;
    background: #ffffff;
    cursor: pointer;
  }

  input[type='range'].range::-ms-track {
    width: 100%;
    height: 4.5px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }

  input[type='range'].range::-ms-fill-lower {
    background: #c4c4c4;
    border: 0px solid #010101;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  }

  input[type='range'].range::-ms-fill-upper {
    background: #ededed;
    border: 0px solid #010101;
    border-radius: 0px;
    box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  }

  input[type='range'].range::-ms-thumb {
    box-shadow: 0px 0px 5.6px rgba(0, 0, 0, 0.25), 0px 0px 0px rgba(13, 13, 13, 0.25);
    border: 0px solid rgba(0, 0, 0, 0);
    height: 24px;
    width: 24px;
    border-radius: 50px;
    background: #ffffff;
    cursor: pointer;
    height: 4.5px;
  }

  input[type='range'].range:focus::-ms-fill-lower {
    background: #ededed;
  }

  input[type='range'].range:focus::-ms-fill-upper {
    background: #ddd;
  }
`
export const Range = props => {
  return (
    <Container>
      <input
        type="range"
        min={props.min.toString()}
        max={props.max.toString()}
        value={props.value.toString()}
        onChange={props.onChange}
        className="range"
      />
    </Container>
  )
}
