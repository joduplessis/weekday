import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Progress } from "../src/progress";
import { withInfo } from "@storybook/addon-info";

storiesOf('Progress', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Progress
      text="This is some text"
      percentage={65}
      labels={true}
    />
  )))
  .add(
  'Without labels & with custom background',
  withInfo({ inline: true })(() => (
    <Progress
      text="This is some text"
      percentage={5}
      labels={false}
      color="#d1d6e0"
    />
  )));
