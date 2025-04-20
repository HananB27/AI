# AI Task Duration Prediction

This project aims to predict task durations using AI models, providing a user-friendly interface for input and visualization. It combines a web-based frontend with a Python backend to deliver accurate predictions based on various task parameters.

## Repository Structure

```
AI/
├── .bolt/                     # Configuration files
├── Model/                     # Contains trained AI models
├── src/                       # Source code for frontend and backend
├── index.html                 # Main HTML file for the web interface
├── package.json               # Node.js project metadata
├── vite.config.ts             # Vite configuration for frontend bundling
├── start.bat                  # Batch file to start the application
├── tsconfig*.json             # TypeScript configuration files
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── eslint.config.js           # ESLint configuration
└── .gitignore                 # Specifies intentionally untracked files
```

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- Python 3.11+ with necessary packages

### Installation

1. Clone the repository:

```bash
git clone https://github.com/HananB27/AI.git
cd AI
```

2. Install Node.js dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Install Python dependencies:

```bash
pip install -r requirements.txt
```

## Backend Integration

1. Launch the application:

```bash
npm run dev
```

or run the `start.bat` file.

2. Access the web interface:

Open your browser and navigate to `http://localhost:3000` (or the port specified in your configuration).

3. Input task details:

Fill in the required task parameters in the web form.

4. Obtain predictions:

Submit the form to receive the predicted task duration.

## Usage

The AI model is served via a Flask backend in `api_server.py`. The web interface sends requests to this API to receive task duration predictions.

### Example Request Flow:
- User fills task data on the web interface
- The data is sent to the Flask backend via `api_server.py`
- The model processes the data and returns the predicted duration


Model training and experimentation are handled in the [AiTaskOnly](https://github.com/hasagi33/AiTaskOnly) subrepository. This includes training multiple models across various dataset sizes and batch configurations.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## Requirements

To run the backend services and model logic, install the following packages:

```
numpy
matplotlib
tqdm
pandas
```

These are shared with the [AiTaskOnly](https://github.com/hasagi33/AiTaskOnly) subrepository.
    
## License

This project is licensed under the MIT License.

## Author

Developed and maintained by [@HananB27](https://github.com/HananB27) and [@hasagi33](https://github/hasagi33)
