import * as React from "react";
import { User } from "../user";

interface IMembersProps {
  /** When a user presses enter or clicks */
  handleAccept: any;

  /** { user: { id: '5', name: 'Jon Doe', username: 'jondoe', image: 'https://usepanda.com/img/source-icons/theNextWeb.png' }} */
  members: any[];
}

interface IMembersState {
  index: number;
  members: any[];
}

export class Members extends React.Component<IMembersProps, IMembersState> {
  public static getDerivedStateFromProps(props: IMembersProps, state: IMembersState) {
    return {
      members: props.members.filter((member, index) => (index <= 5 ? true : false)),
    };
  }

  constructor(props: IMembersProps) {
    super(props);

    this.state = { index: 0, members: [] };
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  public handleKeyPress(e: any) {
    // Move up
    if (e.keyCode == 38) this.setState({ index: this.state.index - 1 < 0 ? this.state.members.length - 1 : this.state.index - 1 });

    // Move down
    if (e.keyCode == 40) this.setState({ index: this.state.index + 1 == this.state.members.length ? 0 : this.state.index + 1 });

    // Press enter
    if (e.keyCode == 13) {
      if (this.state.members.length > 0) this.props.handleAccept(this.state.members[this.state.index]);
    }
  }

  public componentDidMount() {
    document.addEventListener("keyup", this.handleKeyPress);
  }

  public componentWillUnmount() {
    document.removeEventListener("keyup", this.handleKeyPress);
  }

  // prettier-ignore
  public render() {
    return (
      <React.Fragment>
        {this.state.members.map((member, index) => {
          return (
            <User
              key={index}
              active={index == this.state.index}
              image={member.user.image}
              name={member.user.name}
              label={"@" + member.user.username}
              onClick={() => this.props.handleAccept(member)}
            />
          );
        })}
      </React.Fragment>
    );
  }
}
