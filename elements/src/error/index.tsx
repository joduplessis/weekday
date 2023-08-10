import * as React from "react";
import styled from "styled-components";
import { THEMES } from "./themes";

const Container = styled.div<{
  theme: string;
}>`
  position: relative;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 30px;
  background: ${props => THEMES[props.theme].BACKGROUND_COLOR};
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 30px;
  visibility: visible;
  opacity: 1;
  transition: visibility 0s, opacity 0.1s linear;
  z-index: 10000;
`;

const Text = styled.div<{
  theme: string;
}>`
  color: ${props => THEMES[props.theme].COLOR};
  font-size: ${props => THEMES[props.theme].FONT_SIZE}px;
  font-weight: 400;
`;

interface IErrorProps {
  message: string;
  onDismiss?: any;
  theme?: string;
}

export const Error: React.FunctionComponent<IErrorProps> = (props: IErrorProps) => {
  if (!props.message) return null;

  const theme: string = props.theme ? props.theme : "default";
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    if (props.message != errorMessage) {
      // update our error message
      setErrorMessage(props.message);
    }
  }, [props.message]);

  return (
    <Container
      theme={theme}
      onClick={() => props.onDismiss ? props.onDismiss() : null}>
      <Text theme={theme}>{errorMessage}</Text>
    </Container>
  );
};
