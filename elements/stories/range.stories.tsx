import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Range } from "../src/range";
import { withInfo } from "@storybook/addon-info";

storiesOf('Range', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => React.createElement(() => {
    const [value, setValue] = React.useState(0)

    return (
      <Range
        min={10}
        max={65}
        value={value}
        onChange={(e: any) => setValue(e.target.value)}
      />
    )
  })));
