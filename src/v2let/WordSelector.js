// import React, { useState } from 'react';
// import wordsData from './words.json';
// import LetCard from './LetCard';
// import './WordSelector.css'; // Import custom CSS

// const WordSelector = () => {
//   const [selectedWords, setSelectedWords] = useState([]);
//   const [isGameStarted, setIsGameStarted] = useState(false);

//   const allWords = wordsData.sessions.reduce((acc, session) => acc.concat(session.words), []);

//   const handleWordSelection = (word) => {
//     setSelectedWords((prevSelectedWords) =>
//       prevSelectedWords.includes(word)
//         ? prevSelectedWords.filter((w) => w !== word)
//         : [...prevSelectedWords, word]
//     );
//   };

//   const shuffleWords = (words) => {
//     const shuffledWords = [...words].sort(() => Math.random() - 0.5);
//     return shuffledWords;
//   };

//   const handleStartGame = () => {
//     const shuffledWords = shuffleWords(selectedWords);
//     setSelectedWords(shuffledWords);
//     setIsGameStarted(true);
//   };

//   if (isGameStarted) {
//     return <LetCard words={selectedWords} />;
//   }

//   return (
//     <div className="container mt-5">
//       <div className="row justify-content-center">
//         <div className="col-md-8">
//           <h2 className="text-center mb-4">Select Words for the Game</h2>
//           <div className="word-selector-container card p-4 rounded">
//             <div className="word-list mb-4 d-flex flex-wrap justify-content-center">
//             {/* <h2 className="text-center mb-4">Select Words for the Game</h2> */}
//               {allWords.map((word, index) => (
//                 <button
//                   key={index}
//                   className={`word-button ${selectedWords.includes(word) ? 'selected' : ''}`}
//                   onClick={() => handleWordSelection(word)}
//                 >
//                   {word}
//                 </button>
//               ))}
//             </div>
//             <button
//               className="start-game-btn"
//               onClick={handleStartGame}
//               disabled={selectedWords.length === 0}
//             >
//               Start Game 
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WordSelector;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LetCard from './LetCard';
import './WordSelector.css'; // Import custom CSS

const WordSelector = () => {
  const [sessions, setSessions] = useState([]); // Store sessions fetched from the API
  const [selectedWords, setSelectedWords] = useState([]); // Store words selected by the user
  const [isGameStarted, setIsGameStarted] = useState(false); // Track game start state

  // Fetch word sessions from local MongoDB via backend
  useEffect(() => {
    const fetchWordSessions = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/word-sessions');
        console.log('Fetched sessions:', response.data); // Debugging line to check fetched data

        if (response.data && response.data.length > 0) {
          setSessions(response.data[0].sessions); // Access sessions from the first item in the response
        } else {
          console.log('No sessions found');
        }
      } catch (error) {
        console.error('Error fetching word sessions:', error);
      }
    };

    fetchWordSessions();
  }, []);

  // Flatten all words from all sessions into one array
  const allWords = sessions.reduce((acc, session) => {
    if (session.words) {
      return acc.concat(session.words);
    }
    return acc;
  }, []);

  // Handle word selection for the game
  const handleWordSelection = (word) => {
    setSelectedWords((prevSelectedWords) =>
      prevSelectedWords.includes(word)
        ? prevSelectedWords.filter((w) => w !== word) // Deselect word if already selected
        : [...prevSelectedWords, word] // Select word
    );
  };

  // Shuffle selected words
  const shuffleWords = (words) => {
    return [...words].sort(() => Math.random() - 0.5); // Shuffle words randomly
  };

  // Handle starting the game
  const handleStartGame = () => {
    const shuffledWords = shuffleWords(selectedWords);
    setSelectedWords(shuffledWords); // Set shuffled words for the game
    setIsGameStarted(true); // Update game start state
  };

  // Render LetCard if the game has started
  if (isGameStarted) {
    return <LetCard words={selectedWords} />;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="text-center mb-4">Select Words for the Game</h2>
          <div className="word-selector-container card p-4 rounded">
            <div className="word-list mb-4 d-flex flex-wrap justify-content-center">
              {allWords.length > 0 ? (
                allWords.map((word, index) => (
                  <button
                    key={index}
                    className={`word-button ${selectedWords.includes(word) ? 'selected' : ''}`}
                    onClick={() => handleWordSelection(word)}
                  >
                    {word}
                  </button>
                ))
              ) : (
                <p>No words available. Please check the database.</p>
              )}
            </div>
            <button
              className="start-game-btn"
              onClick={handleStartGame}
              disabled={selectedWords.length === 0} // Disable button if no words are selected
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSelector;
