export {};

export type NetworkID = `mina:${string}`;

interface ProviderError extends Error {
  message: string; // error message.
  code: number; // error code.
  data?: unknown; // error body.
}

type SwitchChainArgs = {
  readonly networkID: NetworkID;
};

type ChainInfoArgs = {
  networkID: NetworkID;
};

function on(event: "chainChanged", handler: (chainInfo: ChainInfoArgs) => void): void;
function on(event: "accountsChanged", handler: (accounts: string[]) => void): void;

type SignMessageArgs = {
  readonly message: string;
};

interface SignedData {
  publicKey: string;
  data: string;
  signature: {
    field: string;
    scalar: string;
  };
}

type Mina = {
  on: typeof on;
  off: (event: "chainChanged" | "accountsChanged", handler: Function) => void;
  getAccounts: () => Promise<string[]>;
  requestAccounts: () => Promise<string[] | ProviderError>;
  signMessage: (args: SignMessageArgs) => Promise<SignedData | ProviderError>;
  switchChain: (args: SwitchChainArgs) => Promise<ChainInfoArgs | ProviderError>;
};

declare global {
  interface Window {
    mina: Mina | undefined;
  }
}
