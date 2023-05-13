import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import styles from "./Style";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SelectScreen = () => {
  const navigation = useNavigation();
  const levels = 100;
  const rows = 4;
  const [levelScores, setLevelScores] = useState({});

  useEffect(() => {
    loadLevelScores();
  }, []);

  const saveCurrentLevel = async (level) => {
    try {
      await AsyncStorage.setItem('currentLevel', level.toString());
    } catch (error) {
      console.error('Failed to save current level:', error);
    }
  };

  const loadLevelScores = async () => {
    const scores = {};
    for (let i = 1; i <= levels; i++) {
      const progressJSON = await AsyncStorage.getItem(`gameProgress-${i}`);
      if (progressJSON) {
        const progress = JSON.parse(progressJSON);
        scores[i] = progress.score;
      } else {
        scores[i] = 0;
      }
    }
    setLevelScores(scores);
  };

  // Change how stars are awarded based on score
  const renderStars = (level) => {
    const score = levelScores[level] || 0;
    let stars = 0;
    if (score >= 60) stars = 3;
    else if (score >= 39) stars = 2;
    else if (score >= 19) stars = 1;

    const filledStars = "⭐".repeat(stars);
    const emptyStars = "✩".repeat(3 - stars);
    const starsRow = filledStars + emptyStars;
    return (
      <View style={styles.starContainer}>
        <Text style={styles.starRating}>{starsRow}</Text>
      </View>
    );
  };


  const renderLevelBoxes = () => {
    let levelBoxes = [];
    for (let i = 1; i <= levels; i++) {
      levelBoxes.push(
        <TouchableOpacity
          key={i}
          style={styles.levelBox}
          onPress={() => {
            saveCurrentLevel(i);
            navigation.navigate('Game', { level: i });
          }}
        >
          <Text style={styles.levelNumber}>{i}</Text>
          {renderStars(i)}
        </TouchableOpacity>
      );
    }
    return levelBoxes;
  };

  const renderLevelRows = () => {
    const levelBoxes = renderLevelBoxes();
    let levelRows = [];
    for (let i = 0; i < levelBoxes.length; i += rows) {
      const levelRow = levelBoxes.slice(i, i + rows);
      levelRows.push(
        <View key={i} style={styles.levelRow}>
          {levelRow}
        </View>
      );
    }
    return levelRows;
  };

  const renderRandomStars = () => {
    const starCount = 100;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomSize = Math.floor(Math.random() * 10) + 10;
      stars.push(
        <Text
          key={i}
          style={{
            position: "absolute",
            top: `${randomY}%`,
            left: `${randomX}%`,
            fontSize: randomSize,
            color: "black",
            opacity: 0.5,
          }}
        >
          ★
        </Text>
      );
    }
    return stars;
  };

  return (
    <View style={styles.selectcontainer}>
      {renderRandomStars()}
      <ScrollView contentContainerStyle={styles.selectButtonContainer}>
        {renderLevelRows()}
      </ScrollView>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Start")}
      >
        <Text style={styles.backButtonText}>Menu 🏠</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectScreen;
