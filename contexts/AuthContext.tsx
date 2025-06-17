import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type User = {
    id: number;
    name: string;
    email: string;
};

type AuthContextProps = {
    user: User | null;
    loading: boolean;
    register: (data: RegisterParams) => Promise<void>;
    login: (data: LoginParams) => Promise<void>;
    logout: () => Promise<void>;
};

type RegisterParams = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

type LoginParams = {
    email: string;
    password: string;
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                try {
                    const { data } = await api.get("/user");
                    setUser(data);
                } catch {
                    setUser(null);
                }
            }
            setLoading(false);
        })();
    }, []);
    
    const register = async (data: RegisterParams) => {
        setLoading(true);
        const res = await api.post("/auth/register", data);
        await AsyncStorage.setItem("token", res.data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        setLoading(false);
    };

    const login = async (data: LoginParams) => {
        setLoading(true);
        const res = await api.post("/auth/login", data);
        await AsyncStorage.setItem("token", res.data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        setLoading(false);
    };

    const logout = async () => {
        setLoading(true);
        try {
            await api.post("/auth/logout");
        } catch {}
        await AsyncStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
