import * as React from "react";
import styled from "styled-components";

const Container = styled.div<{
  className: string;
  width: number | string;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  width: ${props => typeof props.width == "number" ? "max-content" : props.width};
  height: max-content;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.1);
  display: none;
  z-index: 4;

  @media only screen and (max-width: 768px) {
    display: block;
  }
`;

const Content = styled.div<{ width: number | string }>`
  display: flex;
  position: absolute;
  z-index: 1000;
  background: white;
  border-radius: 4px;
  /* overflow: hidden; */
  border: 1px solid #F1F3F5;
  box-shadow: 0px 0px 50px 0px rgba(0,0,0,0.05);
  width: ${props => typeof props.width == "number" ? props.width + "px" : props.width};
  height: max-content;

  &.left-top { top: 0px; left: 0px; transform: translateY(-100%);  }
  &.right-top { top: 0px; right: 0px; transform: translateY(-100%); }
  &.left-bottom { bottom: 0px; left: 0px; transform: translateY(100%); }
  &.right-bottom { bottom: 0px; right : 0px; transform: translateY(100%); }

  @media only screen and (max-width: 768px) {
    transform: none !important;
    top: auto !important;
    bottom: 0px !important;
    left: 0px !important;
    right: 0px !important;
    width: 100vw !important; /* 100% seems to be relative to parent (bug?) */
    height: fit-content;
    max-height: 50%;
    position: fixed !important;
    overflow: scroll;
    border-radius: 0px;
    margin: 0px;
  }
`;

const ContentActiveArea = styled.div<{ width: number | string }>`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  align-content: center;
  justify-content: center;
  width: ${props => typeof props.width == "number" ? props.width + "px" : props.width};

  @media only screen and (max-width: 768px) {
    display: block;
    height: fit-content;
    width: 100% !important;
    flex-direction: none;
    align-items: none;
    align-content: none;
    justify-content: none;
    flex: none;
  }
`;

const ContentActiveAreaInner = styled.div<{ 
  width: number | string, 
  maxHeight?: number | string,
}>`
  flex: 1;
  position: relative;
  width: ${props => (typeof props.width == "number" ? props.width + "px" : props.width)};
  overflow: scroll;
  max-height: ${props => !!props.maxHeight ? (typeof props.maxHeight == "number" ? props.maxHeight + "px" : props.maxHeight) : "none"};

  @media only screen and (max-width: 768px) {
    display: block;
    height: fit-content;
    width: 100% !important;
    flex-direction: none;
    align-items: none;
    align-content: none;
    justify-content: none;
    flex: none;
  }
`;

interface IPopupProps {
  visible: boolean;
  handleDismiss: any;
  containerClassName?: string;
  children: any;
  /**
   * Possible values:
   * - "left-top"
   * - "right-top"
   * - "left-bottom"
   * - "right-bottom"
   */
  direction: string;
  width: number | string;
  maxHeight?: number | string;
  content: any;
}

interface IPopupState {
  visible: boolean;
}

export class Popup extends React.Component<IPopupProps, IPopupState> {
  public static getDerivedStateFromProps(props: IPopupProps, state: IPopupState) {
    return { visible: props.visible };
  }

  public wrapperRef: any;
  public rootRef: any;

  constructor(props: IPopupProps) {
    super(props);

    this.state = {
      visible: props.visible,
    };

    this.wrapperRef = React.createRef();
    this.rootRef = React.createRef();

    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.hidePopup = this.hidePopup.bind(this);
  }

  public hidePopup() {
    this.props.handleDismiss();
  }

  public handleClickOutside(event: any) {
    if (!this.wrapperRef) return;
    if (!this.wrapperRef.contains) return;
    if (this.wrapperRef.contains(event.target)) return;
    if (!this.wrapperRef.contains(event.target)) this.hidePopup();
  }

  public handleKeyPress(e: any) {
    // Escape
    if (e.keyCode == 27) this.hidePopup();

    // Enter
    if (e.keyCode == 13) this.hidePopup();
  }

  public componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
    document.addEventListener("keyup", this.handleKeyPress);
  }

  public componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
    document.removeEventListener("keyup", this.handleKeyPress);
  }

  public render() {
    return (
      <React.Fragment>
        {this.props.visible && <Overlay />}
        
        <Container
          width={this.props.width}
          className={this.props.containerClassName ? this.props.containerClassName : ""}
          ref={(ref) => this.rootRef = ref}>
          {this.props.children}

          {this.props.visible &&
            <Content
              ref={(ref) => this.wrapperRef = ref}
              width={this.props.width}
              className={this.props.direction}>
              <ContentActiveArea width={this.props.width}>
                <ContentActiveAreaInner width={this.props.width} maxHeight={this.props.maxHeight}>
                  {this.props.content}
                </ContentActiveAreaInner>
              </ContentActiveArea>
            </Content>
          }
        </Container>
      </React.Fragment>
    );
  }
}
