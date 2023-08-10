import * as React from "react";
import styled from "styled-components";

const CollapsableContainer = styled.div`
  width: 100%;
  max-height: 0;
  transition: max-height 0.15s ease-out;
  overflow: hidden;

  &.open {
    max-height: 500px;
    overflow: visible;
    transition: max-height 0.25s ease-in;
  }
`;

const CollapsableText = styled.div`
  color: #404C5A;
  font-weight: 500;
  font-size: 14px;
  flex: 1;
`;

const Container = styled.div`
  width: 100%;
`;

interface ICollapsableProps {
  /** Text title */
  title: string;

  /** Any React children */
  children: any;

  /** Opetional className */
  className?: string;
}

export const Collapsable: React.FunctionComponent<ICollapsableProps> = (props: ICollapsableProps) => {
  const [open, setOpen] = React.useState(false);
  const containerClasses = props.className ? props.className + " row w-100" : "row w-100";

  return (
    <Container>
      <div className={containerClasses}>
        <CollapsableText>{props.title}</CollapsableText>

        {/* Up */}
        {open &&
          <svg 
            onClick={() => setOpen(!open)}
            className="button"
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            style={{ fill: "#acb5bd", transform: ";-ms-filter:" }}>
            <path d="M12 6.879L4.939 13.939 7.061 16.061 12 11.121 16.939 16.061 19.061 13.939z"></path>
          </svg>
        }

        {/* Down */}
        {!open &&
          <svg 
            onClick={() => setOpen(!open)}
            className="button"
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            style={{ fill: "#acb5bd", transform: ";-ms-filter:" }}>
            <path d="M16.939 7.939L12 12.879 7.061 7.939 4.939 10.061 12 17.121 19.061 10.061z"></path>
          </svg>
        }
      </div>
      <CollapsableContainer className={open ? "open" : ""}>
        {props.children}
      </CollapsableContainer>
    </Container>
  );
};

Collapsable.defaultProps = {
  className: "",
};
