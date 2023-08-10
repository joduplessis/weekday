import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Menu } from "../src/menu";
import { withInfo } from "@storybook/addon-info";

storiesOf('Menu', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Menu
      items={[
        { text: "Public to your team", label: 'Anyone in your team can join', onClick: (e: any) => console.log('Click') },
        { text: "Private to members", label: 'Only people you\'ve added can join', onClick: (e: any) => console.log('Click') },
      ]}
    />
  )));
