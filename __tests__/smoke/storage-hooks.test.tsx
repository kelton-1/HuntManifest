import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInventory, useHuntLogs } from '@/lib/storage';
import { useUserProfile } from '@/lib/useUserProfile';
import { InventoryItem, HuntLog } from '@/lib/types';

jest.mock('@/lib/auth', () => ({
  useAuth: jest.fn(() => ({ user: null, loading: false })),
}));

jest.mock('@/lib/firestore', () => ({
  getUserProfile: jest.fn(),
  createUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('Smoke: storage-backed core flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
      if (key === 'timber_inventory_v2') return '[]';
      if (key === 'timber_hunt_logs') return '[]';
      return null;
    });
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('adds and lists inventory items', async () => {
    const { result } = renderHook(() => useInventory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const item: InventoryItem = {
      id: 'seed-id',
      name: 'Test Decoy Bag',
      category: 'Decoy',
      quantity: 1,
      status: 'READY',
      specs: {},
    };

    await act(async () => {
      await result.current.addItem(item);
    });

    expect(result.current.inventory.some((entry) => entry.name === 'Test Decoy Bag')).toBe(true);
  });

  it('adds and lists hunt logs', async () => {
    const { result } = renderHook(() => useHuntLogs());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const log: HuntLog = {
      id: 'log-1',
      date: '2026-01-01',
      location: { name: 'Timber Hole' },
      weather: {
        temperature: 40,
        windSpeed: 5,
        windDirection: 'N',
        skyCondition: 'Clear',
      },
      harvests: [],
      notes: 'Quick morning hunt',
    };

    await act(async () => {
      await result.current.addLog(log);
    });

    expect(result.current.logs.some((entry) => entry.location.name === 'Timber Hole')).toBe(true);
  });

  it('loads profile from local fallback when logged out', async () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'timber_user_profile') {
        return JSON.stringify({ hunterName: 'Fallback Hunter', temperatureUnit: 'C' });
      }
      return null;
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.initialized).toBe(true));

    expect(result.current.profile.hunterName).toBe('Fallback Hunter');
    expect(result.current.profile.temperatureUnit).toBe('C');
  });
});
