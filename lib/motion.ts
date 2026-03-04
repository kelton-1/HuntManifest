import { withSpring, WithSpringConfig } from 'react-native-reanimated';

export const snappyConfig: WithSpringConfig = { stiffness: 400, damping: 30 };
export const smoothConfig: WithSpringConfig = { stiffness: 300, damping: 26 };
export const gentleConfig: WithSpringConfig = { stiffness: 200, damping: 20 };

export const STAGGER_DELAY = 80;

export function springValue(toValue: number, config: WithSpringConfig = smoothConfig) {
  return withSpring(toValue, config);
}
