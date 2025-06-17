import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function RegisterScreen() {
    const { register, loading } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    }

    
}