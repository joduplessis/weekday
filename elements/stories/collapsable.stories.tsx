import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Collapsable } from "../src/collapsable";
import { withInfo } from "@storybook/addon-info";

storiesOf('Collapsable', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <div style={{ width: 300, padding: 50 }}>
      <Collapsable title="Full name">
        <div>
          <p>This is the inner content</p>
        </div>
      </Collapsable>
    </div>
  )));
