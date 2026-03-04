import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '@/app/login';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));


jest.mock('lucide-react-native', () => {
  const Icon = () => null;
  return {
    Mail: Icon,
    Lock: Icon,
    ArrowLeft: Icon,
    Eye: Icon,
    EyeOff: Icon,
  };
});

jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
    sendPasswordReset: jest.fn(),
  }),
}));

describe('Smoke: auth screen', () => {
  it('renders login shell content', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByText('HuntManifest')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });
});
