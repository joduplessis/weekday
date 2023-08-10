import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Avatar } from "../src/avatar";
import { withInfo } from "@storybook/addon-info";
import { action } from "@storybook/addon-actions";

storiesOf('Avatar', module)
  .add(
    'Dark themed',
    withInfo({ inline: true })(() => (
      <Avatar
        title="Jon Doe"
        dark={true}
      />
    ))
  )
  .add(
    'Outline inner/outer color',
    withInfo({ inline: true })(() => (
      <Avatar
        title="Jon Doe"
        outlineInnerColor="red"
        outlineOuterColor="white"
      />
    ))
  )
  .add(
    'With muted graphic',
    withInfo({ inline: true })(() => (
      <Avatar
        title="Jon Doe"
        size="medium-large"
        muted={true}
        image="https://randomuser.me/api/portraits/men/62.jpg"
      />
    ))
  )
  .add(
    'Coloring (auto)',
    withInfo({ inline: true })(() => (
      <Avatar
        title="Jon Doe"
        color="#FC1449"
      />
    ))
  )
  .add(
    'With a presence - online',
    withInfo({ inline: true })(() => {
      window["PRESENCES"] = {}
      window["PRESENCES"]["userId"] = { p: 'online' }
      return (
        <Avatar
          title="Jon Doe"
          userId="userId"
        />
      )
    })
  )
  .add(
    'With a presence - online (manual)',
    withInfo({ inline: true })(() => {
      window["PRESENCES"] = {}
      window["PRESENCES"]["userId"] = { p: 'online' }
      return (
        <Avatar
          title="Jon Doe"
          presence="online"
        />
      )
    })
  )
  .add(
    'Large sizing',
    withInfo({ inline: true })(() => (
      <Avatar
        title="Jon Doe"
        size="large"
      />
    ))
  )
  .add(
    'No image & a click (default)',
    withInfo({ inline: true })(() => (
      <Avatar
        onClick={action('Clicked')}
        title="Jon Doe"
      />
    ))
  )
  .add(
    'With image',
    withInfo({ inline: true })(() => (
      <Avatar
        title="Jon Doe"
        outlineInnerColor="black"
        outlineOuterColor="white"
        size="large"
        image="https://randomuser.me/api/portraits/men/62.jpg"
      />
    ))
  )
  .add(
    'With children',
    withInfo({ inline: true })(() => (
      <Avatar
        title="Jon Doe"
        size="large">
        <div style={{ color: 'red', fontSize: 20 }}>✓</div>
      </Avatar>
    ))
  );
