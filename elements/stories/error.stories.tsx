import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Error } from "../src/error";
import { withInfo } from "@storybook/addon-info";

storiesOf('Error', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Error
      message="Something has gone wrong"
      onDismiss={() => {
        console.log('Dismiss the error message')
      }}
    />
  )))
  .add(
  'Solid theme',
  withInfo({ inline: true })(() => (
    <Error
      message="Something has gone wrong"
      theme="solid"
      onDismiss={() => {
        console.log('Dismiss the error message')
      }}
    />
  )));
