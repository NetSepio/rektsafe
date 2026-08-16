"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

type ConnectWalletButtonProps = React.ComponentProps<typeof Button> & {
  children?: ReactNode;
};

function ConnectWalletButtonInner({
  children,
  ...props
}: ConnectWalletButtonProps) {
  const { open } = useAppKit();

  return (
    <Button onClick={() => open()} {...props}>
      {children || (
        <>
          <Wallet className="w-5 h-5 mr-2" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}

export function ConnectWalletButton(props: ConnectWalletButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button disabled {...props}>
        {props.children || (
          <>
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return <ConnectWalletButtonInner {...props} />;
}
