import { useState } from "react";
import { Button, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import CheckboxGroup from "../Form/CheckboxGroup";
import DateTimePicker from "@react-native-community/datetimepicker";

type TaskFormProps = {
    initial?: any;
    onSave: (task: any) => void;
    onCancel?: () => void;
};

const weekDays = [
    { label: "Seg", value: "monday" },
    { label: "Ter", value: "tuesday" },
    { label: "Qua", value: "wednesday" },
    { label: "Qui", value: "thursday" },
    { label: "Sex", value: "friday" },
    { label: "Sáb", value: "saturday" },
    { label: "Dom", value: "sunday" },
];

const availabilityTypes = [
    { label: "Dias da semana", value: "weekday" },
    { label: "Datas específicas", value: "specific_dates" },
    { label: "Apenas um dia", value: "single_date" },
];

export default function TaskForm({ initial, onSave, onCancel }: TaskFormProps) {
    const [name, setName] = useState(initial?.name || "");
    const [description, setDescription] = useState(initial?.description || "");
    const [pointsWeekday, setPointsWeekday] = useState(initial?.points_weekday || 1);
    const [pointsWeekend, setPointsWeekend] = useState(initial?.points_weekend || 2);
    const [requiresPhoto, setRequiresPhoto] = useState(initial?.requires_photo || false);

    const [availabilityType, setAvailabilityType] = useState(initial?.availability_type || "weekday");
    const [days, setDays] = useState<string[]>(initial?.days || []);
    const [specificDates, setSpecificDates] = useState<string[]>(initial?.availability_dates || []);
    const [singleDate, setSingleDate] = useState<string>(initial?.availability_dates?.[0] || "");
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [replicate, setReplicate] = useState(!!initial?.replicate);

    const [showAdvanced, setShowAdvanced] = useState(false);

    const [startTime, setStartTime] = useState(initial?.start_time || "");
    const [endTime, setEndTime] = useState(initial?.end_time || "");
    const [showTimePicker, setShowTimePicker] = useState<"start"|"end"|null>(null);

    const [isBonus, setIsBonus] = useState(initial?.is_bonus || false);
    const [maxCompletions, setMaxCompletions] = useState(
        initial?.max_completions !== undefined ? String(initial.max_completions) : ""
    );
    const [isRequired, setIsRequired] = useState(initial?.is_required ?? true);
    const [mediaType, setMediaType] = useState(initial?.media_type || "photo");
    const [options, setOptions] = useState<string[]>(initial?.options || []);
    const [optionText, setOptionText] = useState("");

    const handleAddDate = (date: Date) => {
        const iso = date.toISOString().split("T")[0];
        if (!specificDates.includes(iso)) setSpecificDates([...specificDates, iso]);
        setShowDatePicker(false);
    };

    const handleSetSingleDate = (date: Date) => {
        setSingleDate(date.toISOString().split("T")[0]);
        setShowDatePicker(false);
    };

    function renderAvailabilityFields() {
        if (availabilityType === "weekday") {
            return (
                <CheckboxGroup
                    options={weekDays}
                    value={days}
                    onChange={setDays}
                />
            );
        }

        if (availabilityType === "specific_dates") {
            return (
                <View>
                    <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                        <Text>Adicionar data</Text>
                    </TouchableOpacity>
                    
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                        {specificDates.map(date => (
                            <View key={date} style={styles.dateBadge}>
                                <Text style={{ color: "#222" }}>{date}</Text>
                                <TouchableOpacity onPress={() => setSpecificDates(specificDates.filter(d => d !== date))}>
                                    <Text style={{ color: "red", marginLeft: 4 }}>X</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            onChange={(_, date) => {
                                if (date) handleAddDate(date);
                                else setShowDatePicker(false);
                            }}
                        />
                    )}
                </View>
            );
        }

        if (availabilityType === "single_date") {
            return (
                <View>
                    <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                        <Text>{singleDate ? `Data: ${singleDate}` : "Selecionar data"}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={singleDate ? new Date(singleDate) : new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            onChange={(_, date) => {
                                if (date) handleSetSingleDate(date);
                                else setShowDatePicker(false);
                            }}
                        />
                    )}
                </View>
            );
        }

        return null;
    }

    const handleAddOption = () => {
        if (optionText.trim()) {
            setOptions([...options, optionText.trim()]);
            setOptionText("");
        }
    };

    const handleSave = () => {
        if (!name) {
            alert("Nome da tarefa obrigatório.");
            return;
        }

        let daysToSave: string[] | null = null;
        let availabilityDates: string[] | null = null;

        if (availabilityType === "weekday") {
            daysToSave = days;
        } else if (availabilityType === "specific_dates") {
            availabilityDates = specificDates;
        } else if (availabilityType === "single_date") {
            availabilityDates = singleDate ? [singleDate] : [];
        }

        onSave({
            name,
            description,
            points_weekday: Number(pointsWeekday),
            points_weekend: Number(pointsWeekend),
            days: daysToSave,
            availability_dates: availabilityDates,
            requires_photo: requiresPhoto,
            replicate,
            availability_type: availabilityType,
            start_time: startTime,
            end_time: endTime,
            is_bonus: isBonus,
            max_completions: maxCompletions ? Number(maxCompletions) : null,
            is_required: isRequired,
            media_type: mediaType,
            options,
        });
    };

    return (
        <View style={styles.form}>
            <TextInput
                style={styles.input}
                placeholder="Nome da Tarefa"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Descrição (opcional)"
                value={description}
                onChangeText={setDescription}
            />

            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder="Pontos (semana)"
                    value={pointsWeekday}
                    onChangeText={setPointsWeekday}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Pontos (fim de semana)"
                    value={pointsWeekend}
                    onChangeText={setPointsWeekend}
                    keyboardType="numeric"
                />
            </View>

            <Text style={{ marginBottom: 4 }}>Disponibilidade da tarefa:</Text>
            <View style={[styles.row, { flexWrap: "wrap" }]}>
                {availabilityTypes.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[
                            styles.availTypeBtn,
                            availabilityType === opt.value && styles.availTypeBtnActive,
                        ]}
                        onPress={() => setAvailabilityType(opt.value)}
                    >
                        <Text style={{ color: availabilityType === opt.value ? "#fff" : "#222" }}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {renderAvailabilityFields()}

            {!showAdvanced && (
                <TouchableOpacity style={styles.advancedButton} onPress={() => setShowAdvanced(true)}>
                    <Text style={styles.advancedButtonText}>+ Mostrar opções avançadas</Text>
                </TouchableOpacity>
            )}

            {showAdvanced && (
                <>
                
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity style={[styles.input, { flex: 1 }]} onPress={() => setShowTimePicker("start")}>
                            <Text>{startTime ? `Das ${startTime}` : "Horário início (opcional)"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.input, { flex: 1 }]} onPress={() => setShowTimePicker("end")}>
                            <Text>{endTime ? `Até ${endTime}` : "Horário fim (opcional)"}</Text>
                        </TouchableOpacity>
                    </View>
                    {showTimePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={(_, date) => {
                                if (date) {
                                    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                                    showTimePicker === "start" ? setStartTime(time) : setEndTime(time);
                                }
                                setShowTimePicker(null);
                            }}
                        />
                    )}

                    <View>
                        <Text style={{ marginBottom: 4 }}>Checklist/múltipla escolha (opcional):</Text>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <TextInput
                                style={[styles.input, { flex: 2 }]}
                                placeholder="Opção"
                                value={optionText}
                                onChangeText={setOptionText}
                            />
                            <Button title="+" onPress={handleAddOption} />
                        </View>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                            {options.map((opt, idx) => (
                                <View key={idx} style={styles.dateBadge}>
                                    <Text>{opt}</Text>
                                    <TouchableOpacity onPress={() => setOptions(options.filter((_, i) => i !== idx))}>
                                        <Text style={{ color: "red", marginLeft: 4 }}>x</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={{ marginTop: 8 }}>
                        <Text style={{ flex: 1, marginBottom: 8 }}>Tipo de comprovante:</Text>
                        <View style={styles.row}>
                            <TouchableOpacity 
                                style={[styles.availTypeBtn, mediaType === "photo" && styles.availTypeBtnActive]}
                                onPress={() => setMediaType("photo")}
                            >
                                <Text style={{ color: mediaType === "photo" ? "#fff" : "#222" }}>Foto</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.availTypeBtn, mediaType === "audio" && styles.availTypeBtnActive]}
                                onPress={() => setMediaType("audio")}
                            >
                                <Text style={{ color: mediaType === "audio" ? "#fff" : "#222" }}>Áudio</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.availTypeBtn, mediaType === "video" && styles.availTypeBtnActive]}
                                onPress={() => setMediaType("video")}
                            >
                                <Text style={{ color: mediaType === "video" ? "#fff" : "#222" }}>Vídeo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.availTypeBtn, mediaType === "text" && styles.availTypeBtnActive]}
                                onPress={() => setMediaType("text")}
                            >
                                <Text style={{ color: mediaType === "text" ? "#fff" : "#222" }}>Texto</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.switchRow}>
                        <Text>Tarefa obrigatória?</Text>
                        <Switch value={isRequired} onValueChange={setIsRequired} />
                    </View>

                    <View style={styles.switchRow}>
                        <Text>É tarefa bônus?</Text>
                        <Switch value={isBonus} onValueChange={setIsBonus} />
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Limite de vezes (opcional)"
                        value={maxCompletions}
                        keyboardType="numeric"
                        onChangeText={setMaxCompletions}
                    />

                    <TouchableOpacity style={styles.hideAdvancedButton} onPress={() => setShowAdvanced(false)}>
                        <Text style={styles.hideAdvancedButtonText}>Ocultar opções avançadas</Text>
                    </TouchableOpacity>
                </>
            )}

            <View style={styles.switchRow}>
                <Text>Exigir foto para concluir?</Text>
                <Switch value={requiresPhoto} onValueChange={setRequiresPhoto} />
            </View>

            <View style={styles.switchRow}>
                <Text>Replicar tarefa até o fim do desafio?</Text>
                <Switch value={replicate} onValueChange={setReplicate} />
            </View>

            <View style={styles.buttons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
                {onCancel && (
                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    form: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        elevation: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#fafafa",
    },
    row: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
    },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    buttons: {
        flexDirection: "row",
        gap: 8,
        justifyContent: "flex-end",
    },
    saveButton: {
        backgroundColor: "#228b22",
        padding: 12,
        borderRadius: 8,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    cancelButton: {
        marginLeft: 8,
        padding: 12,
    },
    cancelButtonText: {
        color: "#888",
    },
    availTypeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#eee",
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    availTypeBtnActive: {
        backgroundColor: "#228b22",
    },
    dateBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eee",
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginRight: 6,
        marginBottom: 6,
    },
    advancedButton: {
        alignSelf: "flex-end",
        marginVertical: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#eee",
        borderRadius: 8,
    },
    advancedButtonText: {
        color: "#228b22",
        fontWeight: "bold",
    },
    hideAdvancedButton: {
        alignSelf: "flex-end",
        marginTop: 12,
        marginBottom: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#fafafa",
        borderRadius: 8,
    },
    hideAdvancedButtonText: {
        color: "#999",
    },
})