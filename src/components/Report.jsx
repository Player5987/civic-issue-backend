import React, { useState } from "react";
import { FaFileAlt, FaUpload } from "react-icons/fa";
import "./report.css";

function Report() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Issue Description:", description);
    console.log("Uploaded Image:", image);
    alert("Report submitted successfully!");
    setDescription("");
    setImage(null);
    e.target.reset(); // reset form
  };

  return (
    <div className="report-wrapper">
      <div className="branding">
        <FaFileAlt className="logoIcon" />
        <h1 className="brandName">Report Issue</h1>
        <p className="tagline">Help us improve your city</p>
      </div>

      <div className="report-card">
        <h2 className="title">Describe Your Issue</h2>
        <p className="subtitle">Provide details and an image if possible</p>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="inputGroup">
            <FaFileAlt className="icon" />
            <textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="inputGroup fileInput">
            <FaUpload className="icon" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <button type="submit" className="button">
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}

export default Report;
