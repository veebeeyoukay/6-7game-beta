import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Alert, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

export default function CreateBattle() {
    const { session } = useAuth();
    const router = useRouter();
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    // Battle Config
    const [questionsCount, setQuestionsCount] = useState(5);
    const [timePerQuestion, setTimePerQuestion] = useState(30);
    const [subject, setSubject] = useState('Math');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    async function fetchChildren() {
        try {
            const { data: family } = await supabase
                .from('families')
                .select('id')
                .eq('created_by', session?.user.id)
                .single();

            if (family) {
                const { data: kids } = await supabase
                    .from('children')
                    .select('*')
                    .eq('family_id', family.id)
                    .eq('is_paired', true); // Only show paired children

                setChildren(kids || []);
            }
        } catch (error) {
            console.log('Error fetching children', error);
        }
    }

    async function handleStartBattle() {
        if (!selectedChildId) {
            Alert.alert('Select a child to battle!');
            return;
        }
        setLoading(true);

        try {
            // 1. Create Battle Record
            // 2. Call generate-battle edge function (simulated here for MVP)

            // For MVP, valid opponents are Child vs Parent (User)
            // We will call the edge function `generate-battle` 

            const { data, error } = await supabase.functions.invoke('generate-battle', {
                body: {
                    challenger_type: 'parent',
                    challenger_id: session?.user.id, // Parent ID
                    opponent_type: 'child',
                    opponent_id: selectedChildId,
                    questions_count: questionsCount,
                    time_per_question: timePerQuestion,
                    subject: subject
                }
            });

            if (error) throw error;

            Alert.alert('Battle Created!', 'Waiting for child to accept...', [
                { text: 'Go to Dashboard', onPress: () => router.push('/dashboard') }
            ]);

        } catch (error: any) {
            Alert.alert('Error starting battle', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>New Battle</Text>

            <Text style={styles.sectionTitle}>Select Opponent</Text>
            <View style={styles.childrenList}>
                {children.length === 0 ? <Text style={styles.infoText}>No paired children available.</Text> :
                    children.map(child => (
                        <TouchableOpacity
                            key={child.id}
                            style={[styles.childOption, selectedChildId === child.id && styles.selectedChild]}
                            onPress={() => setSelectedChildId(child.id)}
                        >
                            <Text style={styles.childName}>{child.first_name}</Text>
                        </TouchableOpacity>
                    ))
                }
            </View>

            <Text style={styles.sectionTitle}>Configuration</Text>

            <View style={styles.optionRow}>
                <Text style={styles.label}>Questions: {questionsCount}</Text>
                <View style={styles.row}>
                    {[5, 10, 15].map(n => (
                        <Button key={n} title={n.toString()} onPress={() => setQuestionsCount(n)} color={questionsCount === n ? "#4A90E2" : "#666"} />
                    ))}
                </View>
            </View>

            <View style={styles.optionRow}>
                <Text style={styles.label}>Time/Q: {timePerQuestion}s</Text>
                <View style={styles.row}>
                    {[15, 30, 60].map(n => (
                        <Button key={n} title={n.toString()} onPress={() => setTimePerQuestion(n)} color={timePerQuestion === n ? "#4A90E2" : "#666"} />
                    ))}
                </View>
            </View>

            <View style={styles.optionRow}>
                <Text style={styles.label}>Subject: {subject}</Text>
                <View style={styles.row}>
                    {['Math', 'ELA', 'All'].map(s => (
                        <Button key={s} title={s} onPress={() => setSubject(s)} color={subject === s ? "#4A90E2" : "#666"} />
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    title={loading ? "Generating..." : "Start Battle! ⚔️"}
                    onPress={handleStartBattle}
                    color="#FF4500"
                    disabled={loading || !selectedChildId}
                />
                <View style={{ marginTop: 10 }}>
                    <Button title="Cancel" onPress={() => router.back()} color="#666" />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#1A1A1A',
        flexGrow: 1,
        paddingTop: 40,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        color: '#AAA',
        marginTop: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoText: {
        color: '#666',
        fontStyle: 'italic',
    },
    childrenList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    childOption: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 10,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedChild: {
        borderColor: '#4A90E2',
        backgroundColor: '#2A4055',
    },
    childName: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    optionRow: {
        marginBottom: 20,
        backgroundColor: '#222',
        padding: 15,
        borderRadius: 10,
    },
    label: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    footer: {
        marginTop: 40,
    }
});
