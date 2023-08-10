import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Members } from "../src/members";
import { withInfo } from "@storybook/addon-info";

storiesOf('Members', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Members
      members={[
        { user: { id: '5', name: 'Jon Doe', username: 'jondoe', image: 'https://usepanda.com/img/source-icons/theNextWeb.png' }}
      ]}
      handleAccept={(member: any) => console.log(`@${member.user.username} `)}
    />
  )));
