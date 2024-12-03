export { };

export type NetworkID = `mina:${string}`;

export interface ProviderError extends Error {
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
  signedData: string;
  signature: {
    field: string;
    scalar: string;
  };
}
export interface SendTransactionArgs {
  readonly onlySign?: boolean; // auro-extension-wallet support from V2.2.16. 
  readonly nonce?: number; // auro-extension-wallet support from V2.3.0. 
  readonly transaction: string | object;
  readonly feePayer?: {
    readonly fee?: number;
    readonly memo?: string;
  };
}

type SendTransactionHash = {
  hash: string;
};

type SignedZkappCommand = {
  signedData: string; // results of JSON.stringify( signZkappCommand().data )
};

type SendZkTransactionResult = SendTransactionResult | SignedZkappCommand

type Mina = {
  on: typeof on;
  off: (event: "chainChanged" | "accountsChanged", handler: Function) => void;
  getAccounts: () => Promise<string[]>;
  requestAccounts: () => Promise<string[] | ProviderError>;
  signMessage: (args: SignMessageArgs) => Promise<SignedData | ProviderError>;
  switchChain: (args: SwitchChainArgs) => Promise<ChainInfoArgs | ProviderError>;
  signJsonMessage: (json: any) => Promise<SignedData | ProviderError>;
  sendTransaction: (args: SendTransactionArgs) => Promise<SignedData | ProviderError>;
};

declare global {
  interface Window {
    mina: Mina | undefined;
  }
}
