// API imports
import { getMessage, login, signMessage } from "@/lib/Client/Auth";

export interface ContractStatus {
  status: "worker" | "account" | "compile" | "done";
  error?: {
    code: number;
    message: string;
  };
}

export async function switchChain(chainId: string) {
  const mina = (window as any).mina;

  if (!mina) {
    console.error("Mina extension not found");
    return;
  }

  const chainRes = await mina.switchChain({
    networkID: chainId,
  });

  if (chainRes.networkID !== chainId) {
    console.error("Failed to switch chain");
    return null;
  }

  return chainId;
}

export async function connectWallet() {
  try {
    const mina = (window as any).mina;

    if (!mina) {
      throw new Error("Mina extension not found. Please install the Mina extension and try again.");
    }

    const accounts: string[] = await mina.getAccounts();

    if (accounts.length > 0) {
      await switchChain("mina:mainnet");
      return accounts[0];
    }

    const publicKeyBase58: string = (await mina.requestAccounts())[0];

    const chain = await switchChain("mina:mainnet");

    if (!chain) {
      throw new Error("Failed to switch chain. Please try again.");
    }

    return publicKeyBase58;
  } catch (e) {
    console.error("Failed to connect wallet", e);
    return null;
  }
}

export async function authenticateWallet(address: string) {
  try {
    const message = await getMessage(address!);

    if (!message) {
      throw new Error("Failed to get message! Please try again.");
    }

    const signedData = await signMessage({ message: message });

    if (!signedData) {
      throw new Error("Failed to sign message! Please try again.");
    }

    const session = await login(signedData);

    if (!session) {
      throw new Error("Failed to login! Please try again.");
    }

    return session;
  } catch (e) {
    console.error("Failed to authenticate wallet", e);
    return null;
  }
}

export async function authenticate(session: any) {
  if (session?.walletAddress) {
    return session;
  }

  try {
    const address = await connectWallet();

    if (!address) {
      throw new Error("Failed to connect wallet! Please try again.");
    }

    const session = await authenticateWallet(address);

    if (!session) {
      throw new Error("Failed to authenticate wallet! Please try again.");
    }

    return session;
  } catch (e) {
    console.error("Failed to authenticate", e);
    return null;
  }
}
