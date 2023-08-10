import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Tooltip } from "../src/tooltip";
import { Button } from "../src/button";
import { withInfo } from "@storybook/addon-info";

storiesOf('Tooltip', module)
  .add(
  'With direction & text',
  withInfo({ inline: true })(() => (
    <Tooltip
      direction="right"
      text="This is a tooltip">
      <Button text="Hover here" />
    </Tooltip>
  )))
  .add(
  'With longer text',
  withInfo({ inline: true })(() => (
    <Tooltip
      direction="right"
      text="This is a tooltip with longer text">
      <Button text="Hover here" />
    </Tooltip>
  )));
