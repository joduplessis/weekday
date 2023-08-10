import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Select } from "../src/select";
import { withInfo } from "@storybook/addon-info";

storiesOf('Select', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Select
      onSelect={(item: any) => console.log('Selected', item)}
      selected={2}
      options={[
        { option: 'One', value: 1 },
        { option: 'Two', value: 2 },
        { option: 'Three', value: 3 },
        { option: 'Four', value: 4 },
        { option: 'Five', value: 5 },
        { option: 'One', value: 1 },
        { option: 'Two', value: 2 },
        { option: 'Three', value: 3 },
        { option: 'Four', value: 4 },
        { option: 'Five', value: 5 },
      ]}
    />
  )))
  .add(
  'Large',
  withInfo({ inline: true })(() => (
    <Select
      size="large"
      onSelect={(item: any) => console.log('Selected', item)}
      selected={2}
      options={[
        { option: 'One', value: 1 },
        { option: 'Two', value: 2 },
        { option: 'Three', value: 3 },
        { option: 'Four', value: 4 },
        { option: 'Five', value: 5 },
        { option: 'One', value: 1 },
        { option: 'Two', value: 2 },
        { option: 'Three', value: 3 },
        { option: 'Four', value: 4 },
        { option: 'Five', value: 5 },
      ]}
    />
  )))
  .add(
  'With label',
  withInfo({ inline: true })(() => (
    <Select
      label="Select"
      size="large"
      onSelect={(item: any) => console.log('Selected', item)}
      selected={2}
      options={[
        { option: 'One', value: 1 },
        { option: 'Two', value: 2 },
        { option: 'Three', value: 3 },
        { option: 'Four', value: 4 },
        { option: 'Five', value: 5 },
        { option: 'One', value: 1 },
        { option: 'Two', value: 2 },
        { option: 'Three', value: 3 },
        { option: 'Four', value: 4 },
        { option: 'Five', value: 5 },
      ]}
    />
  )));
