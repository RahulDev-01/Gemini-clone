import React, { useContext, useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';
import { simpleMarkdownParser } from '../../utils/markdownParser';
import './main.css';

const Main = () => {
  const { onSent, showResult, loading, resultData, setInput, input, messages, clearHistory, newChat, theme, toggleTheme } = useContext(Context);
  const [expandedImage, setExpandedImage] = useState(null);


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

  // Handle photo generation
  const handlePhotoGeneration = () => {
    const photoPrompt = input || "Generate a beautiful, high-quality image";
    onSent(photoPrompt, true); // Pass true for image generation
  };

  return (
    <div className='main'>
      {/* Navigation Bar */}
      <div className='nav'>
        <p style={{ fontWeight: 400, cursor: 'pointer' }} > Gemini</p>  {/* App name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme Toggle Button */}
          <button
            className="clear-button"
            onClick={toggleTheme}
            style={{ border: 'none', fontSize: '1.2rem', padding: '6px 10px' }}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            className="clear-button"
            onClick={() => { clearHistory(); newChat(); }}
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
              {/* Text-based suggestions */}
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

              {/* Image generation suggestions */}
              <div
                className="card image-card"
                onClick={() => handlePhotoGeneration("A beautiful sunset over mountains")}
                onTouchStart={(e) => e.currentTarget.style.transform = 'translateY(-3px) scale(0.97)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <p>Generate a beautiful sunset over mountains</p>
                <img src={assets.gallery_icon} alt="Gallery Icon" />
              </div>
              <div
                className="card image-card"
                onClick={() => handlePhotoGeneration("A futuristic city skyline at night")}
                onTouchStart={(e) => e.currentTarget.style.transform = 'translateY(-3px) scale(0.97)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                <p>Create a futuristic city skyline at night</p>
                <img src={assets.gallery_icon2} alt="Gallery Icon" />
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
                  <div className="assistant-response">
                    {m.isImage ? (
                      <div className="image-response">
                        <div
                          className="image-preview-container"
                          onClick={() => setExpandedImage(`data:image/png;base64,${m.content}`)}
                        >
                          <img
                            src={`data:image/png;base64,${m.content}`}
                            alt="Generated Image"
                            className="generated-image-preview"
                            onError={(e) => {
                              console.error('Image load error:', e);
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully');
                            }}
                          />
                          <div className="image-overlay">
                            <button
                              className="download-btn-small"
                              onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = `data:image/png;base64,${m.content}`;
                                link.download = 'generated-image.png';
                                link.click();
                              }}
                              title="Download Image"
                            >
                              📥
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: simpleMarkdownParser(m.content) }}></div>
                    )}
                  </div>
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
            ))}

            {/* Show loading state */}
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

            {/* Show text result when not loading and has text data */}
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

        {/* Image Modal */}
        {expandedImage && (
          <div className="image-modal" onClick={() => setExpandedImage(null)}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-modal-btn"
                onClick={() => setExpandedImage(null)}
              >
                ✕
              </button>
              <img
                src={expandedImage}
                alt="Expanded Image"
                className="expanded-image"
              />
              <div className="modal-actions">
                <button
                  className="download-btn-modal"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = expandedImage;
                    link.download = 'generated-image.png';
                    link.click();
                  }}
                >
                  📥 Download Full Size
                </button>
              </div>
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
              onKeyDown={handleKeyDown}  // Trigger onSent function on "Enter" key press
            />
            <div>
              <img
                src={assets.gallery_icon}
                alt="Gallery Icon"
                className="photo-generate-button"
                onClick={handlePhotoGeneration}
                title="Generate Image"
              />
              <img src={assets.menu_icon} alt="Menu Icon" />  {/* Menu icon */}
              {/* Trigger the onSent function when the user clicks the send icon */}
              {input ? <img className="send-button" onClick={() => { onSent() }} src={assets.send_icon} alt="Send Icon" /> : null}

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
