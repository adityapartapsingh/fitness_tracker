import React from 'react';
import ReactMarkdown from 'react-markdown';

const WorkoutDisplay = ({ apiData }) => {
  // 1. SAFETY CHECK: If data is missing or loading, don't crash.
  if (!apiData || !apiData.candidates) {
    return <div className="loading">Generating your plan...</div>;
  }

  // 2. EXTRACTION: Get the specific text string
  const cleanText = apiData.candidates[0].content.parts[0].text;

  // 3. RENDER: Display it nicely
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>💪 Your AI Workout Plan</h3>
      </div>
      <div style={styles.content}>
        {/* ReactMarkdown converts the symbols into real HTML lists and bold text */}
        <ReactMarkdown components={markdownStyles}>
          {cleanText}
        </ReactMarkdown>
      </div>
    </div>
  );
};

// --- Professional Styles ---
const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)', // Soft shadow
    maxWidth: '650px',
    margin: '20px auto',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
  },
  header: {
    backgroundColor: '#007bff', // Professional Blue
    color: 'white',
    padding: '15px 25px',
    borderBottom: '1px solid #eee',
  },
  content: {
    padding: '25px',
    color: '#333',
    lineHeight: '1.7', // Makes it easy to read
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
};

// Custom styles for the markdown elements
const markdownStyles = {
  // Makes the "Warm-up", "Workout" headers bold and blue
  strong: ({node, ...props}) => <span style={{color: '#0056b3', fontWeight: 'bold'}} {...props} />,
  // Adds nice spacing to bullet points
  li: ({node, ...props}) => <li style={{marginBottom: '8px', paddingLeft: '5px'}} {...props} />,
};

export default WorkoutDisplay;
