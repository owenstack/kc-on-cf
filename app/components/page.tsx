import { useNavigate } from 'react-router';
import {
  hideBackButton,
  onBackButtonClick,
  showBackButton,
} from '@telegram-apps/sdk-react';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';

export function PageWrapper({
  children,
  back = true,
}: PropsWithChildren<{ back?: boolean }>) {
  const navigate = useNavigate();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const detachRef = useRef<VoidFunction | null>(null);
  useEffect(() => {
    if (!isClient) return;
    if (!back) {
      hideBackButton();
      return;
    }

    showBackButton();
    detachRef.current = onBackButtonClick(() => navigate(-1));

    return () => {
      detachRef.current?.();
      hideBackButton();
    };
  }, [back, navigate, isClient]);
  return <>{children}</>;
}