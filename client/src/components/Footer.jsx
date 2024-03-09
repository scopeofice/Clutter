import React from "react";
import "../styles.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-build">
          <span>2024 &copy; All Rights Reserved.</span>{" "}
          <span className="sepration">|</span>
          <span>
            Build With <span className="heart">&#9825;</span> by Shubham
            Ghodkhande
          </span>
          <span className="sepration">|</span>
          <a href="/" className="footer-link">
            Say hello
          </a>
        </div>

      <div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      </div>
    </footer>
  );
}
