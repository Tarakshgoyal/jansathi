import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover civic services and information.</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Jansarthi</Text>
          <Text style={styles.text}>
            Jansarthi is a civic reporting platform for Uttarakhand citizens to report 
            and track issues related to public services like water, electricity, roads, 
            and waste management.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <Text style={styles.text}>
            1. Select a department service{'\n'}
            2. Create a report with details{'\n'}
            3. Track your report status{'\n'}
            4. View reports on the map
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          <Text style={styles.text}>
             Water Supply (Jal){'\n'}
             Electricity (Bijli){'\n'}
             Roads (Sadak){'\n'}
             Garbage Collection (Kachra)
          </Text>
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
});
