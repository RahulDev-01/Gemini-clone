import { createContext, useState } from "react";  // Import necessary hooks and functions from React
import main from "../config/gemini"; // Import the API function for generating content (AI model)

// Create a context to share state between components
export const Context = createContext();  // This will allow sharing state globally across components

// ContextProvider component to manage the shared state and API interactions
const ContextProvider = (props) => {
    // useState hooks to manage various pieces of state in the app
    const [input, setInput] = useState(""); // Holds the current user input for prompts
    const [recentPrompt, setRecentPrompt] = useState(""); // Stores the most recent prompt sent
    const [previousPrompt, setPrevPrompts] = useState([]); // Keeps a history of previous prompts
    const [showResult, setShowResult] = useState(false); // Controls whether the result section is visible
    const [loading, setLoading] = useState(false); // Indicates whether the app is in a loading state (waiting for API response)
    const [resultData, setResultData] = useState(""); // Stores the result data (could be text or image)
  
    // Function to add a delay in displaying text by appending one word at a time (used for animated text effect)
    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData(prev => prev + nextWord);  // Append the next word to the existing resultData after a delay
        }, 75 * index);  // Delay increases for each word
    };

    // Function to reset the chat for a new conversation (clears loading state and hides result section)
    const newChat = () => {
        setLoading(false);  // Reset loading state
        setShowResult(false);  // Hide result section
    };

    // Function that handles the logic for sending the prompt to the API and receiving the result
    const onSent = async (prompt) => {
        setResultData("");  // Clear any previous result
        setLoading(true);  // Set loading state to true (show spinner)
        setShowResult(true);  // Show the result area (once the request is made)
        
        let response;
        if (prompt !== undefined) {
            // If the prompt is provided directly, use it
            response = await main(prompt);  // Call the main function (API request)
            setRecentPrompt(prompt);  // Set the recent prompt
        } else {
            // If the prompt is undefined, use the input state (user input)
            setPrevPrompts(prev => [...prev, input]);  // Save the input to previous prompts list
            setRecentPrompt(input);  // Set the recent prompt
            response = await main(input);  // Call the API with the user's input
        }

        try {
            // Ensure we are getting a valid response (must be a string)
            if (!response || typeof response !== 'string') {
                throw new Error("Invalid response format");
            }

            let responseArray = response.split("**");  // Split response by "**" to identify bold text segments
            let newResponse = "";  // Initialize newResponse as an empty string

            // Process the response array and format the text
            for (let i = 0; i < responseArray.length; i++) {
                if (i === 0 || i % 2 !== 1) {
                    // Regular text (not bolded)
                    newResponse += responseArray[i];
                } else {
                    // Bolded text (wrap with <b> tags)
                    newResponse += "<b>" + responseArray[i] + "</b>";
                }
            }

            // Replace any '*' characters in the response with <br> for line breaks
            newResponse = newResponse.replace(/\*/g, "<br>");

            // Split the response into words and use delayPara to append each word with a delay
            let newResponseArray = newResponse.split(" ");
            for (let i = 0; i < newResponseArray.length; i++) {
                const nextWord = newResponseArray[i];
                delayPara(i, nextWord + " ");  // Call delayPara to append each word with a delay
            }

        } catch (error) {
            // Catch any errors during the processing and set an error message in the result
            console.error("Error processing the response:", error);
            setResultData("An error occurred. Please try again later.");  // Show error message
        } finally {
            // After the request is completed, reset loading state and input field
            setLoading(false);  // Set loading to false (hide loading spinner)
            setInput("");  // Clear the input field
        }
    };

    // The context value to be shared with child components
    const contextValue = {
        previousPrompt,  // Holds the previous prompt(s) the user has inputted
        setPrevPrompts,  // Function to update the previous prompts list
        onSent,  // Function to send the prompt and get the result
        setRecentPrompt,  // Function to update the most recent prompt
        recentPrompt,  // The most recent prompt sent by the user
        showResult,  // Boolean flag to control visibility of the result section
        loading,  // Loading state to show or hide a loading spinner
        setLoading,  // Function to set the loading state
        resultData,  // The result data (either text or image) received from the API
        input,  // The current value of the input field
        setInput,  // Function to update the input value
        newChat,  // Function to reset the chat for a new conversation
    };

    return (
        // Provide the context value to the children components
        <Context.Provider value={contextValue}>
            {props.children}  {/* Render child components */}
        </Context.Provider>
    );
};

export default ContextProvider;  // Export ContextProvider to be used in other parts of the application
