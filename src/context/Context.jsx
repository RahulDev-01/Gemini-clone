import { createContext, useState } from "react";
import main from "../config/gemini"; // Import the API function for generating content

// Create a context to share state between components
export const Context = createContext();

const ContextProvider = (props) => {
    // Created 6 useState hooks for managing different states
    const [input, setInput] = useState(""); // Holds the current user input
    const [recentPrompt, setRecentPrompt] = useState(""); // Stores the most recent prompt sent
    const [previousPrompt, setPrevPrompts] = useState([]); // Keeps a history of previous prompts
    const [showResult, setShowResult] = useState(false); // Determines if the result section should be visible
    const [loading, setLoading] = useState(false); // Loading state, shows a loading spinner while waiting for the response
    const [resultData, setResultData] = useState(""); // Stores the result data (could be text or image)

    // Function that handles the logic for sending the prompt and receiving the result
    const onSent = async (prompt) => {
        // Reset the result data and set loading to true before sending the prompt
        setResultData(""); // Clear any previous result
        setLoading(true); // Set loading to true to show the loading indicator
        setShowResult(true); // Show the result area once a request is made
        setRecentPrompt(input); // Store the current input as the recent prompt

        // Call the main function (which sends the prompt to the API) and wait for the response
        const response = await main(input); // Call the main function with the user's input

        // Once the response is received, store it in the state
        setResultData(response); // Save the response in the resultData state
        setLoading(false); // Set loading to false once the request is completed
        setInput(""); // Clear the input field after submitting the prompt
    };

    // The context value that will be shared with all child components
    const contextValue = {
        previousPrompt, // Holds the previous prompt(s)
        setPrevPrompts, // Function to update the list of previous prompts
        onSent, // Function to send the prompt and get the response
        setRecentPrompt, // Function to update the recent prompt
        recentPrompt, // The most recent prompt
        showResult, // Boolean flag to show/hide the result section
        loading, // Loading state (used to show a spinner while waiting for a response)
        setLoading, // Function to set the loading state
        resultData, // The data received as a result (can be text or image)
        input, // The current value of the input field
        setInput, // Function to update the input value
    };

    return (
        // Provide the context value to the children components
        <Context.Provider value={contextValue}>
            {props.children} {/* Render the child components */}
        </Context.Provider>
    );
};

export default ContextProvider; // Export the ContextProvider to be used in the application
