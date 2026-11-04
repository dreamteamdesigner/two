import React from "react";

const LocationMap = () => {
  return (
    <div className="map-container">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1511.0914155525224!2d-73.98685889329462!3d40.758003324521084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855a96da09d%3A0x860bf5a5e1a00a68!2sTimes%20Square%2C%20New%20York%2C%20NY%2010036%2C%20USA!5e0!3m2!1sen!2sng!4v1793705035564!5m2!1sen!2sng"
        style={{ border: 0 }}
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  );
};

export default LocationMap;
