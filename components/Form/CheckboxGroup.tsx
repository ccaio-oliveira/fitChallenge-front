import { Text, TouchableOpacity, View } from "react-native";

type CheckboxGroupProps = {
    options: { label: string; value: string }[];
    value: string[];
    onChange: (val: string[]) => void;
}

export default function CheckboxGroup({ options, value, onChange }: CheckboxGroupProps) {
    const toggle = (v: string) => {
        if (value.includes(v)) onChange(value.filter(item => item !== v));
        else onChange([...value, v]);
    };

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
            {options.map(opt => (
                <TouchableOpacity
                    key={opt.value}
                    onPress={() => toggle(opt.value)}
                    style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: value.includes(opt.value) ? "#228b22" : "#eee",
                        borderRadius: 8,
                        marginRight: 6,
                        marginBottom: 6,
                    }}
                >
                    <Text style={{ color: value.includes(opt.value) ? "#fff" : "#222" }}>{opt.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}