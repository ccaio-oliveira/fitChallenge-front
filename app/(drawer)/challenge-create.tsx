import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import TaskForm from "@/components/Challenge/TaskForm";

const maxHeight = Math.floor(Dimensions.get("window").height * 0.88);

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
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);

    const handleSaveTask = (task: any) => {
        if (editingIndex !== null) {
            const copy = [...tasks];
            copy[editingIndex] = task;
            setTasks(copy);
        } else {
            setTasks([...tasks, task]);
        }

        setShowTaskModal(false);
        setEditingTask(null);
        setEditingIndex(null);
    };

    const handleRemoveTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleEditTask = (task: any, index: number) => {
        setEditingTask(task);
        setEditingIndex(index);
        setShowTaskModal(true);
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
                            <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => handleEditTask(item, index)}>
                                <Text style={{ color: "#1e90ff"}}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRemoveTask(index)}>
                                <Text style={styles.removeTask}>Remover</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{ color: "#888", marginVertical: 8 }}>Nenhuma tarefa adicionada.</Text>}
                />

                <TouchableOpacity style={styles.addTaskButton} onPress={() => setShowTaskModal(true)}>
                    <Text style={styles.addTaskButtonText}>+ Adicionar tarefa</Text>
                </TouchableOpacity>
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

            <Modal
                visible={showTaskModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTaskModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1 }}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        >
                            <TaskForm
                                initial={editingTask}
                                onSave={handleSaveTask}
                                onCancel={() => {
                                    setShowTaskModal(false);
                                    setEditingTask(null);
                                    setEditingIndex(null);
                                }}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    addTaskButton: {
        marginTop: 8,
        backgroundColor: "#1e90ff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    addTaskButtonText: {
        color: "#fff",
        fontWeight: "bold",
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 12,
        width: "96%",
        maxWidth: 380,
        maxHeight: maxHeight,
        elevation: 4,
    }
});