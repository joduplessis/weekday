import React from "react";
import Head from "next/head";
import Features from "../components/features";
import Footer from "../components/footer";
import Header from "../components/header";
import Hero from "../components/hero";

export default function PrivacyPolicy(props) {
  return (
    <React.Fragment>
      <Head>
        <title>Weekday - Give your team superpowers</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="/static/images/favicon.png" rel="shortcut icon" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://use.typekit.net/njt5tyh.css" />
      </Head>

      <style global jsx>{`
        * {
          margin: 0px;
          padding: 0px;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        button {
          font-family: "proxima-nova", sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        div,
        p,
        small,
        a {
          font-family: "DM Sans", sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        body {
          background-color: white;
          background-image: url(../static/images/bg.png);
          background-size: 100%;
        }

        .content-container {
          background: white;
          background-color: #f7f8f9;
          padding-top: 50px;
          padding-bottom: 30px;
          margin-left: auto;
          margin-right: auto;
          width: 100%;
          padding-right: 50px;
          padding-left: 50px;
        }

        .content-container h1 {
          font-size: 50px;
          color: #21232c;
          font-weight: 400;
          line-height: 80px;
          margin-bottom: 20px;
        }

        .content-container h2 {
          margin-top: 25px;
          font-size: 25px;
          color: white;
          line-height: 40px;
          font-weight: 300;
          color: #6e7e97;
          width: 40%;
        }

        .content-container a {
          color: #10acf3;
        }

        .content-container p {
          font-size: 16px;
          color: #6e7e97;
          padding-bottom: 10px;
          font-weight: 500;
          line-height: 24px;
        }

        .content-container li {
          font-size: 16px;
          line-height: 22px;
          color: #6e7e97;
          margin-left: 20px;
          padding-bottom: 10px;
          font-weight: 500;
        }
      `}</style>

      <Header />

      <div className="content-container">
        <h1>Privacy policy</h1>
        <p>
          Your privacy is important to us. It is Weekday's policy to respect
          your privacy regarding any information we may collect from you across
          our website, https://weekday.work, and other sites we own and operate.
        </p>
        <p>
          We only ask for personal information when we truly need it to provide
          a service to you. We collect it by fair and lawful means, with your
          knowledge and consent. We also let you know why we’re collecting it
          and how it will be used.
        </p>
        <p>
          We only retain collected information for as long as necessary to
          provide you with your requested service. What data we store, we’ll
          protect within commercially acceptable means to prevent loss and
          theft, as well as unauthorized access, disclosure, copying, use or
          modification.
        </p>
        <p>
          We don’t share any personally identifying information publicly or with
          third-parties, except when required to by law.
        </p>
        <p>
          Our website may link to external sites that are not operated by us.
          Please be aware that we have no control over the content and practices
          of these sites, and cannot accept responsibility or liability for
          their respective privacy policies.
        </p>
        <p>
          You are free to refuse our request for your personal information, with
          the understanding that we may be unable to provide you with some of
          your desired services.
        </p>
        <p>
          Your continued use of our website will be regarded as acceptance of
          our practices around privacy and personal information. If you have any
          questions about how we handle user data and personal information, feel
          free to contact us.
        </p>
        <p>This policy is effective as of 22 June 2020.</p>
        <h2>Address</h2>
        <p>Ballito, Kwazulu-Natal, South Africa</p>
        <p>Email: support@weekday.work</p>
      </div>
      <Footer />
    </React.Fragment>
  );
}
