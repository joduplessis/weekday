import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Spinner } from "../src/spinner";
import { withInfo } from "@storybook/addon-info";

storiesOf('Spinner', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Spinner />
  )));
