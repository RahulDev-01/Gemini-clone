
# Gemini App 🚀

Gemini is a simple React-based application that interacts with users by generating responses based on user prompts. It includes features such as user-friendly prompts, result display, and the ability to submit prompts using either a "Send" button or the "Enter" key.
## App Link : https://gemini-clone-six-ruby.vercel.app/
## Features ✨

* **User-friendly Interface**: Greet users and suggest helpful prompt cards. 👋
* **Prompt Submission**: Users can type a prompt in the search box or click on predefined prompt cards. 💬
* **Responsive Design**: The app adjusts to various screen sizes. 📱
* **Result Display**: The app shows the results once the prompt is sent, including a loading state until the response is ready. ⏳
* **Enter Key Functionality**: The user can submit prompts by pressing the "Enter" key. ⌨️

## Installation 🛠️

To get started with the app, you'll need to clone the repository and install the required dependencies.

### Prerequisites 📦

Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/RahulDev-01/Gemini-clone.git
   cd Gemini-clone
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm start
   ```

   This will open the app in your default browser at [http://localhost:3000](http://localhost:3000).

## Usage 💡

### Main Features:

1. **Entering a Prompt**:

   * You can type a prompt in the input field at the bottom of the page.
   * Press "Enter" or click the send icon to submit the prompt. 🖱️

2. **Prompt Cards**:

   * The app suggests predefined prompts. You can choose one of the cards to automatically populate the input field with a suggested prompt. 🃏

3. **Result Display**:

   * After sending a prompt, the app will show the result (if available). A loading animation will display while waiting for the response. 🔄

4. **Navigation Bar**:

   * The top navigation bar includes the app name "Gemini" and a user icon. 💼

5. **Privacy Disclaimer**:

   * A footer at the bottom of the page informs users that the results may not be fully accurate and encourages double-checking. 🔍

### Key Component Functionality

* **Input Field**: The user can input a prompt and either press the "Enter" key or click the "Send" button to submit the prompt. ✏️
* **Send Button**: The send button triggers the `onSent()` function, which handles sending the prompt and generating the response. 📤
* **Results Section**: Once the response is received, it is displayed below the input field, along with a loading indicator while waiting for the data. 📊

## Live Demo 🌐

You can try the app live here: [Gemini App Live Demo](https://gemini-clone-six-ruby.vercel.app/)

## Development 💻

If you'd like to contribute to the project or make modifications, here are the steps to get started.

### Setting Up for Development

1. Fork the repository and clone it to your local machine.

2. Install the required dependencies by running:

   ```bash
   npm install
   ```

3. Make changes and commit them to your forked repository.

4. Run the development server to see your changes:

   ```bash
   npm start
   ```

5. If you have added any new features or fixed bugs, consider writing tests or documenting your code where appropriate.

### Code Structure 🗂️

* `src/`:

  * `components/`: Contains the main UI components such as the `Main` component.
  * `assets/`: Stores image assets like icons and user images.
  * `context/`: Contains shared state logic using React's Context API.
  * `App.js`: The main entry point for the app.
  * `main.css`: Custom CSS styling for the app.

### Linting and Formatting 🎨

The project uses ESLint and Prettier to ensure clean and consistent code. To lint or format your code:

1. **Run the linter**:

   ```bash
   npm run lint
   ```

2. **Fix issues automatically**:

   ```bash
   npm run lint:fix
   ```

## Contributing 🤝

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to your branch (`git push origin feature/your-feature`).
6. Open a pull request.

We welcome contributions of all kinds! 💡

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


