import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function CompleteTaskScreen() {
    const { challengeId, taskId, task: taskString } = useLocalSearchParams<{
        challengeId: string;
        taskId: string;
        task: string;
    }>();
    const task = taskString ? JSON.parse(taskString) : null;
    const router = useRouter();

    const [photo, setPhoto] = useState<string | null>(null);
    const [textProof, setTextProof] = useState<string>("");
    const [checkedOptions, setCheckedOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const options: string[] = task?.options || [];

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
            setPhoto(result.assets[0].uri);
        }
    };    const handleSubmit = async () => {
        setLoading(true);

        // Usar FormData para enviar arquivos
        const formData = new FormData();
        
        formData.append('media_type', task.media_type);
        formData.append('date', new Date().toISOString().split('T')[0]);
        formData.append('completed', 'true');

        // Só adiciona os campos se tiverem valor
        if (textProof) formData.append('text_proof', textProof);
        
        // Para arrays, enviar cada item separadamente
        if (checkedOptions.length > 0) {
            checkedOptions.forEach((option, index) => {
                formData.append(`checked_options[${index}]`, option);
            });
        }
        
        if (photo) {
            // Criar objeto de arquivo para o FormData
            const uriParts = photo.split('.');
            const fileType = uriParts[uriParts.length - 1];
            
            formData.append('media_file', {
                uri: photo,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            } as any);
        }

        console.log("FormData being sent with photo:", !!photo);

        try {
            await api.post(`/challenges/${challengeId}/tasks/${taskId}/complete`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert("Sucesso", "Tarefa completada com sucesso!");
            router.back();
        } catch (e: any) {
            console.error("Erro completo:", e);
            console.error("Response data:", e?.response?.data);
            Alert.alert("Erro", e?.response?.data?.error || e?.response?.data?.message || "Não foi possível registrar tarefa.");
        }

        setLoading(false);
    };

    function renderProofInput() {
        switch (task.media_type) {
            case "photo":
                return (
                    <View style={styles.section}>
                        <Button title={photo ? "Trocar foto" : "Selecionar foto"} onPress={pickImage} />
                        {photo && <Text style={styles.selectedFile}>Foto selecionada!</Text>}
                    </View>
                );
            case "text":
                return (
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu comprovante"
                        value={textProof}
                        onChangeText={setTextProof}
                        multiline
                    />
                );
            case "audio":
            case "video":
                return (
                    <Text style={{ color: "#888", marginBottom: 8 }}>Upload de {task.media_type} ainda não implementado!</Text>
                );
            default:
                return null;
        }
    }

    function renderChecklist() {
        if (!options.length) return null;

        return (
            <View style={styles.section}>
                <Text style={{ marginBottom: 4 }}>Marque as opções feitas:</Text>
                {options.map((opt: string, index: number) => (
                    <TouchableOpacity
                        key={`${opt}-${index}`}
                        onPress={() => setCheckedOptions(
                            checkedOptions.includes(opt)
                                ? checkedOptions.filter(o => o !== opt)
                                : [...checkedOptions, opt]
                        )}
                        style={[styles.optionBtn, checkedOptions.includes(opt) && styles.optionBtnSelected]}
                    >
                        <Text style={{ color: checkedOptions.includes(opt) ? "#fff" : "#222" }}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Marcar tarefa: {task?.name}</Text>
            {renderProofInput()}
            {renderChecklist()}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={{ color: "#fff" }}>{loading ? "Enviando..." : "Enviar"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                    <Text style={{ color: "#555" }}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 18,
    },
    section: {
        marginBottom: 18,
    },
    input: {
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    selectedFile: {
        color: "#228b22",
        marginTop: 6,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    submitBtn: {
        padding: 12,
        backgroundColor: "#228b22",
        borderRadius: 8,
        minWidth: 100,
        alignItems: "center",
    },
    cancelBtn: {
        padding: 12,
        marginLeft: 10,
    },
    optionBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#eee",
        marginRight: 8,
        marginBottom: 8,
    },
    optionBtnSelected: {
        backgroundColor: "#228b22",
    },
});