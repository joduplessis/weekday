import * as React from "react";
import styled from "styled-components";

const LabelText = styled.div<{ 
  bold: boolean;
}>`
  font-size: 10px;
  font-weight: ${props => props.bold ? "900" : "700"};
  color: ${props => props.bold ? "#ACB5BD" : "#CFD4D9"};
  text-transform: uppercase;
`;


interface ILabelProps {
  children: any;
  style?: any;
  bold?: boolean;
}

export const Label: React.FunctionComponent<ILabelProps> = (props: ILabelProps) => {
  const styles: any = props.style ? props.style : {};
  return (
    <LabelText style={styles} bold={!!props.bold}>
      {props.children}
    </LabelText>
  );
};
