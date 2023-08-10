import * as React from "react";
import styled from "styled-components";

const PanelContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;

  @media only screen and (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    z-index: 10;
    background: white;
  }
`;

const PanelTitles = styled.div<{
  size: string;
}>`
  border-right: 1px solid #eaeaea;
  box-sizing: border-box;
  width: ${props => props.size == "large" ? "250px" : "200px"};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-content: center;
  justify-content: flex-start;
  position: relative;
  height: 100%;
  min-height: 200px;

  @media only screen and (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    align-content: center;
    justify-content: flex-start;
    flex-wrap: no-wrap;
    height: 50px;
    min-height: 50px;
    width: 100% !important;
    overflow: scroll;
    border-bottom: 1px solid #eaeaea;
  }
`;

const PanelTabButton = styled.div<
{
  size: string;
  borderless: boolean;
  active: boolean;
}>`
  padding: ${props => {
    switch (props.size) {
      case "large":
        if (props.borderless) {
          return "15px 25px 15px 25px";
        } else {
          return "15px 25px 15px 25px";
        }
      default:
        if (props.borderless) {
          return "10px 20px 0px 20px";
        } else {
          return "10px 20px 10px 20px";
        }
    }
  }};
  border-bottom: ${props => props.borderless ? "none" : "1px solid #eaeaea" };
  width: 100%;
  cursor: pointer;
  background: ${props => props.active ? "#F8F9FA" : "none" };

  @media only screen and (max-width: 768px) {
    height: 50px;
    width: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
    justify-content: center;
    padding: 0px;
    border-bottom: none;
  }
`;

const PanelTabButtonFooter = styled.div`
  width: 100%;

  @media only screen and (max-width: 768px) {
    display: none;
  }
`;

const PanelsContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  overflow: hidden;
`;

const Panels = styled.div<{
  current: number;
}>`
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
`;

const Panel = styled.div<{
  index: number;
}>`
  position: absolute;
  background: transparent;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  overflow: scroll;
  display: flex;
`;

const Text = styled.div<{
  active: boolean;
  size: string;
}>`
  font-size: ${props => {
    switch (props.size) {
      case "large":
        return "20px";
      default:
        return "13px";
    }
  }};
  color: ${props => props.active ? "#21262A" : "#acb5bd"};
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.25s;
  font-weight: 600;

  &:hover {
    opacity: 0.8;
  }

  @media only screen and (max-width: 768px) {
    font-weight: 600;
    padding-left: 10px;
    padding-right: 10px;
    margin: 0;
  }
`;

const Subtext = styled.div<{
  active: boolean;
  size: string;
}>`
  font-size: ${props => {
    switch (props.size) {
      case "large":
        return "13px";
      default:
        return "10px";
    }
  }};
  font-weight: 400;
  color: ${props => props.active ? "#AEB5BC" : "#AEB5BC"};
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.25s;
  margin-top: 3px;

  &:hover {
    opacity: 0.8;
  }

  @media only screen and (max-width: 768px) {
    display: none;
  }
`;

interface ITabbedProps {
  start: number;
  size?: string;
  borderless?: boolean;
  footer?: any;
  panels: any;
  onChange?: any;
}

export const Tabbed: React.FunctionComponent<ITabbedProps> = (props: ITabbedProps) => {
  const [current, setCurrent] = React.useState(props.start);

  return (
    <PanelContainer>
      <PanelTitles size={props.size || "default"}>
        {props.panels.map((panel: any, index: number) => {
          if (!panel.show) return null;

          return (
            <PanelTabButton
              borderless={props.borderless || false}
              active={current == index}
              size={props.size || "default"}
              key={index}
              className={current == index ? "active" : ""}
              onClick={() => {
                // Update the current index
                setCurrent(index);

                // Tell the user it's changed
                if (props.onChange) props.onChange(index);
              }}>
              <Text active={current == index} size={props.size || "default"}>
                {panel.title}
              </Text>
              {panel.subtitle &&
                <Subtext active={current == index} size={props.size || "default"}>
                  {panel.subtitle}
                </Subtext>
              }
            </PanelTabButton>
          );
        })}

        {props.footer &&
          <PanelTabButtonFooter>
            {props.footer}
          </PanelTabButtonFooter>
        }
      </PanelTitles>

      <PanelsContainer>
        <Panels current={current}>
          {props.panels.map((panel: any, index: number) => {
            if (!panel.show) return null;
            if (current != index) return null;

            return (
              <Panel key={index} index={index}>
                {panel.content}
              </Panel>
            );
          })}
        </Panels>
      </PanelsContainer>
    </PanelContainer>
  );
};
