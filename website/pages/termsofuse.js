import React from "react";
import Head from "next/head";
import Features from "../components/features";
import Footer from "../components/footer";
import Header from "../components/header";
import Hero from "../components/hero";

export default function TermsOfUse(props) {
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
          background-color: #151c26;
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
          color: #6e7e97;
          line-height: 40px;
          font-weight: 300;
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
        <h1>Terms of use</h1>
        <h2>1. Terms</h2>
        <p>
          By accessing the website at https://weekday.work, you are agreeing to
          be bound by these terms of service, all applicable laws and
          regulations, and agree that you are responsible for compliance with
          any applicable local laws. If you do not agree with any of these
          terms, you are prohibited from using or accessing this site. The
          materials contained in this website are protected by applicable
          copyright and trademark law.
        </p>
        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the
          materials (information or software) on Weekday's website for personal,
          non-commercial transitory viewing only. This is the grant of a
          license, not a transfer of title, and under this license you may not
          modify or copy the materials;
        </p>
        <ul>
          <li>
            use the materials for any commercial purpose, or for any public
            display (commercial or non-commercial);
          </li>
          <li>
            attempt to decompile or reverse engineer any software contained on
            Weekday's website;
          </li>
          <li>
            remove any copyright or other proprietary notations from the
            materials; or
          </li>
          <li>
            transfer the materials to another person or "mirror" the materials
            on any other server.
          </li>
        </ul>
        <p>
          This license shall automatically terminate if you violate any of these
          restrictions and may be terminated by Weekday at any time. Upon
          terminating your viewing of these materials or upon the termination of
          this license, you must destroy any downloaded materials in your
          possession whether in electronic or printed format.
        </p>
        <h2>3. Disclaimer</h2>
        <p>
          The materials on Weekday's website are provided on an 'as is' basis.
          Weekday makes no warranties, expressed or implied, and hereby
          disclaims and negates all other warranties including, without
          limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual
          property or other violation of rights.
        </p>
        <p>
          Further, Weekday does not warrant or make any representations
          concerning the accuracy, likely results, or reliability of the use of
          the materials on its website or otherwise relating to such materials
          or on any sites linked to this site.
        </p>
        <h2>4. Limitations</h2>
        <p>
          In no event shall Weekday or its suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit, or
          due to business interruption) arising out of the use or inability to
          use the materials on Weekday's website, even if Weekday or a Weekday
          authorized representative has been notified orally or in writing of
          the possibility of such damage. Because some jurisdictions do not
          allow limitations on implied warranties, or limitations of liability
          for consequential or incidental damages, these limitations may not
          apply to you.
        </p>
        <h2>5. Accuracy of materials</h2>
        <p>
          The materials appearing on Weekday's website could include technical,
          typographical, or photographic errors. Weekday does not warrant that
          any of the materials on its website are accurate, complete or current.
          Weekday may make changes to the materials contained on its website at
          any time without notice. However Weekday does not make any commitment
          to update the materials.
        </p>
        <h2>6. Links</h2>
        <p>
          Weekday has not reviewed all of the sites linked to its website and is
          not responsible for the contents of any such linked site. The
          inclusion of any link does not imply endorsement by Weekday of the
          site. Use of any such linked website is at the user's own risk.
        </p>
        <h2>7. Modifications</h2>
        <p>
          Weekday may revise these terms of service for its website at any time
          without notice. By using this website you are agreeing to be bound by
          the then current version of these terms of service.
        </p>
        <h2>8. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance
          with the laws of Germany and you irrevocably submit to the exclusive
          jurisdiction of the courts in that State or location.
        </p>
        <h2>Address</h2>
        <p>Ballito, Kwazulu-Natal, South Africa</p>
        <p>Email: support@weekday.work</p>
      </div>
      <Footer />
    </React.Fragment>
  );
}
