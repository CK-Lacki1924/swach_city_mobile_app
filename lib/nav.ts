import { useRouter } from 'expo-router';

export function useAppNavigation() {
  const router = useRouter();
  return {
    push: (href: string) => router.push(href),
    replace: (href: string) => router.replace(href),
    back: () => router.back(),
    canGoBack: () => router.canGoBack(),
  };
}
