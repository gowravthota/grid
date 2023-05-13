import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./Style";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const generateRandomLetter = () => {
  const charCode = Math.floor(Math.random() * 26) + 65;
  return String.fromCharCode(charCode);
};

const generateLetterGrid = (rows, cols) => {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(generateRandomLetter());
    }
    grid.push(row);
  }
  return grid;
};

const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const shouldApplyRandomColor = (probability) => {
  return Math.random() < probability;
};

const LetterGrid = ({ rows, cols, colorProbability }) => {
  const grid = generateLetterGrid(rows, cols);
  return (
    <View style={styles.gridContainer}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {row.map((letter, colIndex) => {
            const applyColor = shouldApplyRandomColor(colorProbability);
            return (
              <View
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.gridLetterContainer,
                  applyColor ? { backgroundColor: randomColor() } : {},
                ]}
              >
                <Text style={styles.gridLetter}>{letter}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const StartScreen = () => {
  const navigation = useNavigation();

  const loadCurrentLevel = async () => {
    try {
      const currentLevel = await AsyncStorage.getItem('currentLevel');
      if (currentLevel) {
        navigation.navigate('Game', { level: parseInt(currentLevel, 10) });
      } else {
        navigation.navigate('Game');
      }
    } catch (error) {
      console.error('Failed to load current level:', error);
    }
  };

  return (
    
    <View style={styles.startcontainer}>

      <LetterGrid rows={40} cols={40} colorProbability={0.4}/>
      <Text style={styles.title}>Letter Grid</Text>
      <View style={styles.buttonContainer}>

        <TouchableOpacity
          style={styles.customButton}
          onPress={loadCurrentLevel} // Corrected here
        >
          <Text style={styles.customButtonText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.customButton}
          onPress={() => {
            navigation.navigate("Select");
          }}
        >
          <Text style={styles.customButtonText}>Select</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default StartScreen;
