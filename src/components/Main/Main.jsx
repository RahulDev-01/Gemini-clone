 import React, { useContext, useEffect, useRef } from 'react';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';
import { simpleMarkdownParser } from '../../utils/markdownParser';
import './main.css';

const Main = () => {
  const { onSent, recentPrompt, showResult, loading, resultData, setInput, input, messages, clearHistory, newChat } = useContext(Context);

  // Debugging: Log to check if `resultData` is populated
  console.log("resultData:", resultData);

  // Ref for chat container to auto-scroll
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, resultData, loading]);

  // Handle "Enter" key press to trigger sending the prompt
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default Enter key behavior (like submitting a form)
      onSent(); // Call the onSent function to send the prompt
    }
  };

  // Handle card click with mobile-friendly touch events
  const handleCardClick = (prompt) => {
    onSent(prompt);
  };

  return (
    <div className='main'>
      {/* Navigation Bar */}
      <div className='nav'>
        <p style={{fontWeight:400, cursor:'pointer'}} > Gemini</p>  {/* App name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="clear-button"
            onClick={() => { clearHistory(); newChat(); }} 
            style={{ 
              padding: '6px 10px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              background: '#fff', 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Clear
          </button>
          <img src={assets.user_icon} alt="User Icon" />  {/* Display user icon */}
        </div>
      </div>

      <div className="main-container">
        {/* If there is no chat history yet, display the initial UI (prompt cards) */}
        {messages.length === 0 ? (
          <>
            <div className="greet">
              <p><span>Hello Dev's ,I am Rahul</span></p> {/* Greet the user */}
              <p>How can I Help You Today ?</p> {/* Display help text */}
            </div>

            {/* Display suggestion cards for the user to choose from */}
            <div className='cards'>
              {/* Each card displays a different prompt suggestion */}
              <div 
                className="card" 
                onClick={() => handleCardClick("Suggest beautiful places to see on an upcoming road trip")}
                onTouchStart={(e) => e.currentTarget.style.transform = 'translateY(-3px) scale(0.97)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <img src={assets.compass_icon} alt="Compass Icon" />
              </div>
              <div 
                className="card" 
                onClick={() => handleCardClick("Explain the process of photosynthesis in simple terms")}
                onTouchStart={(e) => e.currentTarget.style.transform = 'translateY(-3px) scale(0.97)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <p>Explain the process of photosynthesis in simple terms</p>
                <img src={assets.message_icon} alt="Message Icon" />
              </div>
              <div 
                className="card" 
                onClick={() => handleCardClick("How do you create a responsive navbar using CSS and JavaScript?")}
                onTouchStart={(e) => e.currentTarget.style.transform = 'translateY(-3px) scale(0.97)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <p>How do you create a responsive navbar using CSS and JavaScript?</p>
                <img src={assets.bulb_icon} alt="Bulb Icon" />
              </div>
              <div 
                className="card" 
                onClick={() => handleCardClick("What are some essential skills for becoming a front-end developer?")}
                onTouchStart={(e) => e.currentTarget.style.transform = 'translateY(-3px) scale(0.97)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <p>What are some essential skills for becoming a front-end developer?</p>
                <img src={assets.code_icon} alt="Code Icon" />
              </div>
            </div>
          </>
        ) : (
          // Otherwise, render the chat history
          <div className='result' style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m) => (
              <div key={m.id} className={`result-data ${m.role === 'user' ? 'user-message' : ''}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <img src={m.role === 'user' ? assets.user_icon : assets.gemini_icon} alt={m.role} />
                {m.role === 'assistant' ? (
                  <div dangerouslySetInnerHTML={{ __html: simpleMarkdownParser(m.content) }}></div>
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
            ))}

            {/* While loading, render a live typing bubble with the animated resultData */}
            {showResult && loading && (
              <div className="result-data" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <img src={assets.gemini_icon} alt="Gemini Icon" />
                <div>
                  <div className='typing-indicator'>
                    <div className='typing-dot'></div>
                    <div className='typing-dot'></div>
                    <div className='typing-dot'></div>
                  </div>
                </div>
              </div>
            )}

            {/* Show result when not loading but showResult is true */}
            {showResult && !loading && resultData && (
              <div className="result-data" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <img src={assets.gemini_icon} alt="Gemini Icon" />
                <div>
                  <div dangerouslySetInnerHTML={{ __html: simpleMarkdownParser(resultData) }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
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
              onKeyDown={handleKeyDown}  // Trigger onSent function on "Enter" key press
            />
            <div>
              <img src={assets.gallery_icon} alt="Gallery Icon" />  {/* Gallery icon */}
              <img src={assets.menu_icon} alt="Menu Icon" />  {/* Menu icon */}
              {/* Trigger the onSent function when the user clicks the send icon */}
              {input?<img className="send-button" onClick={() => { onSent() }} src={assets.send_icon} alt="Send Icon" />:null}
              
            </div>
          </div>

          {/* Information about privacy and reliability of Gemini */}
          <p className='bottom-info'>
            Gemini may display inaccurate info, including about people, so double-check its responses. Created By {"<"} Savvana Rahul⚡{" >"} 
          </p>  
          
        </div>
      </div>
    </div>
  );
 }
  export default Main;  // Export the Main component for use in other parts of the app
