import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ChallengeDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        api.get(`/challenges/${id}`)
        .then(res => setChallenge(res.data.data || res.data))
        .catch(err => Alert.alert("Error", "Failed to load challenge details."))
        .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size={"large"} />;
    if (!challenge) return <Text style={{ textAlign: "center", marginTop: 40 }}>Challenge not found</Text>;

    const isAdmin = challenge.admin_id === challenge.current_user_id;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{challenge.name}</Text>
            <Text style={styles.desc}>{challenge.description}</Text>
            <Text style={styles.date}>De {challenge.start_date} até {challenge.end_date}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tarefas</Text>
                <FlatList
                    data={challenge.tasks}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.taskCard}>
                            <Text style={styles.taskName}>{item.name}</Text>
                            {item.description && <Text style={styles.taskDesc}>{item.description}</Text>}
                            <Text style={styles.taskInfo}>
                                Pontos: {item.points_weekday} (semana) / {item.points_weekend} (fim de semana) 
                            </Text>
                            <TouchableOpacity style={styles.completeBtn} onPress={() => router.push({
                                pathname: "/complete-task",
                                params: { challengeId: challenge.id, taskId: item.id, task: JSON.stringify(item) }
                            })}>
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>Completar Tarefa</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{ color: "#888" }}>Nenhuma tarefa cadastrada</Text>}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Participantes</Text>
                <FlatList
                    data={challenge.participants}
                    keyExtractor={item => item.user.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.participantCard}>
                            <Ionicons name="person-circle-outline" size={24} color="#555" />
                            <Text style={styles.participantName}>{item.name}</Text>
                            {/* Aqui pode mostrar pontuação, status, etc. */}
                        </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {isAdmin && (
                <View style={{ marginTop: 24 }}>
                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() => Alert.alert("Futuro!", "Aqui vai o editar desafio.")}
                    >
                        <Text style={styles.adminButtonText}>Editar Desafio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.adminButton, { backgroundColor: "#eee", marginTop: 8 }]}
                        onPress={() => Alert.alert("Participar como usuário", "Aqui vai a visão participante!")}
                    >
                        <Text style={[styles.adminButtonText, { color: "#228b22" }]}>Ver como Participante</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
    },
    desc: {
        color: "#444",
        marginBottom: 4,
    },
    date: {
        color: "#888",
        marginBottom: 16,
    },
    section: {
        marginTop: 16,
    },
    sectionTitle: {
        fontWeight: "bold",
        marginBottom: 8,
    },
    taskCard: {
        backgroundColor: "#f7f7f7",
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    taskName: {
        fontWeight: "bold",
    },
    taskDesc: {
        color: "#555",
    },
    taskInfo: {
        color: "#999", 
        fontSize: 12,
    },
    participantCard: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 16,
    },
    participantName: {
        marginLeft: 8,
        fontWeight: "500",
    },
    adminButton: {
        backgroundColor: "#228b22",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    adminButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    completeBtn: {
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 8,
    },
});