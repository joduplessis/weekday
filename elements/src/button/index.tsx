import * as React from "react";
import styled from "styled-components";
import { THEMES } from "./themes";

const Container = styled.button<{
  size?: string,
  theme: string,
  disabled?: boolean,
}>`
  box-sizing: border-box;
  width: ${props => {
    switch (props.size) {
      case "full-width":
        return "100%";
      default:
        return "auto";
    }
  }}
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  background-size: cover;
  position: relative;
  transition: background-color 0.15s, color 0.15s, border 0.15s;
  cursor: pointer;
  box-sizing: border-box;
  max-width: ${props => {
    switch (props.size) {
      case "full-width":
        return "100%";
      case "large":
        return "300px";
      case "x-small":
        return "fit-content";
      case "small":
        return "fit-content";
      default:
        return "150px";
    }
  }};
  height: ${props  => {
    switch (props.size) {
      case "full-width":
        return "auto";
      case "large":
        return "80px";
      case "x-small":
        return "20px";
      case "small":
        return "30px";
      default:
        return "40px";
    }
  }};
  border-radius: ${props => {
    switch (props.size) {
      case "large":
        return "14px";
      case "small":
        return "10px";
      default:
        return "12px";
    }
  }};
  border-width: ${props => {
    switch (props.size) {
      case "large":
        return "2px";
      case "small":
        return "1px";
      default:
        return "2px";
    }
  }};
  border-style: solid;
  background-color: ${props => THEMES[props.theme].BASE.BACKGROUND_COLOR};
  color: ${props => THEMES[props.theme].BASE.COLOR};
  border-color: ${props => THEMES[props.theme].BASE.BORDER_COLOR};

  @media only screen and (max-width: 768px) {
    border-width: 2px;
    border-radius: 5px;
    height: 40px;
    max-width: 150px;
  }

  &:hover {
    background-color: ${props => THEMES[props.theme].HOVER.BACKGROUND_COLOR};
    color: ${props => THEMES[props.theme].HOVER.COLOR};
    border-color: ${props => THEMES[props.theme].HOVER.BORDER_COLOR};
  }

  &.active {
    background-color: ${props => THEMES[props.theme].ACTIVE.BACKGROUND_COLOR} !important;
    color: ${props => THEMES[props.theme].ACTIVE.COLOR} !important;
    border-color: ${props => THEMES[props.theme].ACTIVE.BORDER_COLOR} !important;
  }

  &:disabled {
    opacity: 0.5 !important;
  }
`;

const Text = styled.span<{
  icon?: any,
  theme: string,
  size?: string,
}>`
  margin: 0px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  box-sizing: border-box;
  padding: ${props => {
    if (props.icon) {
      switch (props.size) {
        case "large":
          return "0px 30px 0px 15px";
        case "small":
          return "0px 10px 0px 5px";
        case "x-small":
          return "0px 7px 0px 2px";
        default:
          return "0px 15px 0px 8px";
      }
    } else {
      switch (props.size) {
        case "large":
          return "0px 30px 0px 30px";
        case "small":
          return "0px 10px 0px 10px";
        case "x-small":
          return "0px 5px 0px 5px";
        default:
          return "0px 15px 0px 15px";
      }
    }
  }};
  font-weight: ${props => {
    switch (props.size) {
      case "large":
        return "700";
      case "small":
        return "700";
      case "x-small":
        return "800";
      default:
        return "700";
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case "large":
        return "23px";
      case "small":
        return "10px";
      case "x-small":
        return "8px";
      default:
        return "13px";
    }
  }};

  @media only screen and (max-width: 768px) {
    padding: ${props => props.icon ? "0px 15px 0px 8px" : "0px 15px 0px 15px"}
    font-weight: 500;
    font-size: 13px;
  }
`;

const Icon = styled.div<{
  size?: string,
  text?: string,
}>`
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  margin: ${props => {
    if (!props.text) return "0px 10px 0px 10px";
    if (!props.text && props.size) return "0px 20px 0px 20px";
    if (props.size) {
      switch (props.size) {
        case "large":
          return "0px 0px 0px 30px";
        case "small":
          return "0px 0px 0px 10px";
        default:
          return "0px 0px 0px 15px";
      }
    }

    return "0px 0px 0px 15px";
  }};

  @media only screen and (max-width: 768px) {
    margin: 0px 0px 0px 15px;
  }
`;

interface IButtonProps {
  /**
   * Icon to display next to text,
   *
   * @default null
   */
  icon?: any;

  /**
   * Value to display, either empty (" ") or string value
   *
   * @default " "
   */
  text?: string;

  /**
   * Colour theme for button
   *
   * @default " " (blue)
   */
  theme?: string;

  /**
   * Button disabled value
   *
   * @default null
   */
  disabled?: boolean;

  /**
   * Possible values are "small" | "medium" | "large"
   *
   * @default false
   */
  size?: string;

  /**
   * React classname property
   *
   * @default null
   */
  className?: string;

  /** Called when an empty cell is clicked. */
  onClick?: any;
}

/**
 * Button component.
 */
export const Button: React.FunctionComponent<IButtonProps> = (props: IButtonProps) => {
  const [down, setDown] = React.useState(false);
  const theme: string = props.theme ? props.theme : "default";
  const className = down ? "active " + props.className : props.className;

  return (
    <Container
      size={props.size}
      theme={theme}
      className={className}
      onClick={props.onClick}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      {...props}>
      {props.icon && (
        <Icon
          text={props.text}
          size={props.size}>
          {props.icon}
        </Icon>
      )}
      {props.text && (
        <Text
          icon={props.icon}
          theme={theme}
          size={props.size}>
          {props.text}
        </Text>
      )}
    </Container>
  );
};
