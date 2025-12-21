import React, { useState, useEffect } from 'react'; // useCallback ve useFocusEffect kaldırıldı
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../utils/AuthManager';
import agent from '../api/agent';
import * as Updates from 'expo-updates';

interface Props {
    onLogout: () => void; // App.tsx'ten gelecek fonksiyon
}

export default function SettingsScreen({ onLogout }: Props) {
const [profile, setProfile] = useState({ 
    fullName: '', 
    email: '', 
    totalSubscriptions: 0, 
    monthlyBudget: 0  // <-- Bunu ekledik
});

    // Modallar
    const [editNameVisible, setEditNameVisible] = useState(false);
    const [newName, setNewName] = useState('');

    const [changePassVisible, setChangePassVisible] = useState(false);
    const [passData, setPassData] = useState({ current: '', new: '' });

    // Bütçe Modalı için State
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);
    const [newBudget, setNewBudget] = useState('');

    // --- DÜZELTME BURADA ---
    // useFocusEffect yerine useEffect kullanıyoruz.
    // Bu ekran her açıldığında (render olduğunda) çalışır.
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await agent.Auth.getProfile();
            if (response && response.data) {
                setProfile(response.data);
                setNewName(response.data.fullName);
                setNewBudget(response.data.monthlyBudget?.toString() || '0'); // <-- Eklendi
            }
        } catch (error) {
            console.log("Profil çekilemedi");
        }
    };

    const handleUpdateBudget = async () => {
        const budgetVal = parseFloat(newBudget);
        if (isNaN(budgetVal)) {
            Alert.alert("Hata", "Geçerli bir tutar giriniz.");
            return;
        }
        try {
            await agent.Auth.updateProfile({ monthlyBudget: budgetVal });
            Alert.alert("Başarılı", "Bütçe hedefi güncellendi.");
            setBudgetModalVisible(false);
            fetchProfile(); // Veriyi tazele
        } catch (error) {
            Alert.alert("Hata", "Güncelleme yapılamadı.");
        }
    };

    const handleUpdateName = async () => {
        if (!newName) return;
        try {
            await agent.Auth.updateProfile({ fullName: newName });
            Alert.alert("Başarılı", "Profil güncellendi.");
            setEditNameVisible(false);
            fetchProfile(); // Güncel veriyi çek
        } catch (error) {
            Alert.alert("Hata", "Güncelleme yapılamadı.");
        }
    };

    const handleChangePassword = async () => {
        if (!passData.current || !passData.new) return;
        try {
            await agent.Auth.changePassword({ currentPassword: passData.current, newPassword: passData.new });
            Alert.alert("Başarılı", "Şifreniz değiştirildi.");
            setChangePassVisible(false);
            setPassData({ current: '', new: '' });
        } catch (error: any) {
            const msg = error.response?.data?.error || "Eski şifreniz hatalı olabilir.";
            Alert.alert("Hata", Array.isArray(msg) ? msg[0] : msg);
        }
    };

    const handleLogout = () => {
        Alert.alert("Çıkış Yap", "Hesabından çıkış yapmak istiyor musun?", [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Çıkış Yap",
                style: "destructive",
                onPress: async () => {
                    // Tokenları sil
                    await logoutUser();

                    // App.tsx'e haber ver: "Beni dışarı at!"
                    onLogout();
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil & Ayarlar</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* PROFİL KARTI */}
                <View style={styles.card}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{profile.fullName?.charAt(0).toUpperCase() || 'U'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{profile.fullName || 'Kullanıcı'}</Text>
                            <Text style={styles.email}>{profile.email}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setEditNameVisible(true)}>
                            <Ionicons name="create-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statText}>Toplam Abonelik: {profile.totalSubscriptions}</Text>
                    </View>
                </View>

                {/* YENİ: BÜTÇE KARTI */}
                <View style={styles.budgetCard}>
                    <View>
                        <Text style={styles.budgetTitle}>Aylık Bütçe Hedefi</Text>
                        <Text style={styles.budgetVal}>{profile.monthlyBudget > 0 ? `${profile.monthlyBudget} ₺` : 'Belirlenmedi'}</Text>
                    </View>
                    <TouchableOpacity style={styles.budgetBtn} onPress={() => setBudgetModalVisible(true)}>
                        <Text style={styles.budgetBtnText}>Düzenle</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Hesap</Text>

                <TouchableOpacity style={styles.row} onPress={() => setChangePassVisible(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="key-outline" size={22} color="#333" style={styles.icon} />
                        <Text style={styles.rowText}>Şifre Değiştir</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Uygulama</Text>

                {/* Çıkış Yap */}
                <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleLogout}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="log-out-outline" size={22} color="red" style={styles.icon} />
                        <Text style={[styles.rowText, { color: 'red' }]}>Oturumu Kapat</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.footer}>SubGuard v1.1.0</Text>

            </ScrollView>

            {/* İSİM DÜZENLEME MODALI */}
            <Modal visible={editNameVisible} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>İsmini Düzenle</Text>
                        <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Ad Soyad" />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setEditNameVisible(false)} style={styles.cancelBtn}><Text>Vazgeç</Text></TouchableOpacity>
                            <TouchableOpacity onPress={handleUpdateName} style={styles.saveBtn}><Text style={{ color: 'white' }}>Kaydet</Text></TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ŞİFRE DEĞİŞTİRME MODALI */}
            <Modal visible={changePassVisible} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Şifre Değiştir</Text>
                        <TextInput style={styles.input} placeholder="Mevcut Şifre" secureTextEntry value={passData.current} onChangeText={(t) => setPassData({ ...passData, current: t })} />
                        <TextInput style={styles.input} placeholder="Yeni Şifre" secureTextEntry value={passData.new} onChangeText={(t) => setPassData({ ...passData, new: t })} />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setChangePassVisible(false)} style={styles.cancelBtn}><Text>Vazgeç</Text></TouchableOpacity>
                            <TouchableOpacity onPress={handleChangePassword} style={styles.saveBtn}><Text style={{ color: 'white' }}>Değiştir</Text></TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* YENİ: BÜTÇE DÜZENLEME MODALI */}
            <Modal visible={budgetModalVisible} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Bütçe Hedefi Belirle</Text>
                        <Text style={styles.modalSub}>Aylık harcamaların için kendini sınırla.</Text>

                        <TextInput
                            style={styles.input}
                            value={newBudget}
                            onChangeText={setNewBudget}
                            placeholder="Örn: 1000"
                            keyboardType="numeric"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setBudgetModalVisible(false)} style={styles.cancelBtn}>
                                <Text>Vazgeç</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleUpdateBudget} style={styles.saveBtn}>
                                <Text style={{ color: 'white' }}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    content: { padding: 20 },
    card: { backgroundColor: '#333', borderRadius: 12, padding: 20, marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#555', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    name: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    email: { color: '#ccc', fontSize: 14 },
    statRow: { borderTopWidth: 1, borderTopColor: '#444', paddingTop: 10 },
    statText: { color: '#2ecc71', fontWeight: '600' },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#999', marginBottom: 10, marginLeft: 5, marginTop: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    rowText: { fontSize: 16, color: '#333' },
    icon: { marginRight: 12 },
    footer: { textAlign: 'center', color: '#ccc', marginTop: 20, fontSize: 12 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 10, backgroundColor: '#f9f9f9' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#eee', borderRadius: 8, marginRight: 5 },
    saveBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#333', borderRadius: 8, marginLeft: 5 },
    budgetCard: {
        backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: '#e0e0e0', borderLeftWidth: 4, borderLeftColor: '#2ecc71'
    },
    budgetTitle: { fontSize: 12, color: '#999', fontWeight: '600', textTransform: 'uppercase' },
    budgetVal: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 2 },
    budgetBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    budgetBtnText: { fontSize: 12, fontWeight: '600', color: '#333' },
    modalSub: { textAlign: 'center', color: '#666', marginBottom: 15, fontSize: 13 }

});