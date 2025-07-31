import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function AboutUs() {
  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/4gile.tech/');
  };

  const openTwitter = () => {
    Linking.openURL('https://x.com/4gileTech');
  };

  const openGmail = () => {
    Linking.openURL('mailto:agile.tech.64@gmail.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/images/splash.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.description}>
            To create smart, reliable tools that make everyday tasks easier for our people.
          </Text>
        </View>

        {/* Contact & Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Support</Text>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={24} color="#4A90E2" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Support Email</Text>
              <Text style={styles.contactDescription}>
                For help and feedback:{'\n'}
                <Text style={styles.emailText}>agile.tech.64@gmail.com</Text>
              </Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Ionicons name="bulb" size={24} color="#4A90E2" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Feature Requests</Text>
              <Text style={styles.contactDescription}>
                Mail us your suggestions for improvements
              </Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Ionicons name="bug" size={24} color="#4A90E2" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Bug Reports</Text>
              <Text style={styles.contactDescription}>
                Report issues and help us improve the app
              </Text>
            </View>
          </View>

          {/* Social Media Links */}
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Follow Us</Text>
            <View style={styles.socialLinks}>
              <TouchableOpacity style={styles.socialIcon} onPress={openInstagram}>
                <Ionicons name="logo-instagram" size={28} color="#E4405F" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon} onPress={openTwitter}>
                <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon} onPress={openGmail}>
                <Ionicons name="mail" size={28} color="#EA4335" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Key Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>

          <View style={styles.keyFeatureItem}>
            <Ionicons name="shield-checkmark" size={20} color="#5DADE2" />
            <Text style={styles.keyFeatureText}>Your Data Stays with You Only</Text>
          </View>
          <View style={styles.keyFeatureItem}>
            <Ionicons name="location-outline" size={20} color="#5DADE2" />
            <Text style={styles.keyFeatureText}>Automatic GPS tagging</Text>
          </View>

          <View style={styles.keyFeatureItem}>
            <Ionicons name="partly-sunny" size={20} color="#5DADE2" />
            <Text style={styles.keyFeatureText}>Weather integration</Text>
          </View>

          <View style={styles.keyFeatureItem}>
            <Ionicons name="search" size={20} color="#5DADE2" />
            <Text style={styles.keyFeatureText}>Smart search & filtering</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by Agile.Tech
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBF3FD",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
  },
  logoImage: {
    width: 350,
    height: 180
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  description: {
    fontSize: 16,
    color: "#2C3E50",
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  keyFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  keyFeatureText: {
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 12,
    fontWeight: "500",
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  footer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  // Contact & Support Styles
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  contactDescription: {
    fontSize: 14,
    color: "#2C3E50",
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  emailText: {
    fontSize: 14,
    color: "#5DADE2",
    fontWeight: "700",
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },

  // Social Media Styles
  socialSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(74, 144, 226, 0.2)",
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 }
  },
});
