import * as React from "react";
import styled from "styled-components";
import { Avatar } from "../avatar";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  align-content: flex-start;
  justify-content: flex-start;
  position: relative;
`;

const ContainerPadding = styled.div`
  flex: 1;
  padding: 10px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;
`;

const Divider = styled.div`
  background: #f1f3f5;
  width: 100%;
  height: 2px;
`;

const RowContainer = styled.div`
  background: transparent;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  align-content: center;
  justify-content: flex-start;
  position: relative;
`;

const Row = styled.div<{
  nohover: boolean;
}>`
  background: transparent;
  padding: 7px 5px 7px 5px;
  flex: 1;
  border-radius: 4px;
  cursor: ${props => (props.nohover ? null : "pointer")};
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
  position: relative;

  &:hover {
    background: ${props => (props.nohover ? null : "#f8f9fa")};
  }
`;

const IconContainer = styled.div`
  margin-right: 10px;
  margin-left: 5px;
  width: 20px;
`;

const AvatarContainer = styled.div`
  margin-right: 7px;
  margin-left: 3px;
`;

const Text = styled.div`
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
  color: #404C5A;
  font-weight: 700;
  font-size: 12px;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;
  position: relative;
`;

const Label = styled.div`
  overflow: hidden;
  font-size: 11px;
  font-weight: 500;
  color: #ACB5BD;
  width: 100%;
  white-space: nowrap;
`;

interface IMenuProps {
  /** { text: "Public to your team", label: 'Anyone in your team can join', onClick: (e: any) => console.log('Click') } */
  items: any[];
}

export const Menu: React.FunctionComponent<IMenuProps> = (props: IMenuProps) => {
  return (
    <Container>
      <ContainerPadding>
        {props.items.map((item, index) => {
          if (item.hide) return null;

          return (
            <RowContainer key={index}>
              <Row
                nohover={item.divider}
                onClick={(e: any) => {
                  e.stopPropagation();
                  item.onClick();
                }}>

                {item.divider && <Divider />}

                {!item.divider &&
                  <React.Fragment>
                    {item.image &&
                      <AvatarContainer>
                        <Avatar
                          image={item.image}
                          title={item.text}
                          size="small-medium"
                        />
                      </AvatarContainer>
                    }
                    {item.icon &&
                      <IconContainer>
                        {item.icon}
                      </IconContainer>
                    }
                    <TextContainer>
                      <Text>{item.text}</Text>
                      {item.label && <Label>{item.label}</Label>}
                    </TextContainer>
                  </React.Fragment>
                }
              </Row>
            </RowContainer>
          );
        })}
      </ContainerPadding>
    </Container>
  );
};
