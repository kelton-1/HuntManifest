import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, LogOut, LogIn, Crosshair, Target, Package, RotateCcw, Database, Trash2, Info } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/lib/auth';
import { useHuntLogs, useInventory } from '@/lib/storage';
import { hapticLight, hapticHeavy, hapticMedium } from '@/lib/haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { logs, clearLogs } = useHuntLogs();
  const { inventory, seedInventory, clearInventory, resetPostHunt } = useInventory();

  const totalHunts = logs.length;
  const totalHarvest = logs.reduce((sum, log) => {
    if (!log.harvests) return sum;
    return sum + log.harvests.reduce((s, h) => s + (h.count || 0), 0);
  }, 0);
  const gearCount = inventory.length;

  const handleSignOut = async () => {
    hapticHeavy();
    await signOut();
    router.back();
  };

  const handleSignIn = () => {
    hapticLight();
    router.push('/login');
  };

  const handleSeedData = () => {
    hapticLight();
    Alert.alert(
      'Seed Demo Data',
      'This will add the master inventory list to your gear. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Data',
          onPress: async () => {
            await seedInventory();
            hapticMedium();
          },
        },
      ]
    );
  };

  const handleClearLogs = () => {
    hapticLight();
    Alert.alert(
      'Clear All Logs',
      'This will permanently delete all your hunt logs. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearLogs();
            hapticHeavy();
          },
        },
      ]
    );
  };

  const handleClearInventory = () => {
    hapticLight();
    Alert.alert(
      'Clear All Inventory',
      'This will permanently delete all your inventory items. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearInventory();
            hapticHeavy();
          },
        },
      ]
    );
  };

  const handleResetPostHunt = () => {
    hapticLight();
    Alert.alert(
      'Reset Post-Hunt',
      'This will set all PACKED items back to READY status.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            await resetPostHunt();
            hapticMedium();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={24} color={Colors.darkText} />
          </Pressable>
          <Text style={{ color: Colors.darkText, fontSize: 24, fontWeight: '800' }}>Profile</Text>
        </View>

        <View style={{
          backgroundColor: Colors.darkCard,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: Colors.darkCardBorder,
          alignItems: 'center',
        }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: Colors.mallardGreen,
            justifyContent: 'center', alignItems: 'center',
            marginBottom: 12,
          }}>
            {user ? (
              <Text style={{ color: Colors.mallardYellow, fontSize: 28, fontWeight: '700' }}>
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'H'}
              </Text>
            ) : (
              <User size={32} color={Colors.mallardYellow} />
            )}
          </View>
          <Text style={{ color: Colors.darkText, fontSize: 20, fontWeight: '700' }}>
            {user?.displayName || user?.email || 'Guest Hunter'}
          </Text>
          {user?.email && (
            <Text style={{ color: Colors.darkTextMuted, fontSize: 13, marginTop: 4 }}>
              {user.email}
            </Text>
          )}
        </View>

        <View style={{
          backgroundColor: Colors.darkCard,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: Colors.darkCardBorder,
        }}>
          <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Season Stats
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.mallardGreen + '40', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <Crosshair size={18} color={Colors.mallardYellow} />
              </View>
              <Text style={{ color: Colors.darkText, fontSize: 22, fontWeight: '800' }}>{totalHunts}</Text>
              <Text style={{ color: Colors.darkTextMuted, fontSize: 11 }}>Hunts</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.mallardGreen + '40', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <Target size={18} color={Colors.success} />
              </View>
              <Text style={{ color: Colors.darkText, fontSize: 22, fontWeight: '800' }}>{totalHarvest}</Text>
              <Text style={{ color: Colors.darkTextMuted, fontSize: 11 }}>Harvest</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.mallardGreen + '40', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <Package size={18} color={Colors.waterBlue} />
              </View>
              <Text style={{ color: Colors.darkText, fontSize: 22, fontWeight: '800' }}>{gearCount}</Text>
              <Text style={{ color: Colors.darkTextMuted, fontSize: 11 }}>Gear</Text>
            </View>
          </View>
        </View>

        <View style={{
          backgroundColor: Colors.darkCard,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: Colors.darkCardBorder,
          marginBottom: 16,
        }}>
          {user ? (
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
              onPress={handleSignOut}
            >
              <LogOut size={20} color={Colors.error} />
              <Text style={{ color: Colors.error, fontSize: 15, fontWeight: '600', marginLeft: 12 }}>
                Sign Out
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
              onPress={handleSignIn}
            >
              <LogIn size={20} color={Colors.mallardYellow} />
              <Text style={{ color: Colors.mallardYellow, fontSize: 15, fontWeight: '600', marginLeft: 12 }}>
                Sign In
              </Text>
            </Pressable>
          )}
        </View>

        <View style={{
          backgroundColor: Colors.darkCard,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: Colors.darkCardBorder,
          marginBottom: 16,
        }}>
          <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, padding: 16, paddingBottom: 8 }}>
            Data Management
          </Text>

          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 8 }}
            onPress={handleSeedData}
          >
            <Database size={20} color={Colors.mallardYellow} />
            <Text style={{ color: Colors.darkText, fontSize: 15, fontWeight: '600', marginLeft: 12 }}>
              Seed Demo Data
            </Text>
          </Pressable>

          <View style={{ height: 1, backgroundColor: Colors.darkCardBorder, marginHorizontal: 16 }} />

          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
            onPress={handleResetPostHunt}
          >
            <RotateCcw size={20} color={Colors.waterBlue} />
            <Text style={{ color: Colors.darkText, fontSize: 15, fontWeight: '600', marginLeft: 12 }}>
              Reset Post-Hunt
            </Text>
            <Text style={{ color: Colors.darkTextMuted, fontSize: 12, marginLeft: 'auto' }}>
              PACKED → READY
            </Text>
          </Pressable>

          <View style={{ height: 1, backgroundColor: Colors.darkCardBorder, marginHorizontal: 16 }} />

          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
            onPress={handleClearLogs}
          >
            <Trash2 size={20} color={Colors.error} />
            <Text style={{ color: Colors.error, fontSize: 15, fontWeight: '600', marginLeft: 12 }}>
              Clear All Logs
            </Text>
          </Pressable>

          <View style={{ height: 1, backgroundColor: Colors.darkCardBorder, marginHorizontal: 16 }} />

          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
            onPress={handleClearInventory}
          >
            <Trash2 size={20} color={Colors.error} />
            <Text style={{ color: Colors.error, fontSize: 15, fontWeight: '600', marginLeft: 12 }}>
              Clear All Inventory
            </Text>
          </Pressable>
        </View>

        <View style={{
          backgroundColor: Colors.darkCard,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: Colors.darkCardBorder,
          marginBottom: 16,
        }}>
          <Text style={{ color: Colors.darkTextMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            App Info
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: Colors.darkTextSecondary, fontSize: 13 }}>Version</Text>
            <Text style={{ color: Colors.darkText, fontSize: 13, fontWeight: '600' }}>1.0.0</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: Colors.darkTextSecondary, fontSize: 13 }}>Build</Text>
            <Text style={{ color: Colors.darkText, fontSize: 13, fontWeight: '600' }}>2025.01</Text>
          </View>
        </View>

        <Text style={{ color: Colors.darkTextMuted, fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          HuntManifest v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
