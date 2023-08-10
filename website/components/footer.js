import React from "react";
import Link from "next/link";
import Subscribe from "./subscribe";

export default function Footer(props) {
  return (
    <React.Fragment>
      <a name="footer"></a>
      <style jsx>{`
        .footer {
          background-color: #03172e;
          padding: 50px;
          padding-bottom: 100px;
        }

        .footer p {
          font-size: 14px;
          width: 50%;
          margin-right: auto;
          margin-left: auto;
          text-align: center;
          color: #8492a6;
          padding: 30px;
          padding-bottom: 50px;
          font-weight: 600;
        }

        .footer .image {
          padding: 10px;
          width: 50%;
          margin-right: auto;
          margin-left: auto;
          text-align: center;
        }

        .footer ul {
          list-style-type: none;
          margin: 0px;
          padding: 0px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-content: center;
          align-items: center;
          width: 100%;
        }

        .footer ul li {
          list-style-type: none;
          margin-right: 20px;
          padding: 0px;
        }

        .footer ul li a {
          transition: opacity 0.25s linear;
          opacity: 1;
          color: #6e7e97;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .footer ul li a img {
          fill: #63748b;
          position: relative;
          top: 2px;
        }

        .footer ul li a:hover {
          opacity: 0.75;
        }
      `}</style>

      <div className="footer">
        <ul>
          <li>
            <a href="#">Weekday &copy; 2023</a>
          </li>
          <li>
            <a href="/privacypolicy">Privacy policy</a>
          </li>
          <li>
            <a href="/termsofuse">Terms of use</a>
          </li>
          {/*
          <li><a href="https://twitter.com/TeamWeekday" target="_blank"><img src="../static/icons/twitter.svg" border="0" height="30" /></a></li>
          <li><a href="https://www.facebook.com/TeamWeekday" target="_blank"><img src="../static/icons/facebook.svg" border="0" height="30" /></a></li>
          <li><a href="https://www.instagram.com/teamweekday/" target="_blank"><img src="../static/icons/instagram.svg" border="0" height="30" /></a></li>
          <li><a href="https://github.com/WeekdayApp" target="_blank"><img src="../static/icons/github.svg" border="0" height="30" /></a></li>
          */}
        </ul>
      </div>
    </React.Fragment>
  );
}
