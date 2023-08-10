import React from 'react'

export default function Subscribe(props) {
  return (
    <React.Fragment>
      <style global jsx>{`
        .subscribe {
          background: #011126;
          margin: 0px;
          padding: 0px;
          padding-top: 30px;
          padding-bottom: 30px;
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: row;
          align-items: center;
          align-content: center;
          justify-content: center;
        }

        .subscribe h1 {
          font-size: 48px;
          width: 60%;
          margin-right: auto;
          margin-left: auto;
          margin-bottom: 50px;
          text-align: center;
          color: #515D79;
          font-weight: 700;
          font-style: normal;
          display: none;
        }

        .subscribe h2 {
          font-size: 14px;
          display: inline-block;
          text-align: center;
          color: #6E7E97;
          font-weight: 500;
          margin-right: 20px;
        }

        @media only screen and (max-width: 1000px) {
          .subscribe {
            width: 500px;
          }
        }

        .subscribe form {
          display: flex;
          flex-direction: row;
          align-items: center;
          align-content: center;
          justify-content: center;
        }

        .subscribe input {
          border: 0px;
          padding: 20px;
          font-size: 14px;
          color: #6E7E97;
          background: #EAEDEF;
          outline: none;
          width: 300px;
          box-sizing: border-box;
          border-radius: 5px;
          margin-right: 5px;
        }

        .subscribe input::placeholder {
          color: #515D79;
        }

        .subscribe button {
          background-color: #8e43e7;
          border-radius: 5px;
          padding: 20px;
          border: none;
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
          outline: none;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .subscribe button:hover {
          opacity: 0.75;
        }

        @media only screen and (max-width: 500px) {
          .subscribe,
          .subscribe input[type="email"] {
            width: 300px;
          }

          .subscribe button {
            left: 150px;
          }
        }
      `}</style>

      <div className="subscribe">
        {/*
        <h1>
          Join our mailing list
        </h1>
        */}
        <h2>
          Keep up to date with releases & news.
        </h2>
        <form className="js-cm-form" id="subForm" action="https://www.createsend.com/t/subscribeerror?description=" method="post" data-id="2BE4EF332AA2E32596E38B640E905619E8F2A4A9BC5AFAFD1F79F545ED49CE1EF043DFD1E8F58B5970CD8C352A910033FC84CEB3C085CB0E46333793E01E92F8">
          <input aria-label="Name" id="fieldName" maxLength="200" name="cm-name" placeholder="Full name" />
          <input autoComplete="Email" aria-label="Email" className="js-cm-email-input qa-input-email" id="fieldEmail" maxLength="200" name="cm-ydlkhut-ydlkhut" required="" type="email" placeholder="Email address" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </React.Fragment>
  )
}
