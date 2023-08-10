import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Loading } from "../src/loading";
import { withInfo } from "@storybook/addon-info";

storiesOf('Loading', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Loading show={true} />
  )));
