import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/lib/auth';
import { hapticLight, hapticMedium } from '@/lib/haptics';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      hapticMedium();
      router.back();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') setError('No account found with this email');
      else if (code === 'auth/wrong-password') setError('Incorrect password');
      else if (code === 'auth/invalid-email') setError('Invalid email address');
      else if (code === 'auth/email-already-in-use') setError('Email already in use');
      else if (code === 'auth/weak-password') setError('Password must be at least 6 characters');
      else setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email first');
      return;
    }
    try {
      await sendPasswordReset(email);
      setError(null);
    } catch {
      setError('Failed to send reset email');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: 24 }}>
            <ArrowLeft size={24} color={Colors.darkText} />
          </Pressable>

          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ color: Colors.mallardYellow, fontSize: 32, fontWeight: '800' }}>
              HuntManifest
            </Text>
            <Text style={{ color: Colors.darkTextMuted, fontSize: 15, marginTop: 4 }}>
              {isSignUp ? 'Create your account' : 'Welcome back, hunter'}
            </Text>
          </View>

          {error && (
            <View style={{
              backgroundColor: '#991B1B20',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#991B1B40',
            }}>
              <Text style={{ color: Colors.error, fontSize: 13 }}>{error}</Text>
            </View>
          )}

          <View style={{ marginBottom: 16 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.darkCard,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.darkCardBorder,
              paddingHorizontal: 14,
            }}>
              <Mail size={18} color={Colors.darkTextMuted} />
              <TextInput
                style={{
                  flex: 1,
                  color: Colors.darkText,
                  fontSize: 15,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                }}
                placeholder="Email"
                placeholderTextColor={Colors.darkTextSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.darkCard,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.darkCardBorder,
              paddingHorizontal: 14,
            }}>
              <Lock size={18} color={Colors.darkTextMuted} />
              <TextInput
                style={{
                  flex: 1,
                  color: Colors.darkText,
                  fontSize: 15,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                }}
                placeholder="Password"
                placeholderTextColor={Colors.darkTextSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={18} color={Colors.darkTextMuted} />
                ) : (
                  <Eye size={18} color={Colors.darkTextMuted} />
                )}
              </Pressable>
            </View>
          </View>

          {!isSignUp && (
            <Pressable onPress={handleForgotPassword} style={{ marginBottom: 24 }}>
              <Text style={{ color: Colors.mallardYellow, fontSize: 13, textAlign: 'right' }}>
                Forgot password?
              </Text>
            </Pressable>
          )}

          <Pressable
            style={{
              backgroundColor: Colors.mallardYellow,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 24,
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.darkBg} />
            ) : (
              <Text style={{ color: Colors.darkBg, fontSize: 16, fontWeight: '700' }}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              hapticLight();
              setIsSignUp(!isSignUp);
              setError(null);
            }}
          >
            <Text style={{ color: Colors.darkTextMuted, fontSize: 14, textAlign: 'center' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={{ color: Colors.mallardYellow, fontWeight: '600' }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
