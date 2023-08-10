import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Textarea } from "../src/textarea";
import { withInfo } from "@storybook/addon-info";

storiesOf('Textarea', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <div className="p-20">
      <Textarea
        label="Description"
        value="Some text value"
        onChange={(e: any) => console.log(e.target.value)}
        placeholder="Add a description"
        rows={8}
      />
    </div>
  )))
  .add(
  'Large',
  withInfo({ inline: true })(() => (
    <div className="p-20">
      <Textarea
        label="Description"
        textareaSize="large"
        value=""
        onChange={(e: any) => console.log(e.target.value)}
        placeholder="Add a description"
        rows={4}
      />
    </div>
  )));
