import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { logoutUser } from '../utils/AuthManager';
import agent from '../api/agent';

interface Props {
    onLogout: () => void;
}

// --- MODERN SLATE BLUE TEMASI ---
const COLORS = {
    primary: '#334155', // Slate 700 - Ana Renk
    primaryDark: '#1E293B', // Slate 900
    
    background: '#F9FAFB', // Sayfa Arkaplanı
    cardBg: '#FFFFFF',
    
    textDark: '#0F172A',
    textMedium: '#334155',
    textLight: '#64748B',
    white: '#FFFFFF',
    
    border: '#E2E8F0',
    success: '#10B981',
    error: '#EF4444',
    
    inputBg: '#F1F5F9',
};

export default function SettingsScreen({ onLogout }: Props) {
    const [profile, setProfile] = useState({ 
        fullName: '', 
        email: '', 
        totalSubscriptions: 0, 
        monthlyBudget: 0 
    });

    // Modallar
    const [editNameVisible, setEditNameVisible] = useState(false);
    const [newName, setNewName] = useState('');

    const [changePassVisible, setChangePassVisible] = useState(false);
    const [passData, setPassData] = useState({ current: '', new: '' });

    const [budgetModalVisible, setBudgetModalVisible] = useState(false);
    const [newBudget, setNewBudget] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await agent.Auth.getProfile();
            if (response && response.data) {
                setProfile(response.data);
                setNewName(response.data.fullName);
                setNewBudget(response.data.monthlyBudget?.toString() || '0');
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
            fetchProfile();
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
            fetchProfile();
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
                    await logoutUser();
                    onLogout();
                }
            }
        ]);
    };

    // --- REUSABLE COMPONENTS ---
    const SettingsItem = ({ icon, title, subtitle, onPress, isDestructive = false }: any) => (
        <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconBox, isDestructive && { backgroundColor: '#FEE2E2' }]}>
                <Ionicons 
                    name={icon} 
                    size={20} 
                    color={isDestructive ? COLORS.error : COLORS.primary} 
                />
            </View>
            <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, isDestructive && { color: COLORS.error }]}>{title}</Text>
                {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Ayarlar</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* 1. PROFİL KARTI (Hero Style) */}
                    <View style={styles.profileCard}>
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {profile.fullName?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{profile.fullName || 'Misafir Kullanıcı'}</Text>
                                <Text style={styles.profileEmail}>{profile.email}</Text>
                            </View>
                            <TouchableOpacity style={styles.editButton} onPress={() => setEditNameVisible(true)}>
                                <MaterialCommunityIcons name="pencil" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{profile.totalSubscriptions}</Text>
                                <Text style={styles.statLabel}>Abonelik</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>1.1.0</Text>
                                <Text style={styles.statLabel}>Versiyon</Text>
                            </View>
                        </View>
                    </View>

                    {/* 2. BÜTÇE WIDGET'I */}
                    <TouchableOpacity style={styles.budgetWidget} onPress={() => setBudgetModalVisible(true)} activeOpacity={0.8}>
                        <View style={styles.budgetIconCircle}>
                            <MaterialCommunityIcons name="target" size={24} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.widgetTitle}>Aylık Bütçe Hedefi</Text>
                            <Text style={styles.widgetSub}>Harcamalarını kontrol altında tut</Text>
                        </View>
                        <View style={styles.budgetAmountContainer}>
                            <Text style={styles.budgetAmount}>
                                {profile.monthlyBudget > 0 ? `${profile.monthlyBudget} ₺` : '-'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* 3. AYAR GRUPLARI */}
                    <Text style={styles.sectionHeader}>Güvenlik</Text>
                    <View style={styles.sectionContainer}>
                        <SettingsItem 
                            icon="lock-closed-outline" 
                            title="Şifre Değiştir" 
                            subtitle="Güvenliğiniz için düzenli değiştirin"
                            onPress={() => setChangePassVisible(true)} 
                        />
                    </View>

                    <Text style={styles.sectionHeader}>Uygulama</Text>
                    <View style={styles.sectionContainer}>
                        <SettingsItem 
                            icon="log-out-outline" 
                            title="Oturumu Kapat" 
                            isDestructive 
                            onPress={handleLogout} 
                        />
                    </View>

                    <Text style={styles.footerText}>SubGuard © 2025</Text>

                </ScrollView>

                {/* --- MODALLAR --- */}
                
                {/* İSİM DÜZENLEME */}
                <Modal visible={editNameVisible} transparent animationType="fade">
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Profil Düzenle</Text>
                            <Text style={styles.modalSub}>Görünen isminizi güncelleyin.</Text>
                            
                            <TextInput 
                                style={styles.input} 
                                value={newName} 
                                onChangeText={setNewName} 
                                placeholder="Ad Soyad" 
                                placeholderTextColor={COLORS.textLight}
                            />
                            
                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setEditNameVisible(false)} style={styles.cancelBtn}>
                                    <Text style={styles.cancelBtnText}>Vazgeç</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleUpdateName} style={styles.saveBtn}>
                                    <Text style={styles.saveBtnText}>Kaydet</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* ŞİFRE DEĞİŞTİRME */}
                <Modal visible={changePassVisible} transparent animationType="fade">
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Şifre Değiştir</Text>
                            
                            <TextInput 
                                style={styles.input} 
                                placeholder="Mevcut Şifre" 
                                placeholderTextColor={COLORS.textLight}
                                secureTextEntry 
                                value={passData.current} 
                                onChangeText={(t) => setPassData({ ...passData, current: t })} 
                            />
                            <TextInput 
                                style={[styles.input, { marginTop: 10 }]} 
                                placeholder="Yeni Şifre" 
                                placeholderTextColor={COLORS.textLight}
                                secureTextEntry 
                                value={passData.new} 
                                onChangeText={(t) => setPassData({ ...passData, new: t })} 
                            />
                            
                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setChangePassVisible(false)} style={styles.cancelBtn}>
                                    <Text style={styles.cancelBtnText}>Vazgeç</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleChangePassword} style={styles.saveBtn}>
                                    <Text style={styles.saveBtnText}>Güncelle</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* BÜTÇE DÜZENLEME */}
                <Modal visible={budgetModalVisible} transparent animationType="fade">
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Bütçe Hedefi</Text>
                            <Text style={styles.modalSub}>Aylık harcama limitinizi belirleyin.</Text>

                            <View style={styles.budgetInputContainer}>
                                <Text style={styles.currencyPrefix}>₺</Text>
                                <TextInput
                                    style={styles.budgetInput}
                                    value={newBudget}
                                    onChangeText={setNewBudget}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    autoFocus
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setBudgetModalVisible(false)} style={styles.cancelBtn}>
                                    <Text style={styles.cancelBtnText}>Vazgeç</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleUpdateBudget} style={styles.saveBtn}>
                                    <Text style={styles.saveBtnText}>Kaydet</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textDark,
        letterSpacing: -0.5,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 10,
    },

    // PROFILE CARD (Hero Style)
    profileCard: {
        backgroundColor: COLORS.primary, // Slate 700
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: COLORS.primaryDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profileEmail: {
        color: '#CBD5E1', // Slate 300
        fontSize: 13,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 20,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#94A3B8', // Slate 400
        fontSize: 12,
        marginTop: 2,
        fontWeight: '500',
    },
    verticalDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    // BUDGET WIDGET
    budgetWidget: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    budgetIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F1F5F9', // Light Slate
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    widgetTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textDark,
        marginBottom: 2,
    },
    widgetSub: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    budgetAmountContainer: {
        backgroundColor: '#F0FDF4', // Light Green
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    budgetAmount: {
        color: COLORS.success,
        fontWeight: '700',
        fontSize: 14,
    },

    // SECTIONS & ITEMS
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionContainer: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        paddingVertical: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    itemSubtitle: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },

    // MODAL STYLES
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)', // Slate 900 with opacity
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSub: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.textDark,
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: COLORS.inputBg,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: COLORS.textDark,
        fontWeight: '600',
        fontSize: 15,
    },
    saveBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    saveBtnText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 15,
    },
    budgetInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    currencyPrefix: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginRight: 4,
    },
    budgetInput: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.textDark,
        minWidth: 100,
        textAlign: 'center',
    },

    footerText: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 12,
        marginTop: 20,
    }
});