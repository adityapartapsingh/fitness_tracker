import React from 'react';

const CleanChatBubble = ({ apiResponse }) => {
  // 1. Safety Check: Don't crash if data is loading
  if (!apiResponse || !apiResponse.candidates) return null;

  // 2. Extract ONLY the text
  const text = apiResponse.candidates[0].content.parts[0].text;

  // 3. Render with 'pre-wrap' to fix the new lines
  return (
    <div style={styles.bubble}>
      {text}
    </div>
  );
};

const styles = {
  bubble: {
    backgroundColor: '#f4f4f4',
    padding: '20px',
    borderRadius: '10px',
    color: '#333',
    fontFamily: 'sans-serif',
    // ✅ THIS IS THE KEY PART
    // It turns "\n" into actual new lines
    whiteSpace: 'pre-wrap', 
    lineHeight: '1.6'
  }
};

export default CleanChatBubble;
