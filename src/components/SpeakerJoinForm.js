import { useState} from "react";

function Join({ spekerDetails, hmsActions}) {
  
  const userName = spekerDetails.data.speaker.name;

  const token = spekerDetails.data.jwt;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = {
      userName: userName,
      authToken: token, // client-side token generated from your token service
      settings: {
        isAudioMuted: true,
        isVideoMuted: true,
      },
      metaData: JSON.stringify({ city: "Winterfell", knowledge: "nothing" }),
      rememberDeviceSelection: true, // remember manual device change
    };

    try {
      console.log(config);
      await hmsActions.join(config);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="home">
      <img
        className="logo"
        src="https://medicallearninghub.com/assets/img/logo-white.png"
        alt="logo"
        height={100}
        width={150}
      />
      <h2 style={{ marginTop: "2rem" }}>Join Event</h2>
      <p>Hi, {userName}</p>
      <form onSubmit={handleSubmit}>
        <button className="btn btn-primary" style={{ margin: "0 auto" }}>
          Join Now
        </button>
      </form>
    </div>
  );
}

export default Join;
