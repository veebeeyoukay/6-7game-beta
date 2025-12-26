import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BattlesScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Battles</Text>
                <Text style={styles.subtitle}>Coming in Phase 2D</Text>
                <View style={styles.placeholder}>
                    <Text style={styles.emoji}>⚔️</Text>
                    <Text style={styles.placeholderText}>Challenge your kids or validate their real-world tasks.</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 16,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    placeholderText: {
        color: '#A0A0A0',
        textAlign: 'center',
        fontSize: 16,
    },
});
