import React from "react";

export default function Features(props) {
  return (
    <React.Fragment>
      <a name="features"></a>
      <style jsx>{`
        .logos {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-content: center;
          align-items: center;
        }

        .features {
          background-color: #212835;
          background-color: #f7f8f9;
          padding: 50px;
          padding-top: 0px;
          padding-bottom: 0px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-content: center;
          align-items: center;
        }

        .features .hero {
          margin-top: -100px;
          text-align: center;
          width: 100%;
        }

        .features .hero .image {
          width: 80%;
          margin-right: auto;
          margin-left: auto;
        }

        .features .hero .image img {
          display: inline-block;
          border-radius: 10px;
          width: 100%;
          -webkit-box-shadow: 0px 0px 50px 3px rgba(0, 0, 0, 0.26);
          -moz-box-shadow: 0px 0px 50px 3px rgba(0, 0, 0, 0.26);
          box-shadow: 0px 0px 50px 3px rgba(0, 0, 0, 0.26);
        }

        .features h1 {
          font-size: 48px;
          width: 60%;
          margin-right: auto;
          margin-left: auto;
          margin-top: 10px;
          text-align: center;
          color: #21232c;
          font-weight: 700;
          font-style: normal;
        }

        .features h1.label {
          font-size: 14px;
          width: 60%;
          margin-right: auto;
          margin-left: auto;
          margin-top: 100px;
          text-align: center;
          color: #acb5bd;
          font-weight: 700;
          font-style: normal;
          text-transform: uppercase;
        }

        .features h2 {
          font-size: 24px;
          margin-top: 20px;
          width: 40%;
          margin-right: auto;
          margin-left: auto;
          margin-bottom: 100px;
          text-align: center;
          color: #6e7e97;
          font-weight: 400;
          line-height: 30px;
          font-style: normal;
        }

        .hero-features {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-content: center;
          align-items: flex-start;
          width: 80%;
          margin-right: auto;
          margin-left: auto;
        }

        .hero-features .feature {
          flex: 1;
          text-align: left;
          padding: 10px;
          margin-top: 50px;
        }

        .hero-features .feature h3 {
          font-size: 22px;
          color: #21232c;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .hero-features .feature a {
          font-size: 18px;
          color: #3369e7;
          line-height: 24px;
          text-decoration: none;
          margin-top: 10px;
          display: inline-block;
        }

        .hero-features .feature h3 .coming-soon {
          background: #b84592;
          color: white;
          font-size: 8px;
          font-weight: 800;
          padding: 5px;
          text-transform: uppercase;
          border-radius: 3px;
          position: relative;
          top: -5px;
          left: 5px;
        }

        .hero-features .feature p {
          font-size: 18px;
          color: #6e7e97;
          line-height: 24px;
          font-weight: 400;
        }

        .small-features {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-content: center;
          align-items: flex-start;
          width: 80%;
          margin-right: auto;
          margin-left: auto;
          margin-bottom: 50px;
        }

        .small-features .feature {
          flex: 1;
          text-align: left;
          padding: 10px;
        }

        .small-features .feature h3 {
          font-size: 18px;
          color: #21232c;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .small-features .feature h3 a {
          font-size: 18px;
          color: #3369e7;
          font-weight: 400;
          margin-bottom: 10px;
        }

        .small-features .feature h3 .app {
          background: #8e43e7;
          color: white;
          font-size: 8px;
          font-weight: 800;
          padding: 5px;
          text-transform: uppercase;
          border-radius: 3px;
          position: relative;
          top: -2px;
          left: 5px;
        }

        .small-features .feature h3 .coming-soon {
          background: #b84592;
          color: white;
          font-size: 8px;
          font-weight: 800;
          padding: 5px;
          text-transform: uppercase;
          border-radius: 3px;
          position: relative;
          top: -5px;
          left: 5px;
        }

        .small-features .feature p {
          font-size: 16px;
          color: #6e7e97;
          line-height: 24px;
          font-weight: 400;
        }

        @media only screen and (max-width: 1000px) {
          .hero {
            background-image: none;
          }

          .features h1 {
            width: 100%;
          }

          .features h2 {
            width: 100%;
          }

          .features h3 {
            width: 100%;
          }
        }
      `}</style>

      <div className="features">
        <div className="hero">
          <div className="image">
            <img src="../static/images/screenshot.png" />
          </div>
          <div className="hero-features">
            <div className="feature">
              <h3>
                Meet (video conferencing){" "}
                <span className="coming-soon">Beta</span>
              </h3>
              <p>Catch up with your team using video or audio calls.</p>
            </div>
            <div className="feature">
              <h3>Tasks & Boards</h3>
              <p>
                Stay on top of tasks that need to be completed using lists or
                boards.
              </p>
            </div>
            <div className="feature">
              <h3>Calendar</h3>
              <p>Get a bird's eye view of what's happening with projects.</p>
            </div>
          </div>
        </div>
        <h1 className="label">FEATURES</h1>
        <h1>Take back team collaboration</h1>
        <h2>
          Weekday makes working in a team fun again. Here are some things
          Weekday can help your team with.
        </h2>
        <div className="small-features">
          <div className="feature">
            <h3>Private & public channels</h3>
            <p>
              Weekday channels can be public or private (when you need to talk
              one on one). Channels can also be one-way (broadcast) or limited
              to a group of people.
            </p>
          </div>
          <div className="feature">
            <h3>Archiving, muting & starring</h3>
            <p>
              When you need to focus on only a few projects, Weekday lets you
              mute, archive or star channels to keep them nice and organised.
            </p>
          </div>
          <div className="feature">
            <h3>Granular permissions</h3>
            <p>
              Give only a few people power - or many. Permissions can be set on
              channels & teams independantly.
            </p>
          </div>
        </div>
        <div className="small-features">
          <div className="feature">
            <h3>Do not disturb, presences & notifications</h3>
            <p>
              When you need to focus, you can turn off notifications for a time
              period - or set your presence to busy or away.
            </p>
          </div>
          <div className="feature">
            <h3>Made for remote work</h3>
            <p>
              Weekday will always let you know what timezone your fellow member
              is on.{" "}
            </p>
          </div>
          <div className="feature">
            <h3>Unlimited history</h3>
            <p>
              We won't limit the number of searchable messages for the alpha.
              Keep updated about premium plans by subscribing to our mailing
              list.
            </p>
          </div>
        </div>
        <div className="small-features">
          <div className="feature">
            <h3>Appstore & platform</h3>
            <p>
              Build your own team apps, private apps or install other people's
              apps from the app store.{" "}
            </p>
          </div>
          <div className="feature">
            <h3>
              Polls<span className="app">App</span>
            </h3>
            <p>
              Get feedback from your channel members by posting polls to the
              channel - there is no limit to how many polls are allowed.
            </p>
          </div>
          <div className="feature">
            <h3>
              Google Drive<span className="app">App</span>
            </h3>
            <p>
              Connect Google Drive accounts so you can access your files quickly
              & easily.{" "}
            </p>
          </div>
        </div>
        <div className="small-features">
          <div className="feature">
            <h3>
              Zapier<span className="app">App</span>
            </h3>
            <p>
              Connect your favourite app to Weekday by using our Zapier
              integration.
            </p>
            <p>
              <a href="/zapier">Read more</a>
            </p>
          </div>
          <div className="feature">
            <h3>GDPR friendly</h3>
            <p>
              We believe that your data is yours and want to do our best in
              making it as secure & accessible to you as possible. With Weekday,
              you own your data.
            </p>
          </div>
          <div className="feature">
            <h3>
              ... and more!{" "}
              <a href="https://github.com/joduplessis/weekday" target="_blank">
                Contact Us Now
              </a>
            </h3>
          </div>
        </div>

        {/*
        <h1 className="label">CUSTOMERS</h1>
        <h2>Leveling up teams at:</h2>

        <div className="logos">
          <img
            src="https://www.pinclipart.com/picdir/middle/69-698379_mr-price-group-mr-price-group-logo-clipart.png"
            height="30"
          />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <img
            src="https://yreeka.com/wp-content/uploads/2018/08/logo.png"
            height="50"
          />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <img
            src="https://www.vogel-gruppe.de/fileadmin/user_upload/ParkerStore-Vogel-Header.jpg"
            height="30"
          />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <img
            src="http://culp.co.za/wp-content/uploads/2018/11/CULP-Header-logo.png"
            height="30"
          />
        </div>
        */}

        <br />
        <br />
        <br />
        <br />
      </div>
    </React.Fragment>
  );
}
