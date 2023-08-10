import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Modal } from "../src/modal";
import { withInfo } from "@storybook/addon-info";

storiesOf('Modal', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Modal
      title="Channel"
      width={700}
      height="90%"
      onClose={() => console.log('Close')}
      footer={(
        <div>Footer</div>
      )}
    />
  )))
  .add(
  'Positioned right',
  withInfo({ inline: true })(() => (
    <Modal
      position="right"
      frameless
      title="Channel"
      width={700}
      header={false}
      height="100%"
      onClose={() => console.log('Close')}
    />
  )))
  .add(
  'Toolbar',
  withInfo({ inline: true })(() => (
    <Modal
      title="Channel"
      width={700}
      toolbar={<span>Cool!</span>}
      height="90%"
      onClose={() => console.log('Close')}
    />
  )))
  .add(
  'No header',
  withInfo({ inline: true })(() => (
    <Modal
      title="Channel"
      width={700}
      header={false}
      height="90%"
      onClose={() => console.log('Close')}
    />
  )))
  .add(
  'Frameless',
  withInfo({ inline: true })(() => (
    <Modal
      title="Channel"
      width={700}
      frameless={true}
      height="90%"
      onClose={() => console.log('Close')}
    />
  )));
