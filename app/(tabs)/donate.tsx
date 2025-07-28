import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AMOUNTS = [10, 20, 50, 100, 200, 500];

export default function Donate() {
  const [selected, setSelected] = useState<number | null>(null);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contribute</Text>
      </View>

      {/* Heart Icon */}
      <View style={styles.heartContainer}>
        <Ionicons name="heart" size={64} color="#FF6B81" style={styles.heartIcon} />
      </View>

      {/* Title & Description */}
      <Text style={styles.title}>We Love You!</Text>
      <Text style={styles.description}>
        We run 100% on your contributions and support. If you enjoy our services,
      </Text>
      <Text style={styles.description}>
        Please consider supporting us.
      </Text>

      {/* Amount Selection */}
      <View style={styles.amountGrid}>
        {AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={[
              styles.amountButton,
              selected === amt && styles.amountButtonSelected,
            ]}
            onPress={() => setSelected(amt)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.amountText,
              selected === amt && styles.amountTextSelected,
            ]}>
              ₹{amt.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Donate Button */}
      <TouchableOpacity
        style={[
          styles.donateButton,
          !selected && styles.donateButtonDisabled,
        ]}
        disabled={!selected}
        onPress={() => {
          // Implement donation logic here (e.g., Google Play Billing)
        }}
        activeOpacity={selected ? 0.8 : 1}
      >
        <Text style={styles.donateButtonText}>
          {selected ? `Donate ₹${selected.toFixed(2)}` : "Select Amount"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    alignItems: "center",
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  heartContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  heartIcon: {
    shadowColor: "#FF6B81",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 4,
    paddingHorizontal: 24,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 32,
    gap: 12,
  },
  amountButton: {
    backgroundColor: "#232323",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    margin: 6,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#232323",
  },
  amountButtonSelected: {
    borderColor: "#FF6B81",
    backgroundColor: "#2c2c2c",
  },
  amountText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  amountTextSelected: {
    color: "#FF6B81",
  },
  donateButton: {
    backgroundColor: "#FF6B81",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: Dimensions.get("window").width - 48,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    elevation: 3,
  },
  donateButtonDisabled: {
    backgroundColor: "#444",
  },
  donateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
