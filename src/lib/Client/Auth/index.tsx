// import { PublicKey } from 'o1js';
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
      .get("/users/session/get-message-to-sign/" + publicKey)
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
  if (window.mina?.isPallad) {
    return (await window.mina?.request({
      method: "mina_sign",
      params: { message: data.message },
    })
    ).result;
  } else {
    const signResult: SignedData | ProviderError = await window.mina
      ?.signMessage(data)
      .catch((err: any) => err);
    return signResult;
  }
}

function login(data: SignedData | ProviderError): Promise<string> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .post("/users/register", {
        walletAddress: (data as SignedData).publicKey,
        signature: (data as SignedData).signature,
      })
      .then((response) => {
        // resolve(response.data.message.split(',')[2]);
        resolve(response.data);
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
      .post("/users/logout")
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

interface Session {
  userId: string;
  walletAddress: string;
}

function getSession(): Promise<{ success: boolean; session: Session } | { error: string }> {
  return new Promise((resolve, reject) => {
    const requestBase = new RequestBase();
    requestBase
      .get("/users/session")
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export { getMessage, signMessage, login, getSession, logout };
