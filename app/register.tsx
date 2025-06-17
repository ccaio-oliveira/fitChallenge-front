import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router"
import { useState } from "react";

const RegisterScreen = () => {
    const router = useRouter();
    const { register, login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleRegister = async () => {
        setError(null);
        if(
            !form.name ||
            !form.email ||
            !form.password ||
            !form.password_confirmation
        ) {
            setError("Preencha todos os campos.");
            return;
        }

        if (form.password !== form.password_confirmation) {
            setError("As senhas não coincidem.");
            return;
        }

        try {
            await register(form);
            router.replace("/");
        } catch (e: any) {
            setError(
                e.response?.data?.message ||
                "Ocorreu um erro ao registrar. Tente novamente."
            );
        }
    };

    return (
        
    )
}