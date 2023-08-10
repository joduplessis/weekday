import * as React from "react";
import styled from "styled-components";

const Loading = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
`;

const Graphic = styled.div<{ className: string }>`
  display: inline-block;
  position: relative;
  width: 20px;
  height: 20px;

  &.inner div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 15px;
    height: 15px;
    margin: 2px;
    border: 2px solid #3d9ee1;
    border-radius: 50%;
    animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #3d9fe1 transparent transparent transparent;
  }

  &.inner div:nth-child(1) {
    animation-delay: -0.45s;
  }

  &.inner div:nth-child(2) {
    animation-delay: -0.3s;
  }

  &.inner div:nth-child(3) {
    animation-delay: -0.15s;
  }

  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const Spinner: React.FunctionComponent<any> = (props: any) => {
  return <Loading><Graphic className="inner"><div></div><div></div><div></div><div></div></Graphic></Loading>;
};
