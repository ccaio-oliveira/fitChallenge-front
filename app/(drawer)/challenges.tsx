import api from "@/services/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Challenge {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    admin_id: number;
    user_id: number;
}

export default function ChallengesScreen() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        api.get("/challenges")
        .then(res => setChallenges(res.data.data || []))
        .catch(err => console.log(err))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <ActivityIndicator size={"large"} style={{ marginTop: 50 }} />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meus Desafios</Text>
            <FlatList
                data={challenges}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }: { item: Challenge }) => (
                    <TouchableOpacity
                        style={styles.challengeCard}
                        onPress={() => router.push({ pathname: "/challenge-detail", params: { id: item.id } })}
                    >
                        <Text style={styles.challengeName}>{item.name}</Text>
                        <Text style={styles.challengeDesc}>{item.description}</Text>
                        <Text style={styles.challengeDate}>
                            {item.start_date} até {item.end_date}
                        </Text>
                        <Text style={styles.challengeAdmin}>
                            {item.admin_id === item.user_id ? "Admin" : "Participante"}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Nenhum desafio encontrado.</Text>}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    challengeCard: {
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    challengeName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    challengeDesc: {
        color: "#444",
        marginBottom: 6,
    },
    challengeDate: {
        color: "#888",
        fontSize: 13,
    },
    challengeAdmin: {
        marginTop: 8,
        color: "#1e90ff",
        fontWeight: "bold",
    },
    empty: {
        color: "#888",
        textAlign: "center",
        marginTop: 60,
    },
});