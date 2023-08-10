import React from "react";
import { ChevronDown, ChevronRight } from "react-feather";

function Row(props) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <a name="faq"></a>
      <style jsx>{`
        .row {
          width: 50%;
          margin-right: auto;
          margin-left: auto;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-content: center;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .row .icon {
          cursor: pointer;
          opacity: 1;
          transition: opacity 0.5s;
          position: relative;
          top: 1px;
        }

        .row .icon:hover {
          opacity: 0.75;
        }

        .row .content {
          width: 90%;
          margin-left: 10px;
        }

        .row .content h3 {
          font-size: 22px;
          color: #6e7e97;
          font-weight: 400;

          opacity: 1;
          transition: opacity 0.5s;
          cursor: pointer;
        }

        .row .content h3:hover {
          opacity: 0.75;
        }

        .row .content p {
          font-size: 16px;
          display: ${open ? "block" : "none"};
          color: #485156;
          line-height: 24px;
          padding-bottom: 10px;
          padding-top: 5px;
          width: 100%;
          font-weight: 400;
        }
      `}</style>
      <div className="row">
        <div className="icon" onClick={() => setOpen(!open)}>
          {open ? (
            <ChevronDown color="#6E7E97" size={24} />
          ) : (
            <ChevronRight color="#6E7E97" size={24} />
          )}
        </div>
        <div className="content">
          <h3 onClick={() => setOpen(!open)}>{props.title}</h3>
          <p dangerouslySetInnerHTML={{ __html: props.text }}></p>
        </div>
      </div>
    </React.Fragment>
  );
}

export default function Faq(props) {
  return (
    <React.Fragment>
      <style jsx>{`
        .faq {
          background-color: #212835;
          background-color: #f7f8f9;
          padding: 50px;
          padding-top: 0px;
          padding-bottom: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-content: center;
          align-items: center;
        }

        .faq h1 {
          font-size: 48px;
          width: 40%;
          margin-right: auto;
          margin-left: auto;
          margin-top: 50px;
          margin-bottom: 50px;
          text-align: center;
          color: #21232c;
          font-weight: 700;
          font-style: normal;
        }
      `}</style>

      <div className="faq">
        <h1>FAQ</h1>

        <Row
          title="I want to know more about it"
          text="<a href='mailto:sales@weekday.work' style='color: #00aeff;'>Contact us</a> at any time to set up a demo."
        />

        <Row
          title="This seems very new, what's the story?"
          text="Weekday is a new messaging platform built from the ground up to make communication & collaboration easier for your company."
        />

        <Row
          title="But, is this just another Slack or Microsoft Teams?"
          text="Yes, but we believe there are a few things about Weekday that you'll like more."
        />

        <Row
          title="Data & security is pretty important to us."
          text="Because Weekday is self hosted & deployed on premise you never need to worry about data security. You own your data."
        />

        <Row
          title="I need to connect my GitHub (or other) account"
          text="We are busy building more integrations, in the meantime you can use the Zapier app to connect almost any other platform."
        />

        <Row
          title="How do I build apps & integrations"
          text="We have well documented guides on how your organization can build apps & integrate your existing systems easily."
        />

        <Row
          title="Something has broken / I can't log in"
          text="Sorry about that! Weekday is still in beta, so please expect things to break from time to time. You can email us <a href='mailto:support@weekday.work' style='color: #00aeff;'>here</a> for any issues."
        />
      </div>
    </React.Fragment>
  );
}
