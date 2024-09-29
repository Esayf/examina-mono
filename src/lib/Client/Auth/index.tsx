import { AuthSession } from "@/features/client/session";
import RequestBase from "../RequestBase";
export interface SignedData {
  publicKey: string;
  data: string;
  signature: {
    field: string;
    scalar: string;
  };
}

export interface ProviderError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

type SignMessageArgs = {
  message: string;
};

function getMessage(publicKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get("/register/session/get-message-to-sign/" + publicKey)
      .then((response) => {
        // resolve(response.data.message.split(',')[2]);
        resolve(response.data.message);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function signMessage(data: SignMessageArgs) {
  const signResult: SignedData | ProviderError = await window.mina
    ?.signMessage(data)
    .catch((err: any) => err);
  return signResult;
}

function login(data: SignedData): Promise<AuthSession> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .post("/register", {
        walletAddress: data.publicKey,
        signature: data.signature,
      })
      .then((response) => {
        resolve(response.data.session);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function logout() {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get("/register/logout")
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getSession() {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get("/register/session")
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export { getMessage, signMessage, login, getSession, logout };
