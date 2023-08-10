import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Attachment } from "../src/attachment";
import { withInfo } from "@storybook/addon-info";

storiesOf('Attachment', module)
  .add(
  'Default & full width',
  withInfo({ inline: true })(() => (
    <Attachment
      fullwidth={true}
      size={1024}
      mime="image/png"
      uri="https://pbs.twimg.com/profile_images/1320075017493843969/Fei7zhNB_400x400.jpg"
      name="Uploaded image.png"
      onDeleteClick={() => console.log('Delete')}
    />
  )))
  .add(
  'With image preview',
  withInfo({ inline: true })(() => (
    <Attachment
      size={12024}
      mime="image/png"
      uri="https://pbs.twimg.com/profile_images/1320075017493843969/Fei7zhNB_400x400.jpg"
      preview="https://pbs.twimg.com/profile_images/1320075017493843969/Fei7zhNB_400x400.jpg"
      name="Uploaded image.png"
      onPreviewClick={() => console.log('Preview')}
    />
  )))
  .add(
  'With video preview',
  withInfo({ inline: true })(() => (
    <Attachment
      size={12024}
      mime="video/mp4"
      preview="https://weekday-users.s3-us-west-2.amazonaws.com/12-10-2019/8e40ffd0-ed28-11e9-b424-1d6c0b83f80c.small-1.mp4"
      uri="https://weekday-users.s3-us-west-2.amazonaws.com/12-10-2019/8e40ffd0-ed28-11e9-b424-1d6c0b83f80c.small-1.mp4"
      name="Uploaded image.png"
      onDeleteClick={() => console.log('Delete')}
    />
  )))
  .add(
  'With application preview',
  withInfo({ inline: true })(() => (
    <Attachment
      size={12024}
      mime="application/mp4"
      preview="https://weekday-users.s3-us-west-2.amazonaws.com/12-10-2019/8e40ffd0-ed28-11e9-b424-1d6c0b83f80c.small-1.mp4"
      uri="https://weekday-users.s3-us-west-2.amazonaws.com/12-10-2019/8e40ffd0-ed28-11e9-b424-1d6c0b83f80c.small-1.mp4"
      name="Uploaded image.png"
    />
  )))
  .add(
  'With text preview',
  withInfo({ inline: true })(() => (
    <Attachment
      size={12024}
      mime="text/mp4"
      preview="https://weekday-users.s3-us-west-2.amazonaws.com/12-10-2019/8e40ffd0-ed28-11e9-b424-1d6c0b83f80c.small-1.mp4"
      uri="https://weekday-users.s3-us-west-2.amazonaws.com/12-10-2019/8e40ffd0-ed28-11e9-b424-1d6c0b83f80c.small-1.mp4"
      name="Uploaded image.png"
    />
  )))
  .add(
  'With default preview',
  withInfo({ inline: true })(() => (
    <Attachment
      size={12024}
      mime="default/mp4"
      preview="https://weekday-users.s3-us-west-2.amazonaws.com/12-10-2019/8e40ffd0-ed28-11e9-b424-1d6c0b83f80c.small-1.mp4"
      uri="https://weekday-users.s3-us-west-2.amazonaws.com/12-10-2019/8e40ffd0-ed28-11e9-b424-1d6c0b83f80c.small-1.mp4"
      name="Uploaded image.png"
    />
  )));
