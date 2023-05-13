import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Button, Animated, Dimensions, Easing, StyleSheet } from 'react-native';
import styles from './Style';
import data from './data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const screenWidth = Dimensions.get('window').width;

const GameScreen = ({ route }) => {
  const navigation = useNavigation();
  const [grid, setGrid] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [validWords, setValidWords] = useState([]);
  const [usedLetters, setUsedLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(route?.params?.level || 1);
  const [scoreAnimation, setScoreAnimation] = useState(new Animated.Value(1));
  const [progress, setProgress] = useState(0);
  const [progressAnimation, setProgressAnimation] = useState(new Animated.Value(0));
  const [gridColors, setGridColors] = useState([]);
  const shakeAnimation = new Animated.Value(0);

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  }

  const [steps, setSteps] = useState([
    { percentage: 33, reached: false, animation: new Animated.Value(1) },
    { percentage: 66, reached: false, animation: new Animated.Value(1) },
    { percentage: 100, reached: false, animation: new Animated.Value(1) },
  ]);

  useEffect(() => {
    setSteps(steps.map(step => {
      return {
        ...step,
        reached: progress >= step.percentage,
      };
    }));
  }, [progress]);

  useEffect(() => {
    const newGrid = data[level - 1];
    setGrid(newGrid);
    const newGridColors = newGrid.map(row =>
      row.map(_ => getRandomColor())
    );
    setGridColors(newGridColors);
  }, [level]);  

  useEffect(() => {
    setGrid(data[level - 1]);
  }, [level]);

  useEffect(() => {
    setGrid(data[level - 1]);
    loadProgress(level);
  }, [level]);

  useEffect(() => {
    saveProgress();
  }, [score, validWords, usedLetters, currentWord]);

  useEffect(() => {
    steps.forEach((step, index) => {
      if (step.reached) {
        animateStep(index);
      }
    });
  }, [steps]);

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function animateStep(index) {
    Animated.sequence([
      Animated.timing(steps[index].animation, {
        toValue: 1.5,
        duration: 250,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(steps[index].animation, {
        toValue: 1,
        duration: 250,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();
  }

  const resetGame = () => {
    setCurrentWord('');
    setValidWords([]);
    setUsedLetters([]);
    setScore(0);
    setProgress(0);
  
    Animated.timing(progressAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  function animateScoreChange() {
    Animated.sequence([
      Animated.timing(scoreAnimation, {
        toValue: 1.5,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scoreAnimation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }

  const saveProgress = async () => {
    try {
      const progress = {
        level,
        score,
        validWords,
        usedLetters,
        currentWord,
      };
      await AsyncStorage.setItem(
        `gameProgress-${level}`,
        JSON.stringify(progress)
      );
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  const loadProgress = async (currentLevel) => {
    try {
      const progressJSON = await AsyncStorage.getItem(
        `gameProgress-${currentLevel}`
      );
      if (progressJSON) {
        const progress = JSON.parse(progressJSON);
        setScore(progress.score);
        setValidWords(progress.validWords);
        setUsedLetters(progress.usedLetters);
        setCurrentWord(progress.currentWord);
        const progressPercentage = (progress.score / 60) * 100;
        setProgress(progressPercentage);
        setProgressAnimation(new Animated.Value(progressPercentage));
      } else {
        resetGame();
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  };

  const redoLevel = () => {
    resetGame();
  };

  const renderRandomLetters = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letters = [];
    const coords = [
    [34, 90], [1, 45], [89, 27], [11, 90], [23, 71], [55, 99],
    [3, 34], [41, 88], [63, 19], [17, 79], [92, 64], [38, 22],
    [57, 43], [81, 76], [29, 59], [49, 94], [10, 10], [72, 85],
    [97, 14], [25, 66], [46, 92], [68, 35], [31, 77], [53, 21],
    [84, 62], [16, 86], [75, 51], [95, 38], [37, 28], [69, 50],
    [57, 83], [28, 42], [69, 15], [4, 56], [1, 97], [40, 4],
    [47, 72], [64, 10], [89, 38], [19, 67], [6, 51], [13, 4],
    [36, 79], [98, 25], [43, 61], [17, 94], [30, 48], [62, 86],
    [85, 21], [31, 52], [73, 14], [55, 39], [27, 65], [90, 90],
    [68, 87], [93, 32], [24, 74], [59, 46], [88, 77], [13, 70]]
  
    for (let i = 0; i < alphabet.length; i++) {
      const letter = alphabet[i];
      Y = coords[i][0];
      X = coords[i][1];

      letters.push(
        <View
          key={i}
          style={{
            position: "absolute",
            top: `${Y}%`,
            left: `${X}%`,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5, // This will create a circular box
            borderWidth: 0.5,
            opacity: 0.5,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: "black",
            }}
          >
            {letter}
          </Text>
        </View>
      );
    }
    return letters;
  };
  

  function goNextLevel() {
    if (level < data.length) {
      setLevel(level + 1);
    } else {
      //output nothing
    }
  }

  // go to previous level
  function goPrevLevel() {
    if (level > 1) {
      setLevel(level - 1);
    } else {
      //output nothing
    }
  }

  function goHome() {
    // go to select screen
    navigation.navigate("Start");
  }

  function onLetterPress(letter, rowIndex, colIndex) {
    setCurrentWord(currentWord + letter);
    setUsedLetters([...usedLetters, { rowIndex, colIndex }]);
    
    // Update color for the selected square
    const newGridColors = [...gridColors];
    newGridColors[rowIndex][colIndex] = getRandomColor();
    setGridColors(newGridColors);
  }

  function onDeleteLetter() {
    if (currentWord.length == 0) return;

    const lastLetterIndex = usedLetters.length - 1;
    const updatedUsedLetters = usedLetters.filter((_, index) => index !== lastLetterIndex);

    setCurrentWord(currentWord.slice(0, -1));
    setUsedLetters(updatedUsedLetters);
  }

  async function onEnterPress() {
    if (await isWordInDictionary(currentWord) && currentWord.length != 1) {
      setValidWords([...validWords, currentWord]);
      // SCORING log
      const newScore = score + Math.pow(1.1, currentWord.length) * currentWord.length / 1.2;
      
      setScore(newScore);
      animateScoreChange();
  
      // Update progress
      const progressPercentage = (newScore / 60) * 100; // 60 points = 100% progress
      setProgress(progressPercentage);
  
      Animated.timing(progressAnimation, {
        toValue: progressPercentage,
        duration: 500,
        useNativeDriver: false,
      }).start();
  
      setCurrentWord('');
    } else {
      shake();
    }
  }

  async function isWordInDictionary(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.title !== 'No Definitions Found';
  }

  function isLetterUsed(rowIndex, colIndex, usedLetters) {
    if (!usedLetters) return false;
    return usedLetters.some(
      (usedLetter) => usedLetter.rowIndex === rowIndex && usedLetter.colIndex === colIndex
    );
  }

  function isSelected(rowIndex, colIndex) {
    if (usedLetters.length === 0) return false;
    const lastUsedLetter = usedLetters[usedLetters.length - 1];
    return lastUsedLetter.rowIndex === rowIndex && lastUsedLetter.colIndex === colIndex;
  }
  
  return (
    <View style={styles.main_screen_text}>
      {renderRandomLetters()}
      <Animated.Text style={[styles.currentWord, { transform: [{ translateX: shakeAnimation }] }]}>
        {currentWord.toUpperCase()}
      </Animated.Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />

          {steps.map((step, index) => (
            <View
              key={index}
              style={[
                {
                  position: 'absolute',
                  left: `${step.percentage - 7}%`,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.step,
                  {
                    transform: [{ scale: step.animation }],
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Text style={{ 
                  fontSize: 15, 
                  color: 'white', 
                  textShadowColor: "#000000",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 4,
              }}>{"⭐"}</Text>
              </Animated.View>
            </View>
          ))}

        </View>
      </View>

      <View style={styles.gridContainer}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((letter, colIndex) => {
              const used = isLetterUsed(rowIndex, colIndex, usedLetters);
              const selected = isSelected(rowIndex, colIndex);
              const buttonColor = used || selected ? gridColors[rowIndex][colIndex] : '#FFFFFF';
              return (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.button(buttonColor),
                    used && styles.usedLetter,
                  ]}
                  onPress={() => !used && onLetterPress(letter, rowIndex, colIndex)}
                  disabled={used}
                >
                  <Text style={styles.buttonText('#000')}>{letter.toUpperCase()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
      
      <View style={styles.validWordsContainer}>
        {validWords.map((word, index) => (
          <Text key={index} style={styles.validWord}>
            {word.toUpperCase()}
          </Text>
        ))}
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={onDeleteLetter} style={styles.enterDeleteButtons}>
          <Text style={styles.enterDeleteButtonText}>Delete Letter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onEnterPress} style={styles.enterDeleteButtons}>
          <Text style={styles.enterDeleteButtonText}> Enter Word</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={goHome} style={styles.homeButton}>
        <Text style={styles.homeButtonText}>🏠</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={redoLevel} style={styles.resetButton}>
        <Text style={styles.resetButtonText}> ↻ </Text>
      </TouchableOpacity>
      <Text style={styles.levelText}>#{level}</Text>

      <TouchableOpacity onPress={goPrevLevel} style={styles.previousButton}>
        <Text style={styles.previousButtonText}> {'<'} </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goNextLevel} style={styles.nextButton}>
        <Text style={styles.nextButtonText}> {'>'} </Text>
      </TouchableOpacity>

    </View>
  );
};

export default GameScreen;