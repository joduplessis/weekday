import * as React from "react";
import { storiesOf } from "@storybook/react";
import { Tabbed } from "../src/tabbed";
import { Modal } from "../src/modal";
import { withInfo } from "@storybook/addon-info";

storiesOf('Tabbed', module)
  .add(
  'Default',
  withInfo({ inline: true })(() => (
    <Tabbed
      start={0}
      onChange={(index: any) => {
        console.log(index)
      }}
      footer={<div style={{ width: 50 }}>This is the tab footer area</div>}
      panels={[
        {
          title: 'Profile',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Profile content
            </div>
          )
        },
        {
          title: 'Accounts',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Account content
            </div>
          )
        },
        {
          title: 'Team',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Team content
            </div>
          )
        },
        {
          title: 'Other',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Other content
            </div>
          )
        },
        {
          title: 'Profile',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Profile content
            </div>
          )
        },
        {
          title: 'Accounts',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Account content
            </div>
          )
        },
        {
          title: 'Team',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Team content
            </div>
          )
        },
        {
          title: 'Other',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Other content
            </div>
          )
        }
      ]}
    />
  )))
  .add(
    'Default inside modal',
    withInfo({ inline: true })(() => (
      <Modal
        title="Channel"
        width={700}
        height="90%"
        onClose={() => console.log('Close')}
        footer={(
          <div>Footer for the mmodal</div>
        )}>  
        <Tabbed
          start={0}
          onChange={(index: any) => {
            console.log(index)
          }}
          footer={<div style={{ width: 50 }}>This is the tab footer area</div>}
          panels={[
            {
              title: 'Profile',
              show: true,
              content: (
                <div style={{ flex: 1, height: "100%", width: "100%" }}>
                  Profile content
                </div>
              )
            },
            {
              title: 'Accounts',
              show: true,
              content: (
                <div style={{ flex: 1, height: "100%", width: "100%" }}>
                  Account content
                </div>
              )
            },
            {
              title: 'Team',
              show: true,
              content: (
                <div style={{ flex: 1, height: "100%", width: "100%" }}>
                  Team content
                </div>
              )
            },
            {
              title: 'Other',
              show: true,
              content: (
                <div style={{ flex: 1, height: "100%", width: "100%" }}>
                  Other content
                </div>
              )
            },
            {
              title: 'Profile',
              show: true,
              content: (
                <div style={{ flex: 1, height: "100%", width: "100%" }}>
                  Profile content
                </div>
              )
            },
            {
              title: 'Accounts',
              show: true,
              content: (
                <div style={{ flex: 1, height: "100%", width: "100%" }}>
                  Account content
                </div>
              )
            },
            {
              title: 'Team',
              show: true,
              content: (
                <div style={{ flex: 1, height: "100%", width: "100%" }}>
                  Team content
                </div>
              )
            },
            {
              title: 'Other',
              show: true,
              content: (
                <div style={{ flex: 1, height: "100%", width: "100%" }}>
                  Other content
                </div>
              )
            }
          ]}
        />
      </Modal>
    )))
  .add(
  'Large with subtitle & no border',
  withInfo({ inline: true })(() => (
    <Tabbed
      size="large"
      borderless={true}
      start={0}
      panels={[
        {
          title: 'Profile',
          subtitle: 'Something below',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Profile content
            </div>
          )
        },
        {
          title: 'Accounts',
          show: true,
          content: (
            <div style={{ flex: 1, height: "100%", width: "100%" }}>
              Account content
            </div>
          )
        }
      ]}
    />
  )));
