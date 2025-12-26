import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

export default function CalendarScreen() {
    const { session } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [markedDates, setMarkedDates] = useState<any>({});

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [eventType, setEventType] = useState('other'); // battle, chore, other

    useEffect(() => {
        if (session) fetchEvents();
    }, [session]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get Family ID
            const { data: family } = await supabase.from('families').select('id').eq('created_by', user.id).single();
            if (!family) return;

            // Get Events
            const { data: eventsData, error } = await supabase
                .from('family_events')
                .select('*')
                .eq('family_id', family.id);

            if (error) throw error;

            setEvents(eventsData || []);

            // Mark dates
            const markings: any = {};
            eventsData?.forEach(event => {
                const date = new Date(event.start_time).toISOString().split('T')[0];
                markings[date] = { marked: true, dotColor: '#4A90E2' };
            });
            setMarkedDates(markings);

        } catch (error: any) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
    };

    const addEvent = async () => {
        if (!newEventTitle) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: family } = await supabase.from('families').select('id').eq('created_by', user?.id).single();

            if (!family) return;

            const { error } = await supabase.from('family_events').insert({
                family_id: family.id,
                title: newEventTitle,
                event_type: eventType,
                start_time: new Date(selectedDate).toISOString(),
                end_time: new Date(selectedDate).toISOString(), // duration logic later
                participants: [] // logic later
            });

            if (error) throw error;

            setModalVisible(false);
            setNewEventTitle('');
            fetchEvents();
            Alert.alert('Success', 'Event added!');

        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const getEventsForSelectedDate = () => {
        return events.filter(e => {
            const eventDate = new Date(e.start_time).toISOString().split('T')[0];
            return eventDate === selectedDate;
        });
    };

    const renderEventItem = ({ item }: { item: any }) => (
        <View style={styles.eventCard}>
            <View style={styles.eventTime}>
                <Text style={styles.timeText}>
                    {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventType}>{item.event_type.toUpperCase()}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Family Calendar</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <Calendar
                theme={{
                    calendarBackground: '#1A1A1A',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: '#4A90E2',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#4A90E2',
                    dayTextColor: '#d9e1e8',
                    textDisabledColor: '#2d4150',
                    dotColor: '#4A90E2',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#4A90E2',
                    monthTextColor: '#FFF',
                }}
                onDayPress={handleDayPress}
                markedDates={{
                    ...markedDates,
                    [selectedDate]: { ...markedDates[selectedDate], selected: true, disableTouchEvent: true }
                }}
            />

            <View style={styles.listContainer}>
                <Text style={styles.dateTitle}>
                    {new Date(selectedDate).toDateString()}
                </Text>
                {loading ? <ActivityIndicator color="#4A90E2" /> : (
                    <FlatList
                        data={getEventsForSelectedDate()}
                        renderItem={renderEventItem}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={<Text style={styles.emptyText}>No events for this day.</Text>}
                    />
                )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Event</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Event Title"
                            placeholderTextColor="#666"
                            value={newEventTitle}
                            onChangeText={setNewEventTitle}
                        />

                        <View style={styles.typeContainer}>
                            {['battle', 'chore', 'other'].map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeChip, eventType === type && styles.typeChipSelected]}
                                    onPress={() => setEventType(type)}
                                >
                                    <Text style={[styles.typeText, eventType === type && styles.typeTextSelected]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={addEvent} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save Event</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: -2,
    },
    listContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1A1A1A',
    },
    dateTitle: {
        color: '#A0A0A0',
        marginBottom: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        color: '#666',
        fontStyle: 'italic',
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
    },
    eventTime: {
        marginRight: 16,
        justifyContent: 'center',
    },
    timeText: {
        color: '#4A90E2',
        fontWeight: 'bold',
    },
    eventContent: {
        flex: 1,
        justifyContent: 'center',
    },
    eventTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    eventType: {
        color: '#888',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#2A2A2A',
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#333',
        color: '#FFF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#444',
    },
    typeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    typeChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#444',
    },
    typeChipSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    typeText: {
        color: '#888',
        fontSize: 12,
    },
    typeTextSelected: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#333',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFF',
    },
    saveButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#27AE60',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
