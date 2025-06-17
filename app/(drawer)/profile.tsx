import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 22, marginBottom: 16 }}>
                {user?.name}
            </Text>
            <Text style={{ color: "#888", marginBottom: 32 }}>
                {user?.email}
            </Text>
            <TouchableOpacity
                style={{
                    backgroundColor: "#E74C3C",
                    paddingVertical: 12,
                    paddingHorizontal: 32,
                    borderRadius: 8,
                }}
                onPress={() => {
                    logout();
                    router.replace("/login");
                }}
            >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Sair</Text>
            </TouchableOpacity>
        </View>
    )
}