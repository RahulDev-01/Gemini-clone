import React, { useContext } from 'react';  // Import React and useContext hook
import './main.css'; // Import custom CSS styles
import { assets } from '../../assets/assets'; // Import assets like icons and images
import { Context } from '../../context/Context'; // Import the Context to access shared state

function Main() {
  // Destructure the necessary values and functions from the Context
  const { onSent, recentPrompt, showResult, loading, resultData, setInput, input } = useContext(Context);

  // Debugging: Log to check if `resultData` is populated
  console.log("resultData:", resultData);

  return (
    <div className='main'>
      {/* Navigation Bar */}
      <div className='nav'>
        <p>Gemini</p>  {/* App name */}
        <img src={assets.user_icon} alt="User Icon" />  {/* Display user icon */}
      </div>

      <div className="main-container">
        {/* Conditional rendering based on showResult */}
        {/* If showResult is false, display the initial UI (prompt cards) */}
        {!showResult ? (
          <>
            <div className="greet">
              <p><span>Hello, Rahul</span></p> {/* Greet the user */}
              <p>How can I Help You Today ?</p> {/* Display help text */}
            </div>

            {/* Display suggestion cards for the user to choose from */}
            <div className='cards'>
              {/* Each card displays a different prompt suggestion */}
              <div className="card">
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <img src={assets.compass_icon} alt="Compass Icon" />
              </div>
              <div className="card">
                <p>Explain the process of photosynthesis in simple terms</p>
                <img src={assets.message_icon} alt="Message Icon" />
              </div>
              <div className="card">
                <p>How do you create a responsive navbar using CSS and JavaScript?</p>
                <img src={assets.bulb_icon} alt="Bulb Icon" />
              </div>
              <div className="card">
                <p>What are some essential skills for becoming a front-end developer?</p>
                <img src={assets.code_icon} alt="Code Icon" />
              </div>
            </div>
          </>
        ) : (
          // If showResult is true, display the result section
          <div className='result'>
            <div className="result-title">
              <img src={assets.user_icon} alt="User Icon" />
              <p>{recentPrompt}</p> {/* Display the most recent prompt */}
            </div>
            <div className="result-data">
              <img src={assets.gemini_icon} alt="Gemini Icon" />
              {/* Check if resultData is available before rendering */}
              {resultData ? (
                <p dangerouslySetInnerHTML={{ __html: resultData }}></p>  // Render result as HTML
              ) : (
                // Display loading indicator if resultData is not available yet
                <div className='loader'>
                  <hr />
                  <hr />
                  <hr />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Search Section */}
        <div className="main-bottom">
          <div className="search-box">
            {/* Input field for the user to type a prompt */}
            <input
              type="text"
              placeholder='Enter a prompt here'
              onChange={(e) => setInput(e.target.value)}  // Update input state when the user types
              value={input}  // Bind the input field to the state to reflect user input
            />
            <div>
              <img src={assets.gallery_icon} alt="Gallery Icon" />  {/* Gallery icon */}
              <img src={assets.menu_icon} alt="Menu Icon" />  {/* Menu icon */}
              {/* Trigger the onSent function when the user clicks the send icon */}
              <img onClick={() => { onSent() }} src={assets.send_icon} alt="Send Icon" />
            </div>
          </div>

          {/* Information about privacy and reliability of Gemini */}
          <p className='bottom-info'>
            Gemini may display inaccurate info, including about people, so double-check its responses. {/* Privacy and disclaimer text */}
            Your privacy & Gemini Apps
          </p>
        </div>
      </div>
    </div>
  );
}

export default Main;  // Export the Main component for use in other parts of the app
