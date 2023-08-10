import * as React from "react";
import styled from "styled-components";
import { Label } from "../label";

const Field = styled.textarea<{
  label: string;
  textareaSize?: string;
}>`
  border: none;
  flex: 1;
  outline: none;
  background: white;
  color: #343a40;
  font-size: ${props => {
    switch (props.textareaSize) {
      case "large":
        return "24px";
      default:
        return "13px";
    }
  }};
  font-weight: 400;
  padding: 10px;
  width: 100%;
  border: 3px solid #F0F3F5;
  border-radius: 7px;
  resize: none;
  display: block;
  box-sizing: border-box;
  margin-bottom: 20px;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.02);
  transition: border .2s;

  @media only screen and (max-width: 768px) {
    font-size: 16px;
    border: 2px solid #F0F3F5;
    box-shadow: none;
  }

  &:focus {
    outline: none;
    /*box-shadow: inset 0px 0px 0px 3px #F0F3F5;*/
    border: 3px solid #DEE2E5;
  }

  &::placeholder {
    color: #acb5bd;
  }
`;

interface ITextareaProps {
  label: string;
  value: string;
  onChange: any;
  placeholder: string;
  rows: number;
  textareaSize?: string;
  className?: string;
}

export const Textarea: React.FunctionComponent<ITextareaProps> = (props: ITextareaProps) => {
  return (
    <div className="flexer w-100">
      {props.label && (<Label style={{ marginBottom: 5 }} bold={true}>{props.label}</Label>)}
      <Field {...props} />
    </div>
  );
};

Textarea.defaultProps = {
  textareaSize: "default",
  className: "",
};
