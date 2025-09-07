import { useContext, useState } from "react";  // Importing necessary hooks
import { assets } from "../../assets/assets";  // Import assets like icons
import './sidebar.css';  // Importing the CSS for sidebar styling
import { Context } from "../../context/Context";  // Importing the Context to access global state

const Sidebar = () => {
    // State for toggling the extended/collapsed state of the sidebar
    const [extended, setExtended] = useState(false); 
    
    // Destructuring values from the Context
    const { onSent, previousPrompt, setPrevPrompts, setRecentPrompt , newChat } = useContext(Context);

    // Function to load the prompt and send it when clicking a recent entry
    const loadPrompt = async (prompt) => {
        setRecentPrompt(prompt);  // Set the clicked prompt as the recent prompt
        await onSent(prompt);  // Send the prompt and get the response
    };

    return (
        <div className="sidebar"> {/* Sidebar container */}
            <div className="top"> {/* Top section of the sidebar */}
                {/* Menu icon (hamburger) that toggles the sidebar visibility */}
                <img
                    src={assets.menu_icon}  // The menu icon (you could switch to minus_icon when extended)
                    className="menu"  // Styling class for the menu icon
                    alt="menu-icon"
                    onClick={() => setExtended(prev => !prev)}  // Toggle the extended state when clicked
                />

                {/* New chat button */}
                <div className="new-chat" onClick={() => newChat()}>  {/* Trigger a new chat when clicked */}
                    <img src={assets.plus_icon} alt="plus-icon" />  {/* Plus icon */}
                    {/* Only show the "New Chat" label when the sidebar is extended */}
                    {extended ? <p>New Chat</p> : null}
                </div>

                {/* Display recent prompts when the sidebar is extended */}
                {extended ? (
                    <div className="recent">  {/* Recent section containing recent prompts */}
                        <p className="recent-title">Recent</p>  {/* Title for the recent prompts */}
                        {/* Map through the previousPrompt array to display each recent prompt */}
                        {previousPrompt.map((item, index) => (
                            <div
                                className="recent-entry"  // Styling class for individual recent prompt entry
                                key={index}  // Use index as key for list items (ideally should be unique id)
                                onClick={() => {onSent(item), loadPrompt(item)}}  // Trigger sending and loading of prompt on click
                            >
                                <img src={assets.message_icon} alt="message-icon" />  {/* Icon for recent prompt */}
                                <p>{item.slice(0,18)}...</p>  {/* Display the first 18 characters of the prompt */}
                            </div>
                        ))}
                    </div>
                ) : null} {/* Only show recent prompts if the sidebar is extended */}
            </div>

            {/* Bottom section of the sidebar with additional options */}
            <div className="bottom">
                {/* Help option in the bottom section */}
                <div className="bottom-item recent-entry">
                    <img src={assets.question_icon} alt="help-icon" className="mt-10" />  {/* Help icon */}
                    {extended ? <p>Help</p> : null}  {/* Only show "Help" label when extended */}
                </div>

                {/* History option in the bottom section */}
                <div className="bottom-item recent-entry">
                    <img src={assets.history_icon} alt="history-icon" />  {/* History icon */}
                    {extended ? <p>History</p> : null}  {/* Only show "History" label when extended */}
                </div>

                {/* Settings option in the bottom section */}
                <div className="bottom-item recent-entry">
                    <img src={assets.setting_icon} alt="settings-icon" />  {/* Settings icon */}
                    {extended ? <p>Settings</p> : null}  {/* Only show "Settings" label when extended */}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;  // Export the Sidebar component for use in other parts of the app
