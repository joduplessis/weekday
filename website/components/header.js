import React from "react";
import Link from "next/link";

export default function Header(props) {
  return (
    <React.Fragment>
      <style jsx>{`
        .header {
          width: 100%;
        }

        .header .h-container {
          width: 100%;
          padding-top: 75px;
          padding-bottom: 30px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-content: center;
          align-items: center;
        }

        .header .h-container .flexer {
          flex: 1;
        }

        .header .h-container .logo {
          position: relative;
          z-index: 1000;
          display: block;
          margin-left: 50px;
        }

        .header .h-container .links {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-content: center;
          align-items: center;
          margin-right: 50px;
        }

        .header .h-container .links a {
          color: white;
          font-size: 16px;
          display: block;
          cursor: pointer;
          font-weight: 500;
          margin-left: 30px;
          text-decoration: none;
        }

        .header .h-container .links a:first-child {
          margin-left: 0px;
        }

        .header .h-container .links a.button {
          color: white;
          padding: 10px 15px 10px 15px;
          background-color: #b84592;
          border-radius: 3px;
          font-weight: 500;
          font-size: 14px;
        }

        .header .h-container .links a:hover {
          opacity: 0.8;
        }
      `}</style>
      <div className="header">
        <div className="h-container">
          <a href="/" className="logo">
            <img src="../static/images/logo.png" height="25" alt="Weekday" />
          </a>

          <div className="flexer"></div>

          <div className="links">
            <a href="/">Home</a>
            <a href="/#features">Features</a>
            <a href="/#faq">FAQ</a>
            <a href="/#faq">Pricing</a>
            <a
              href="mailto:support@weekday.work"
              id="yack"
              data-inbox="weekday"
            >
              Support
            </a>
            <a
              href="mailto:support@weekday.work"
              target="_blank"
              className="button"
            >
              Contact Support
            </a>
            <a
              href="https://github.com/joduplessis/weekday"
              target="_blank"
              style={{ position: 'relative', top: 2 }}>
              <svg width="20" height="20" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <path d="M475.074,-0C495.469,-0 512,16.531 512,36.926L512,475.074C512,495.469 495.469,512 475.074,512L36.926,512C16.531,512 0,495.469 0,475.074L0,36.926C0,16.531 16.531,0 36.926,0L475.074,-0ZM328.668,511.513C331.074,512.125 334.015,512.199 337.564,511.512L328.668,511.513ZM328.668,511.513C322.006,509.821 319.443,504.013 319.443,498.856C319.443,490.166 319.749,461.757 319.749,426.458C319.749,401.844 311.317,385.79 301.855,377.603C360.601,371.071 422.317,348.76 422.317,247.433C422.317,218.63 412.081,195.096 395.166,176.621C397.905,169.976 406.939,143.144 392.579,106.805C392.579,106.805 370.456,99.715 320.103,133.847C299.019,128.002 276.433,125.071 254.013,124.97C231.593,125.071 209.025,128.002 187.981,133.847C137.566,99.715 115.412,106.805 115.412,106.805C101.087,143.144 110.117,169.976 112.857,176.621C95.98,195.096 85.675,218.63 85.675,247.433C85.675,348.52 147.273,371.141 205.87,377.812C198.326,384.4 191.489,396.038 189.121,413.089C174.066,419.83 135.88,431.49 112.35,391.159C112.35,391.159 98.401,365.833 71.909,363.972C71.909,363.972 46.169,363.636 70.105,380.01C70.105,380.01 87.396,388.118 99.397,418.611C99.397,418.611 114.884,465.697 188.278,449.738C188.391,471.783 188.636,492.565 188.636,498.856C188.636,504.051 185.945,509.912 179.111,511.545L170.611,511.547C173.965,512.168 176.779,512.103 179.111,511.545L328.668,511.513ZM189.299,424.175C189.674,426.298 187.494,428.478 184.379,429.059C181.317,429.618 178.482,428.308 178.093,426.202C177.713,424.026 179.932,421.846 182.99,421.283C186.109,420.741 188.901,422.017 189.299,424.175ZM167.544,425.009C167.618,427.184 165.084,428.989 161.948,429.028C158.793,429.098 156.242,427.337 156.207,425.197C156.207,422.999 158.684,421.212 161.838,421.16C164.975,421.099 167.544,422.846 167.544,425.009ZM145.399,422.552C144.761,424.618 141.795,425.557 138.807,424.679C135.823,423.775 133.87,421.355 134.473,419.267C135.093,417.187 138.073,416.209 141.083,417.148C144.062,418.048 146.019,420.45 145.399,422.552ZM125.94,416.76C124.494,418.354 121.414,417.926 119.16,415.75C116.853,413.623 116.211,410.604 117.662,409.009C119.125,407.411 122.223,407.861 124.494,410.019C126.783,412.142 127.482,415.182 125.94,416.76ZM110.884,399.602C109.268,400.724 106.625,399.672 104.991,397.326C103.374,394.98 103.374,392.166 105.026,391.039C106.664,389.912 109.268,390.925 110.923,393.254C112.535,395.639 112.535,398.453 110.884,399.602ZM101.982,384.787C100.723,385.953 98.264,385.411 96.595,383.568C94.869,381.729 94.546,379.269 95.822,378.085C97.119,376.919 99.504,377.465 101.234,379.304C102.96,381.165 103.297,383.607 101.982,384.787ZM89.005,373.208C88.424,374.518 86.362,374.911 84.483,374.011C82.57,373.151 81.495,371.364 82.115,370.049C82.683,368.699 84.75,368.323 86.659,369.228C88.577,370.088 89.669,371.893 89.005,373.208Z" style={{ fillRule: 'nonzero', fill: '#63738B' }} />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
