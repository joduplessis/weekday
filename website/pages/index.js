import React from "react";
import Head from "next/head";
import Features from "../components/features";
import Footer from "../components/footer";
import Header from "../components/header";
import Hero from "../components/hero";
import Faq from "../components/faq";
import Subscribe from "../components/subscribe";
import Downloads from "../components/downloads";

export default function Home(props) {
  return (
    <React.Fragment>
      <Head>
        <title>Weekday - Give your team superpowers</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="/static/images/favicon.png" rel="shortcut icon" />
        <script
          type="text/javascript"
          src="https://js.createsend1.com/javascript/copypastesubscribeformlogic.js"
        ></script>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://use.typekit.net/njt5tyh.css" />
        <script src="https://assets.yack.app/0.0.1.js"></script>
      </Head>

      <style global jsx>{`
        * {
          margin: 0px;
          padding: 0px;
        }

        body {
          background-color: #151c26;
          background-color: #02081a;
          background-image: url(../static/images/bg.png);
          background-size: 100%;
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
      `}</style>

      <Header />
      <Hero />
      <Features />
      <Faq />

      <Downloads />
      <Subscribe />
      <Footer />
    </React.Fragment>
  );
}
