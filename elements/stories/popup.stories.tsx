import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Popup } from "../src/popup";
import { Button } from "../src/button";
import { withInfo } from "@storybook/addon-info";

storiesOf('Popup', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Popup
      visible={true}
      handleDismiss={() => console.log('Dismiss')}
      width={300}
      direction="left-top"
      content={
        <div style={{ padding: 50, fontFamily: 'system', }}>
          Content for the popup
        </div>
      }>
        <Button text="Popup" />
    </Popup>
  )))
  .add(
    'Very tall content',
    withInfo({ inline: true })(() => (
      <Popup
        visible={true}
        handleDismiss={() => console.log('Dismiss')}
        width={300}
        direction="left-bottom"
        content={
          <React.Fragment>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 1</div>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 2</div>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 3</div>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 4</div>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 5</div>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 6</div>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 7</div>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 8</div>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 9</div>
            <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 10</div>
          </React.Fragment>
        }>
          <Button text="Popup" />
      </Popup>
    )))
    .add(
      'Very tall content & max height',
      withInfo({ inline: true })(() => (
        <Popup
          visible={true}
          handleDismiss={() => console.log('Dismiss')}
          width={300}
          maxHeight={150}
          direction="left-bottom"
          content={
            <React.Fragment>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 1</div>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 2</div>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 3</div>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 4</div>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 5</div>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 6</div>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 7</div>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 8</div>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 9</div>
              <div style={{ padding: 10, borderBottom: '1px solid #EFEFEF' }}>Content for the popup 10</div>
            </React.Fragment>
          }>
            <Button text="Popup" />
        </Popup>
      )));
