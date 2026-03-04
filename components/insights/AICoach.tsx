import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Sparkles, RotateCcw, AlertCircle, Send } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticLight } from '@/lib/haptics';
import { generateInsightsAnalysis, InsightsSummary } from '@/lib/gemini';
import { InsightCard } from '@/components/InsightCard';
import { Colors } from '@/constants/Colors';

const CACHE_KEY = 'timber_insights_ai_cache';
const CACHE_TTL = 60 * 60 * 1000;

interface CachedResponse {
  response: string;
  timestamp: number;
  logCount: number;
}

async function getCache(logCount: number): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedResponse = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    if (cached.logCount !== logCount) return null;
    return cached.response;
  } catch {
    return null;
  }
}

async function setCache(response: string, logCount: number) {
  try {
    const entry: CachedResponse = { response, timestamp: Date.now(), logCount };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {}
}

interface AICoachProps {
  summary: InsightsSummary;
  logCount: number;
}

export function AICoach({ summary, logCount }: AICoachProps) {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (force = false) => {
    if (!force) {
      const cached = await getCache(logCount);
      if (cached) {
        setResponse(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const text = await generateInsightsAnalysis(summary);
      setResponse(text);
      await setCache(text, logCount);
    } catch (err) {
      if (err instanceof Error && err.message === 'RATE_LIMIT') {
        setError('AI Guide is thinking... Try again in a moment.');
      } else {
        setError('Unable to generate analysis right now.');
      }
    } finally {
      setLoading(false);
    }
  }, [summary, logCount]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return (
    <InsightCard title="AI Guide" icon={Sparkles}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Powered by Gemini</Text>
        </View>
        {response && !loading && (
          <Pressable
            onPress={() => { hapticLight(); fetchAnalysis(true); }}
            style={styles.refreshBtn}
          >
            <RotateCcw size={14} color={Colors.darkTextMuted} />
          </Pressable>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.darkTextMuted} />
            <Text style={styles.loadingText}>Analyzing your season...</Text>
          </View>
          <View style={styles.shimmerLines}>
            <View style={[styles.shimmerLine, { width: '100%' }]} />
            <View style={[styles.shimmerLine, { width: '80%' }]} />
            <View style={[styles.shimmerLine, { width: '60%' }]} />
          </View>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color={Colors.darkTextMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => fetchAnalysis(true)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {response && !loading && !error && (
        <Text style={styles.responseText}>{response}</Text>
      )}

      <View style={styles.inputWrapper}>
        <Sparkles size={16} color={Colors.mallardGreen} />
        <TextInput
          placeholder="Ask about your season..."
          placeholderTextColor={Colors.darkTextMuted}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={() => { hapticLight(); fetchAnalysis(true); }}
        />
        <Pressable
          onPress={() => { hapticLight(); fetchAnalysis(true); }}
          style={styles.sendBtn}
        >
          <Send size={14} color={Colors.mallardGreen} />
        </Pressable>
      </View>
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: `${Colors.darkCardBorder}80`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    color: Colors.darkTextMuted,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8,
  },
  loadingContainer: {
    gap: 12,
    paddingVertical: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.darkTextMuted,
  },
  shimmerLines: {
    gap: 8,
  },
  shimmerLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: `${Colors.darkCardBorder}80`,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.darkTextMuted,
    flex: 1,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.mallardGreen,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.darkText,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.darkCardBorder}80`,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.darkCardBorder,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkText,
    padding: 0,
  },
  sendBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: `${Colors.mallardGreen}1A`,
  },
});
