// API imports
import { getMessage, login, signMessage } from "@/lib/Client/Auth";

export interface ContractStatus {
  status: "worker" | "account" | "compile" | "done";
  error?: {
    code: number;
    message: string;
  };
}

export async function switchChain(chainId: `mina:${string}`) {
  const mina = window.mina;

  if (!mina) {
    console.error("Mina extension not found");
    return;
  }

  if (mina.isAuro) {
    const chainRes = await mina.switchChain({
      networkID: chainId,
    });

    if ("code" in chainRes) {
      console.error("Failed to switch chain", chainRes.code);
      return null;
    }

    if (chainRes.networkID !== chainId) {
      console.error("Failed to switch chain");
      return null;
    }

    return chainId;
  } else {
    const currentChain = (
      await mina.request({
        method: "mina_chainId",
      })
    ).result;
    if (currentChain !== "29936104443aaf264a7f0192ac64b1c7173198c1ed404c1bcff5e562e05eb7f6") {
      throw new Error(`This network is not supported. Switch to devnet to continue.`);
    }
  }
}

export async function connectWallet() {
  try {
    const mina = window.mina;

    if (!mina) {
      throw new Error("Mina extension not found. Please install the Mina extension and try again.");
    }
    console.log("THIS IS MINA", mina);

    if (mina.isAuro || !mina.isPallad) {
      const accounts: string[] = await mina.getAccounts();

      if (accounts.length > 0) {
        await switchChain("mina:devnet");
        return accounts[0];
      }

      const minaAccounts = await mina.requestAccounts();

      if ("code" in minaAccounts) {
        throw new Error("Failed to connect wallet. Please try again.");
      }

      const publicKeyBase58: string = minaAccounts[0];
      const chain = await switchChain("mina:devnet");
      if (!chain) {
        throw new Error("Failed to switch chain. Please try again.");
      }

      return publicKeyBase58;
    }
    if (mina.isPallad) {
      const currentChainRequest = await mina.request({
        method: "mina_chainId",
      });
      console.log("CURRENT CHAIN REQUEST", currentChainRequest);
      const currentChain = currentChainRequest.result;
      if (currentChain !== "29936104443aaf264a7f0192ac64b1c7173198c1ed404c1bcff5e562e05eb7f6") {
        await switchChain("mina:devnet");
      }

      const accounts: string[] = (
        await mina.request({
          method: "mina_accounts",
        })
      ).result;
      console.log(accounts);

      if (accounts.length > 0) {
        return accounts[0];
      }
    }
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
