import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Linking,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { UserSubscription } from '../types';

type Tab = 'subs' | 'people' | 'benimle';

// --- Yardımcılar ---

function sendWhatsApp(sub: UserSubscription, personName?: string) {
  const partnerCount = sub.sharedWith?.length ?? 0;
  const share = (sub.price / (partnerCount + 1)).toFixed(2);
  const target = personName ? ` ${personName},` : '';
  const msg = `Selam!${target} ${sub.name} aboneliğimizin bu ayki payın: ${share} ${sub.currency} 💳`;
  Linking.openURL(`whatsapp://send?text=${encodeURIComponent(msg)}`).catch(() =>
    Alert.alert('Hata', 'WhatsApp yüklü değil.')
  );
}

function sendEmail(sub: UserSubscription, email: string) {
  const partnerCount = sub.sharedWith?.length ?? 0;
  const share = (sub.price / (partnerCount + 1)).toFixed(2);
  const subject = encodeURIComponent(`${sub.name} Abonelik Paylaşım Hatırlatması`);
  const body = encodeURIComponent(
    `Merhaba,\n\n${sub.name} aboneliğimizin bu ayki payın: ${share} ${sub.currency}.\n\nSubGuard ile gönderildi.`
  );
  Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`).catch(() =>
    Alert.alert('Hata', 'E-posta uygulaması açılamadı.')
  );
}

// --- ManagePartnersModal (inline basit modal) ---
interface ManageModalProps {
  sub: UserSubscription;
  colors: ReturnType<typeof useThemeColors>;
  onClose: () => void;
  onUpdate: (id: string, partners: string[]) => void;
}

function ManagePartnersPanel({ sub, colors, onClose, onUpdate }: ManageModalProps) {
  const [partners, setPartners] = useState<string[]>(sub.sharedWith ?? []);
  const [inputText, setInputText] = useState('');

  // Dışarıdan sub.sharedWith değişirse (örn. store optimistic update) yerel state senkronize et (Fix 23)
  useEffect(() => {
    setPartners(sub.sharedWith ?? []);
  }, [sub.id]); // sub değiştiğinde (farklı abonelik açıldığında) yeniden başlat

  const addPartner = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (partners.includes(trimmed)) {
      Alert.alert('Zaten ekli', `"${trimmed}" listede mevcut.`);
      return;
    }
    setPartners((prev) => [...prev, trimmed]);
    setInputText('');
  };

  const removePartner = (name: string) => {
    Alert.alert('Kişiyi Kaldır', `"${name}" paylaşım listesinden çıkarılsın mı?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Kaldır',
        style: 'destructive',
        onPress: () => setPartners((prev) => prev.filter((p) => p !== name)),
      },
    ]);
  };

  const handleSave = () => {
    onUpdate(sub.id, partners);
    onClose();
  };

  const perPerson = partners.length > 0 ? (sub.price / (partners.length + 1)).toFixed(2) : sub.price.toFixed(2);

  return (
    <View style={[styles.panel, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Panel Başlığı */}
      <View style={styles.panelHeader}>
        <View style={[styles.panelColorBar, { backgroundColor: sub.colorCode || colors.accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.panelTitle, { color: colors.textMain }]}>{sub.name}</Text>
          <Text style={[styles.panelSub, { color: colors.textSec }]}>
            Kişi başı: {sub.currency} {perPerson}
            {partners.length > 0 ? ` · ${partners.length + 1} kişi` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.textSec} />
        </TouchableOpacity>
      </View>

      {/* Kişi Ekle */}
      <View style={[styles.addRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.addInput, { color: colors.textMain, backgroundColor: colors.inputBg }]}
          placeholder="İsim veya e-posta ekle"
          placeholderTextColor={colors.textSec}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addPartner}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={addPartner}
        >
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Kişi Listesi */}
      {partners.length === 0 ? (
        <Text style={[styles.noPartnerText, { color: colors.textSec }]}>Henüz kimse eklenmedi.</Text>
      ) : (
        partners.map((p) => {
          const isEmail = p.includes('@');
          return (
            <View key={p} style={[styles.partnerRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.partnerAvatar, { backgroundColor: colors.inputBg }]}>
                <Text style={[styles.partnerAvatarText, { color: colors.accent }]}>
                  {p.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.partnerName, { color: colors.textMain }]} numberOfLines={1}>
                {p}
              </Text>
              {/* Hatırlatma butonları */}
              <TouchableOpacity
                onPress={() => isEmail ? sendEmail(sub, p) : sendWhatsApp(sub, p)}
                style={[styles.partnerAction, { backgroundColor: isEmail ? colors.accent + '18' : '#25D366' + '22' }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {isEmail
                  ? <Ionicons name="mail-outline" size={14} color={colors.accent} />
                  : <FontAwesome5 name="whatsapp" size={14} color="#25D366" />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removePartner(p)}
                style={styles.removeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          );
        })
      )}

      {/* Kaydet */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.accent }]}
        onPress={handleSave}
      >
        <Text style={styles.saveBtnText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Ana Ekran ---
export default function SharedSubscriptionsScreen() {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const { subscriptions, sharedWithMe, exchangeRates, updateSubscription, fetchSharedWithMe, fetchUserSubscriptions } = useUserSubscriptionStore();

  const [activeTab, setActiveTab] = useState<Tab>('subs');
  const [managingSub, setManagingSub] = useState<UserSubscription | null>(null);

  useEffect(() => {
    fetchSharedWithMe();
  }, []);

  // Paylaşımlı abonelikler
  const sharedSubs = useMemo(
    () => subscriptions.filter((s) => s.isActive !== false && (s.sharedWith?.length ?? 0) > 0),
    [subscriptions],
  );

  // Kişi bazlı gruplama
  const peopleMap = useMemo(() => {
    const map: Record<string, { subs: UserSubscription[]; totalShare: number }> = {};
    sharedSubs.forEach((sub) => {
      const rate = exchangeRates[sub.currency] ?? 1;
      const priceInTry = sub.price * rate;
      const partnerCount = sub.sharedWith!.length;
      const perPerson = priceInTry / (partnerCount + 1);
      sub.sharedWith!.forEach((person) => {
        if (!map[person]) map[person] = { subs: [], totalShare: 0 };
        map[person].subs.push(sub);
        map[person].totalShare += perPerson;
      });
    });
    return Object.entries(map).sort((a, b) => b[1].totalShare - a[1].totalShare);
  }, [sharedSubs, exchangeRates]);

  // Toplam paylaşılan tutar
  const totalSharedAmount = useMemo(() => {
    return sharedSubs.reduce((total, sub) => {
      const rate = exchangeRates[sub.currency] ?? 1;
      return total + sub.price * rate;
    }, 0);
  }, [sharedSubs, exchangeRates]);

  const handleUpdatePartners = useCallback(
    (id: string, partners: string[]) => {
      // Optimistic update — UI anında güncellenir (Fix 23)
      updateSubscription(id, { sharedWith: partners });
      // Arka planda sunucu durumunu senkronize et
      fetchUserSubscriptions();
    },
    [updateSubscription, fetchUserSubscriptions],
  );

  // --- Render: Paylaştıklarım Sekmesi ---
  const renderSubItem = ({ item }: { item: UserSubscription }) => {
    const partnerCount = item.sharedWith?.length ?? 0;
    const rate = exchangeRates[item.currency] ?? 1;
    const priceInTry = item.price * rate;
    const perPerson = priceInTry / (partnerCount + 1);

    return (
      <View style={[styles.subCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.subColorBar, { backgroundColor: item.colorCode || colors.accent }]} />
        <View style={styles.subCardBody}>
          <View style={styles.subCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subName, { color: colors.textMain }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.subCategory, { color: colors.textSec }]}>{item.category}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.subTotalPrice, { color: colors.textMain }]}>
                {item.currency} {item.price.toFixed(2)}
              </Text>
              <Text style={[styles.subPerPerson, { color: colors.accent }]}>
                Kişi başı ₺{perPerson.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Kişiler */}
          <View style={styles.partnersRow}>
            <Ionicons name="people-outline" size={14} color={colors.textSec} />
            <Text style={[styles.partnersText, { color: colors.textSec }]}>
              {item.sharedWith!.join(', ')}
            </Text>
          </View>

          {/* Aksiyon butonları */}
          <View style={styles.subActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setManagingSub(item)}
            >
              <Ionicons name="people" size={14} color={colors.accent} />
              <Text style={[styles.actionBtnText, { color: colors.accent }]}>Yönet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#25D366' + '22', borderColor: '#25D366' + '44' }]}
              onPress={() => sendWhatsApp(item)}
            >
              <FontAwesome5 name="whatsapp" size={13} color="#25D366" />
              <Text style={[styles.actionBtnText, { color: '#25D366' }]}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // --- Render: Kişiler Sekmesi ---
  const renderPersonItem = ({ item }: { item: [string, { subs: UserSubscription[]; totalShare: number }] }) => {
    const [person, data] = item;
    const isEmail = person.includes('@');
    return (
      <View style={[styles.personCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.personCardHeader}>
          <View style={[styles.personAvatar, { backgroundColor: colors.accent + '20' }]}>
            <Text style={[styles.personAvatarText, { color: colors.accent }]}>
              {person.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.personName, { color: colors.textMain }]} numberOfLines={1}>
              {person}
            </Text>
            <Text style={[styles.personSubCount, { color: colors.textSec }]}>
              {data.subs.length} abonelik
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.personTotal, { color: colors.accent }]}>
              ₺{data.totalShare.toFixed(2)}
            </Text>
            <Text style={[styles.personTotalLabel, { color: colors.textSec }]}>aylık payı</Text>
          </View>
        </View>

        {/* Alt abonelik listesi */}
        {data.subs.map((sub) => {
          const rate = exchangeRates[sub.currency] ?? 1;
          const share = (sub.price * rate) / (sub.sharedWith!.length + 1);
          return (
            <View key={sub.id} style={[styles.personSubRow, { borderTopColor: colors.border }]}>
              <View style={[styles.personSubDot, { backgroundColor: sub.colorCode || colors.accent }]} />
              <Text style={[styles.personSubName, { color: colors.textMain }]} numberOfLines={1}>
                {sub.name}
              </Text>
              <Text style={[styles.personSubShare, { color: colors.textSec }]}>
                ₺{share.toFixed(2)}
              </Text>
            </View>
          );
        })}

        {/* Hatırlatma butonları */}
        <View style={[styles.personActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#25D366' + '22', borderColor: '#25D366' + '44' }]}
            onPress={() => sendWhatsApp(data.subs[0], person)}
          >
            <FontAwesome5 name="whatsapp" size={13} color="#25D366" />
            <Text style={[styles.actionBtnText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>
          {isEmail && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '35' }]}
              onPress={() => sendEmail(data.subs[0], person)}
            >
              <Ionicons name="mail-outline" size={14} color={colors.accent} />
              <Text style={[styles.actionBtnText, { color: colors.accent }]}>E-posta</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* HEADER */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Paylaşımlı Abonelikler</Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>{sharedSubs.length}</Text>
            <Text style={styles.headerStatLabel}>Paylaşılan</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>{peopleMap.length}</Text>
            <Text style={styles.headerStatLabel}>Kişi</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatNum}>₺{totalSharedAmount.toFixed(0)}</Text>
            <Text style={styles.headerStatLabel}>Toplam</Text>
          </View>
        </View>
      </LinearGradient>

      {/* SEKMELER */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        {([['subs', 'Paylaştıklarım'], ['people', 'Kişiler'], ['benimle', 'Benimle']] as [Tab, string][]).map(([tab, label]) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && { borderBottomColor: colors.accent }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === tab ? colors.accent : colors.textSec },
                activeTab === tab && { fontWeight: '800' },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MANAGE PANEL (Seçilmiş abonelik için açık panel) */}
      {managingSub && (
        <ManagePartnersPanel
          sub={managingSub}
          colors={colors}
          onClose={() => setManagingSub(null)}
          onUpdate={handleUpdatePartners}
        />
      )}

      {/* İÇERİK */}
      {activeTab === 'subs' ? (
        <FlatList
          data={sharedSubs}
          keyExtractor={(item) => item.id}
          renderItem={renderSubItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="people-outline" size={52} color={colors.textSec} />
              <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Paylaşım yok</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSec }]}>
                Abonelikler ekranından bir aboneliği düzenleyerek kişi ekleyebilirsin.
              </Text>
            </View>
          }
        />
      ) : activeTab === 'people' ? (
        <FlatList
          data={peopleMap}
          keyExtractor={([person]) => person}
          renderItem={renderPersonItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="person-outline" size={52} color={colors.textSec} />
              <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Kişi yok</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSec }]}>
                Paylaşım eklediğinde burada görünecek.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={sharedWithMe}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.subCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.subColorBar, { backgroundColor: item.colorCode || colors.accent }]} />
              <View style={styles.subCardBody}>
                <View style={styles.subCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.subName, { color: colors.textMain }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.subCategory, { color: colors.textSec }]}>{item.category}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.subTotalPrice, { color: colors.textMain }]}>
                      {item.currency} {item.price.toFixed(2)}
                    </Text>
                    <Text style={[styles.subPerPerson, { color: colors.accent }]}>
                      Kişi başı {item.currency} {(item.price / ((item.sharedWith?.length ?? 0) + 1)).toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.partnersRow}>
                  <Ionicons name="person-circle-outline" size={14} color={colors.textSec} />
                  <Text style={[styles.partnersText, { color: colors.textSec }]}>
                    {item.sharedWith && item.sharedWith.length > 0
                      ? `Sahip + ${item.sharedWith.join(', ')}`
                      : 'Sahibi tarafından paylaşıldı'}
                  </Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="share-social-outline" size={52} color={colors.textSec} />
              <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Paylaşım yok</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSec }]}>
                Başka biri seninle bir abonelik paylaştığında burada görünecek.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 14 },
  headerStats: { flexDirection: 'row', alignItems: 'center' },
  headerStat: { flex: 1, alignItems: 'center' },
  headerStatNum: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600' },
  headerStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Sekmeler
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnText: { fontSize: 14, fontWeight: '600' },

  // Liste
  listContent: { padding: 16, paddingBottom: 40 },

  // Abonelik kartı
  subCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  subColorBar: { width: 5 },
  subCardBody: { flex: 1, padding: 14 },
  subCardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  subName: { fontSize: 15, fontWeight: '700' },
  subCategory: { fontSize: 12, marginTop: 2 },
  subTotalPrice: { fontSize: 14, fontWeight: '700' },
  subPerPerson: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  partnersRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  partnersText: { fontSize: 12, flex: 1 },
  subActions: { flexDirection: 'row', gap: 8 },

  // Kişi kartı
  personCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 14,
  },
  personCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personAvatarText: { fontSize: 18, fontWeight: '800' },
  personName: { fontSize: 15, fontWeight: '700' },
  personSubCount: { fontSize: 12, marginTop: 2 },
  personTotal: { fontSize: 16, fontWeight: '800' },
  personTotalLabel: { fontSize: 11, marginTop: 1 },
  personSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 10,
  },
  personSubDot: { width: 8, height: 8, borderRadius: 4 },
  personSubName: { flex: 1, fontSize: 13 },
  personSubShare: { fontSize: 13, fontWeight: '600' },
  personActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },

  // Aksiyon butonları
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 12, fontWeight: '700' },

  // Panel (Yönet)
  panel: {
    margin: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  panelColorBar: { width: 5, height: 44, borderRadius: 3 },
  panelTitle: { fontSize: 15, fontWeight: '700' },
  panelSub: { fontSize: 12, marginTop: 2 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  addInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 42,
    fontSize: 14,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPartnerText: { fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  partnerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerAvatarText: { fontSize: 14, fontWeight: '700' },
  partnerName: { flex: 1, fontSize: 14 },
  partnerAction: {
    padding: 7,
    borderRadius: 8,
  },
  removeBtn: { padding: 4 },
  saveBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  // Boş durum
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
