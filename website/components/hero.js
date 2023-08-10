import React from "react";
import Subscribe from "../components/subscribe";
import Link from "next/link";
import { ArrowRight } from "react-feather";

export default function Hero(props) {
  return (
    <React.Fragment>
      <a name="hero"></a>

      <style jsx>{`
        .hero {
          margin: 0px;
          padding: 0px;
          padding-bottom: 150px;
          width: 100%;
          flex-direction: column;
          justify-content: center;
          align-content: center;
          align-items: center;
        }

        .hero h1 {
          font-size: 90px;
          color: white;
          font-weight: 300;
          font-style: normal;
          line-height: 100px;
          text-align: center;
          margin-right: auto;
          margin-left: auto;
          margin-top: 0px;
          width: 80%;
        }

        .hero h2 {
          margin-top: 40px;
          font-size: 24px;
          color: white;
          line-height: 35px;
          letter-spacing: 0.75;
          font-weight: 400;
          text-align: center;
          margin-right: auto;
          margin-left: auto;
          margin-bottom: 40px;
          width: 600px;
        }

        .hero h3 {
          font-size: 13px;
          text-transform: uppercase;
          text-align: center;
          width: 100%;
          color: #515d79;
          font-weight: 500;
          font-style: normal;
          letter-spacing: 1.25px;
          margin-bottom: 10px;
        }

        .hero p {
          font-size: 12px;
          font-weight: 400;
          text-align: center;
          margin-right: auto;
          margin-left: auto;
          width: 350px;
          line-height: 20px;
          color: #515d79;
        }

        @media only screen and (max-width: 1000px) {
          .hero {
            background-image: none;
          }

          .hero h1 {
            font-size: 50px;
          }

          .hero h2 {
            width: 100%;
          }

          .hero p {
            width: 100%;
          }
        }

        .closed-beta {
          margin: 0px;
          padding: 0px;
          margin-top: 0px;
          margin-bottom: 0px;
          position: relative;
          margin-left: auto;
          margin-right: auto;
          width: 500px;
          padding: 0px;
          overflow: hidden;
          height: 200px;
        }

        @media only screen and (max-width: 1000px) {
          .closed-beta {
            width: 500px;
          }
        }

        .closed-beta div {
          position: relative;
        }

        .closed-beta input {
          border: 0px;
          padding: 20px;
          height: 75px;
          font-size: 14px;
          color: white;
          background: #08112e;
          outline: none;
          width: 500px;
          box-sizing: border-box;
          border-radius: 5px;
          margin-top: 10px;
        }

        .closed-beta input::placeholder {
          color: #515d79;
        }

        .closed-beta button {
          background-color: #8e43e7;
          border-radius: 0px 5px 5px 0px;
          width: 150px;
          height: 75px;
          border: none;
          font-size: 22px;
          color: white;
          transition: opacity 0.25s linear;
          opacity: 1;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-content: center;
          align-items: center;
          left: 350px;
          transform: translateY(-100%);
          outline: none;
        }

        .closed-beta button:hover {
          opacity: 0.75;
        }

        .closed-beta button .text {
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .closed-beta button .icon {
          margin-left: 10px;
          position: relative;
          top: 3px;
        }

        .closed-beta button:hover {
          opacity: 0.75;
        }
      `}</style>

      <div className="hero">
        <h1>Level up your team</h1>
        <h2>
          Weekday is a messaging-first collaboration platform that gives your
          team superpowers.
        </h2>
        <h3>Keep updated on new developments</h3>

        <div className="closed-beta">
          <form
            className="js-cm-form"
            id="subForm"
            action="https://www.createsend.com/t/subscribeerror?description="
            method="post"
            data-id="2BE4EF332AA2E32596E38B640E905619F53C6A2398CD3130770B2DB5FC77783270ABFD0FCD97749CB1AC95B699CE570C9642292C1DBD22217BCB1866219B7383"
          >
            <div>
              <div>
                <input
                  aria-label="Name"
                  id="fieldName"
                  maxLength="200"
                  name="cm-name"
                  placeholder="Full name"
                />
              </div>
              <div>
                <input
                  autoComplete="Email"
                  aria-label="Email"
                  className="js-cm-email-input qa-input-email"
                  id="fieldEmail"
                  maxLength="200"
                  name="cm-yhllvh-yhllvh"
                  required=""
                  type="email"
                  placeholder="Team email address"
                />
              </div>
            </div>
            <button type="submit" className="button">
              <span className="text">Join</span>
              <span className="icon">
                <ArrowRight color="white" size="25" />
              </span>
            </button>
          </form>
        </div>

        <p>
          Weekday is a self hosted messaging platform for the enterprise. We
          offer special discounts for teams of less than 100. Please read our
          FAQ for more information.
        </p>
      </div>
    </React.Fragment>
  );
}
