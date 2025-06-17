import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
    const { login, loading } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleLogin = async () => {
        setError(null);
        try {
            await login(form);
            router.replace("/");
        } catch (e: any) {
            setError(e?.response?.data?.message || "Erro ao fazer login.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Entrar</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={t => handleChange("email", t)}
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry
                value={form.password}
                onChangeText={t => handleChange("password", t)}
            />

            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switch} onPress={() => router.replace("/register")}>
                <Text>Não tem conta? <Text style={styles.link}>Criar agora</Text></Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 32,
        alignSelf: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#111",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    switch: {
        marginTop: 24,
        alignItems: "center",
    },
    link: {
        color: "#007AFF",
        fontWeight: "bold",
    },
    error: {
        color: "red",
        marginBottom: 8,
        textAlign: "center",
    }
})