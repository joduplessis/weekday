import * as React from "react";
import styled from "styled-components";
import { THEMES } from "./themes";

const Container = styled.div<{
  theme: string;
}>`
  background-color: ${props => THEMES[props.theme].BACKGROUND_COLOR};
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
  position: relative;
  height: 30px;
`;

const Padding = styled.div`
  flex: 1;
  padding: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  position: relative;
  text-align: center;
`;

const ActionText = styled.span<{
  theme: string;
}>`
  color: ${props => THEMES[props.theme].COLOR};
  font-size: ${props => THEMES[props.theme].FONT_SIZE}px;
  font-weight: 800;
  margin-left: 10px;
  cursor: pointer;
  text-decoration: underline;
`;

const Icon = styled.span<{
  theme: string;
}>`
  margin-left: auto;
  height: 22px;
  width: 22px;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.25s;

  &:hover {
    opacity: 0.5;
  }
`;

const Text = styled.span<{
  theme: string;
}>`
  color: ${props => THEMES[props.theme].COLOR};
  font-size: ${props => THEMES[props.theme].FONT_SIZE}px;
  font-weight: 400;
`;

interface INotificationProps {
  text: string;

  /** Text next to main text */
  actionText?: string;

  /** When user click on text next to main text */
  onActionClick?: any;
  onDismissIconClick?: any;
  onDismiss?: any;
  theme?: string;
}

export const Notification: React.FunctionComponent<INotificationProps> = (props: INotificationProps) => {
  if (!props.text) return null;

  const [notificationMessage, setNotificationMessage] = React.useState("");
  const theme: string = props.theme ? props.theme : "default";

  React.useEffect(() => {
    if (props.text != notificationMessage) {
      // update our error message
      setNotificationMessage(props.text);
    }
  }, [props.text]);

  return (
    <Container theme={theme}>
      <Padding>
        <Text theme={theme} onClick={() => props.onDismiss ? props.onDismiss() : null}>
          {notificationMessage}
        </Text>
        {props.actionText &&
          <ActionText theme={theme} onClick={props.onActionClick}>
            {props.actionText}
          </ActionText>
        }
      </Padding>
      {props.onDismissIconClick &&
        <Icon theme={theme} onClick={props.onDismissIconClick}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={THEMES[theme].ICON_SIZE}
            height={THEMES[theme].ICON_SIZE}
            viewBox="0 0 24 24" 
            style={{ fill: THEMES[theme].COLOR, transform: ";-ms-filter:" }}>
            <path d="M16.192 6.344L11.949 10.586 7.707 6.344 6.293 7.758 10.535 12 6.293 16.242 7.707 17.656 11.949 13.414 16.192 17.656 17.606 16.242 13.364 12 17.606 7.758z"></path>
          </svg>
        </Icon>
      }
    </Container>
  );
};
