import * as React from "react";
import { storiesOf } from "@storybook/react";
import { User } from "../src/user";
import { withInfo } from "@storybook/addon-info";
import { Button } from "../src/button";

storiesOf('User', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <User
      active={false}
      onClick={() => console.log("Clicked")}
      image="https://usepanda.com/img/source-icons/theNextWeb.png"
      name="Jon Doe"
      label="@jondoe">
      <Button
        size="small"
        onClick={() => console.log("Clicked")}
        text="Add"
      />
    </User>
  )));
