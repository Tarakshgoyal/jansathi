import React from 'react';
import { Text, View, StyleSheet, ScrollView, Pressable } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Jansarthi</Text>
          <Text style={styles.subtitle}>
            Report and track civic issues in Uttarakhand
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Pressable style={styles.floatingButton}>
            <Text style={styles.floatingButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            <Pressable style={styles.gridItem}>
              <Text style={styles.emoji}>📋</Text>
              <Text style={styles.gridItemText}>My Reports</Text>
            </Pressable>
            <Pressable style={styles.gridItem}>
              <Text style={styles.emoji}>🗺️</Text>
              <Text style={styles.gridItemText}>View Map</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Services</Text>
          <View style={styles.grid}>
            {[
              { name: "Water", emoji: "💧" },
              { name: "Electricity", emoji: "⚡" },
              { name: "Road", emoji: "🛣️" },
              { name: "Garbage", emoji: "🗑️" },
            ].map((service, index) => (
              <Pressable key={index} style={styles.gridItem}>
                <Text style={styles.emoji}>{service.emoji}</Text>
                <Text style={styles.gridItemText}>{service.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  floatingButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  gridItemText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
});