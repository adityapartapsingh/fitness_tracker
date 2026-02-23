import React from 'react';

const CleanChatBubble = ({ apiResponse }) => {
  if (!apiResponse || !apiResponse.candidates) return null;
  const text = apiResponse.candidates[0].content.parts[0].text;
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
    whiteSpace: 'pre-wrap', 
    lineHeight: '1.6'
  }
};

export default CleanChatBubble;
