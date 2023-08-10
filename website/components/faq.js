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
          text="<a href='mailto:support@weekday.work' style='color: #00aeff;'>Contact us</a> at any time if you have any questions."
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
          title="How do I build apps & integrations"
          text="You are able to build any sort of integration with a flexible app-builder."
        />

        <Row
          title="Something has broken / I can't log in"
          text="You can email us for support issues <a href='mailto:support@weekday.work' style='color: #00aeff;'>here</a>. We will still formalize pricing plans so you get the best support."
        />
      </div>
    </React.Fragment>
  );
}
