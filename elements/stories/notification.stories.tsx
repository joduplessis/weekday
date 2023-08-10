import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Notification } from "../src/notification";
import { withInfo } from "@storybook/addon-info";

storiesOf('Notification', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Notification
      text="Notification text"
      actionText="Action text"
      onActionClick={() => {
        console.log('Action click')
      }}
      onDismissIconClick={() => {
        console.log('Icon click')
      }}
      onDismiss={() => {
        console.log('Dismissed')
      }}
    />
  )))
  .add(
  'Solid theme',
  withInfo({ inline: true })(() => (
    <Notification
      theme="solid"
      text="Notification text"
      actionText="Action text"
      onActionClick={() => {
        console.log('Action click')
      }}
      onDismissIconClick={() => {
        console.log('Icon click')
      }}
      onDismiss={() => {
        console.log('Dismissed')
      }}
    />
  )));
