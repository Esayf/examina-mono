import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Renk paletini marka renklerine göre güncelleyelim
const colors = {
  primary: "#2a0926", // Marka primary rengi
  secondary: "#ffdbc4", // Marka secondary rengi
  accent: "#6c0426", // Kontrast renk
  light: "#f8e9e1", // Açık ton
  dark: "#1a031a", // Koyu ton
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: colors.secondary, // Secondary renk arka plan
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    color: colors.primary, // Primary renk başlık
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: colors.light, // Açık tonlu section arkaplan
    borderRadius: 12,
    border: `2px solid ${colors.primary}`,
  },
  label: {
    fontSize: 12,
    color: colors.accent, // Kontrast renk etiketler
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "black",
  },
  value: {
    fontSize: 14,
    color: colors.dark, // Koyu renk değerler
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 30,
    gap: 16,
  },
  gridItem: {
    borderLeft: `4px solid ${colors.primary}`,
    width: "48%",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light, // Açık ton grid itemlar
    borderRadius: 16,
    border: `2px solid ${colors.primary}`,
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
});

// Helper function to format duration in English
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${
      remainingMinutes > 0 ? `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}` : ""
    }`;
  }
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
};

interface ExamSummaryPDFProps {
  data: {
    title: string;
    description: string;
    creator: string;
    startDate: Date;
    duration: number;
    questionCount: number;
    passingScore: number;
    participantCount: number;
    status: string;
    averageScore: number;
  };
}

export const ExamSummaryPDF = ({ data }: ExamSummaryPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{data.title}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{data.description}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Created By</Text>
          <Text style={styles.value}>{data.creator}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.label}>Start Date</Text>
          <Text style={styles.value}>{data.startDate.toLocaleDateString("en-US")}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{formatDuration(data.duration)}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.label}>Number of Questions</Text>
          <Text style={styles.value}>{data.questionCount}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.label}>Passing Score</Text>
          <Text style={styles.value}>{data.passingScore}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.label}>Number of Participants</Text>
          <Text style={styles.value}>{data.participantCount}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{data.status}</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.label}>Average Score</Text>
          <Text style={styles.value}>{data.averageScore.toFixed(1)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
