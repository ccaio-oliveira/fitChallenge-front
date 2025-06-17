import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ChallengeCreateScreen() {
    const { user } = useAuth();
    const router = useRouter();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [tasks, setTasks] = useState<any[]>([]);
    const [taskName, setTaskName] = useState("");
    const [taskPointsWeekday, setTaskPointsWeekday] = useState("");
    const [taskPointsWeekend, setTaskPointsWeekend] = useState("");

    const [loading, setLoading] = useState(false);

    const addTask = () => {
        if (!taskName) {
            Alert.alert("Informe o nome da tarefa");
            return;
        }

        setTasks([
            ...tasks,
            {
                name: taskName,
                points_weekday: parseInt(taskPointsWeekday),
                points_weekend: parseInt(taskPointsWeekend),
            },
        ]);

        setTaskName("");
        setTaskPointsWeekday("1");
        setTaskPointsWeekend("2");
    };

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleCreate = async () => {
        if (!name || !startDate || !endDate || tasks.length === 0) {
            Alert.alert("Preencha todos os campos e adicione pelo menos uma tarefa.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/challenges", {
                name,
                description,
                start_date: startDate.toISOString().split("T")[0],
                end_date: endDate.toISOString().split("T")[0],
                tasks,
            });

            Alert.alert("Desafio criado com sucesso!");
            router.replace("/(drawer)");
        } catch (e: any) {
            Alert.alert("Erro ao criar desafio", e?.response?.data?.message || "Erro desconhecido");
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Criar Desafio</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome do Desafio"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Descrição (opcional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
            />

            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.input}>
                <Text>Início: {startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showStartPicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(_: any, date: any) => {
                        setShowStartPicker(false);
                        if (date) setStartDate(date);
                    }}
                />
            )}

            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.input}>
                <Text>Fim: {endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showEndPicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={(_: any, date: any) => {
                        setShowEndPicker(false);
                        if (date) setEndDate(date);
                    }}
                />
            )}

            <View style={styles.tasksSection}>
                <Text style={styles.tasksTitle}>Tarefas do desafio:</Text>
                <FlatList
                    data={tasks}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.taskItem}>
                            <Text style={styles.taskText}>
                                {item.name} - {item.points_weekday}pt (semana) / {item.points_weekend}pt (fds)
                            </Text>
                            <TouchableOpacity onPress={() => removeTask(index)}>
                                <Text style={styles.removeTask}>Remover</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />

                <View style={styles.taskForm}>
                    <TextInput
                        style={[styles.input, styles.taskInput]}
                        placeholder="Nome da Tarefa"
                        value={taskName}
                        onChangeText={setTaskName}
                    />
                    <TextInput
                        style={[styles.input, styles.taskInput]}
                        placeholder="Pontos (semana)"
                        keyboardType="numeric"
                        value={taskPointsWeekday}
                        onChangeText={setTaskPointsWeekday}
                    />
                    <TextInput
                        style={[styles.input, styles.taskInput]}
                        placeholder="Pontos (fim de semana)"
                        keyboardType="numeric"
                        value={taskPointsWeekend}
                        onChangeText={setTaskPointsWeekend}
                    />
                    <Button title="+" onPress={addTask} />
                </View>
            </View>

            <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreate}
                disabled={loading}
            >
                <Text style={styles.createButtonText}>
                    {loading ? "Criando..." : "Criar Desafio"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    tasksSection: {
        marginVertical: 16,
    },
    tasksTitle: {
        fontWeight: "bold",
        marginBottom: 8,
    },
    taskItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    taskText: {
        flex: 1,
    },
    removeTask: {
        color: "red",
        marginLeft: 12,
    },
    taskForm: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center",
        marginTop: 8,
    },
    taskInput: {
        flex: 2,
        marginBottom: 0,
    },
    taskPoints: {
        flex: 1,
        marginBottom: 0
    },
    createButton: {
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 24,
    },
    createButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});