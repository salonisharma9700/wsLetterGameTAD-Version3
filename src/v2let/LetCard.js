import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './v2ws.css';

const LetCard = ({ words }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [letters, setLetters] = useState([]);
  const [answer, setAnswer] = useState('');
  const [randomLetters, setRandomLetters] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tries, setTries] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [flippedLetters, setFlippedLetters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const synth = window.speechSynthesis;

  const navigate = useNavigate();

  useEffect(() => {
    if (currentWordIndex < words.length) {
      fetchWords(words);
    }
  }, [currentWordIndex, words]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const currentTime = ((new Date() - startTime) / 1000).toFixed(2);
        setTimeTaken(currentTime);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeTaken(0);
    }
  }, [startTime]);

  useEffect(() => {
    if (letters.length > 0) {
      setTimeout(() => flipLetters(), 3000);
    }
  }, [letters]);

  const fetchWords = (sessionWords) => {
    const currentWord = sessionWords[currentWordIndex];
    const lettersArray = currentWord.split('');
    setLetters(lettersArray);
    setFlippedLetters(Array(lettersArray.length).fill(false));
    generateRandomLetters(lettersArray, currentWord);
  };

  const generateRandomLetters = (lettersArray, currentWord) => {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomChars = [...lettersArray];
    while (randomChars.length < 10) {
      const randomIndex = Math.floor(Math.random() * allLetters.length);
      const randomLetter = allLetters[randomIndex];
      if (!randomChars.includes(randomLetter)) {
        randomChars.push(randomLetter);
      }
    }
    randomChars.sort(() => Math.random() - 0.5);
    setRandomLetters(randomChars);
  };

  const pronounceWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    synth.speak(utterance);
  };

  const handleNextWord = () => {
    if (currentWordIndex + 1 < words.length) {
      setCurrentWordIndex((prevIndex) => prevIndex + 1);
    } else {
      setShowModal(true);
    }
    setAnswer('');
    setShowConfetti(false);
    setTries(0);
    setStartTime(null);
    setEndTime(null);
  };

  const handleLetterClick = (letter) => {
    setAnswer(answer + letter);
    pronounceWord(letter);
  };

  const handleChange = (event) => {
    setAnswer(event.target.value);
  };

  const checkAnswer = () => {
    const currentAnswer = answer.toLowerCase();
    const currentWord = words[currentWordIndex]?.toLowerCase();
    if (currentAnswer === currentWord) {
      setShowConfetti(true);
      pronounceWord('Great job');
    } else {
      pronounceWord('Oops, try again');
      setAnswer('');
    }
    setTries(tries + 1);
  };

  const handleCheckStart = () => {
    if (!startTime) {
      setStartTime(new Date());
      checkAnswer();
    } else {
      checkAnswer();
    }
  };

  const flipLetters = () => {
    letters.forEach((letter, index) => {
      setTimeout(() => {
        setFlippedLetters((prev) => {
          const newFlipped = [...prev];
          newFlipped[index] = true;
          return newFlipped;
        });
        setTimeout(() => {
          setFlippedLetters((prev) => {
            const newFlipped = [...prev];
            newFlipped[index] = false;
            return newFlipped;
          });
        }, 3000);
      }, index * 3000);
    });
    setTimeout(() => {
      setFlippedLetters(letters.map(() => false));
    }, letters.length * 3000 + 3000);
  };

  const handleModalClose = () => {
    setShowModal(false);
    sendTimeData();
    navigate('/');
  };

  const sendTimeData = async () => {
    try {
      if (startTime && endTime) {
        const timeData = {
          timeStarted: startTime,
          timeEnded: endTime,
          timeTaken: timeTaken,
          tries: tries,
          currentWord: words[currentWordIndex],
        };
        await axios.post('/api/save-time-data', timeData);
      }
    } catch (error) {
      console.error('Error sending time data to backend:', error);
    }
  };

  const handleEndGame = () => {
    setEndTime(new Date());
    sendTimeData();
    setShowModal(true);
  };

  return (
    <div className="wsb">
      <h1
        className="desc"
        style={{ marginTop: '1rem' }}
        onClick={() => pronounceWord('Look at the letters carefully. Match your letters to what you see')}
      >
        Look at the letters carefully. Match your letters to what you see
      </h1>
      <div className="word-cards shadow">
        {letters.map((letter, index) => (
          <div
            key={index}
            className={`letter ${flippedLetters[index] ? 'flipped' : ''}`}
            onClick={() => pronounceWord(letter)}
          >
            {flippedLetters[index] ? letter : ''}
          </div>
        ))}
      </div>
      <div className="InputContainer" style={{ marginBottom: '1rem' }}>
        <div className="input-wrapper">
          <input placeholder="Your answer" value={answer} onChange={handleChange} />
          <button className="ans-but" onClick={handleCheckStart}>
            Check
          </button>
          {showConfetti && (
            <button
              className="button-nw"
              onClick={handleNextWord}
              style={{ marginLeft: '1rem' }}
            >
              Next Word
            </button>
          )}
        </div>
      </div>
      <div
        className="random-cards shadow"
        style={{ display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}
      >
        {randomLetters.map((letter, index) => (
          <div
            key={index}
            className="letter"
            onClick={() => handleLetterClick(letter)}
            style={{ margin: '5px' }}
          >
            {letter}
          </div>
        ))}
      </div>
      {showConfetti && <Confetti />}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container">
            <div className="custom-modal-header">
              <span className="custom-modal-title">Thanks for Playing!</span>
              <button className="custom-modal-close" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <div className="custom-modal-body">
              Congratulations, you've completed all the words!
            </div>
            <div className="custom-modal-footer">
              <button className="custom-modal-button" onClick={handleModalClose}>
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetCard;
