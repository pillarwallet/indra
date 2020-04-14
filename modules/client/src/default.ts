import { ConnextStore } from "@connext/store";
import { ClientOptions, StoreTypes, IClientStore } from "@connext/types";
import { getRandomPrivateKey, removeUndefinedFields } from "@connext/utils";

const CONNEXT_DEFAULT_SIGNER_KEY = "CONNEXT_DEFAULT_SIGNER";

const getGeneratedSigner = (): string => {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return getRandomPrivateKey();
  }
  let signer: string = window.localStorage.getItem(CONNEXT_DEFAULT_SIGNER_KEY);
  if (!signer) {
    signer = getRandomPrivateKey();
    window.localStorage.setItem(CONNEXT_DEFAULT_SIGNER_KEY, signer);
  }
  return signer;
};

const getUrlOptions = (network: string): { ethProviderUrl: string; nodeUrl: string } => {
  let urlOptions;

  if (network.toLowerCase() === "localhost") {
    urlOptions = { ethProviderUrl: `http://localhost:8545`, nodeUrl: `http://localhost:8080` };
  } else {
    const baseUrl =
      network.toLowerCase() === "mainnet"
        ? "indra.connext.network/api"
        : network.toLowerCase() === "rinkeby"
        ? "rinkeby.indra.connext.network/api"
        : null;
    if (!baseUrl) {
      throw new Error(`Provided network (${network.toLowerCase()}) is not supported`);
    }
    urlOptions = {
      ethProviderUrl: `https://${baseUrl}/ethprovider`,
      nodeUrl: `https://${baseUrl}`,
    };
  }
  return urlOptions;
};

const getOverrideOptions = (_opts?: Partial<ClientOptions>): Partial<ClientOptions> | undefined => {
  if (!_opts) {
    return undefined;
  }
  const opts = removeUndefinedFields(_opts);
  if (!Object.keys(opts).length) {
    return undefined;
  }
  return opts;
};

export const getDefaultStore = (opts: Partial<ClientOptions>): IClientStore => {
  const storeType = opts && opts.storeType ? opts.storeType : StoreTypes.LocalStorage;
  const backupService = opts && opts.backupService ? opts.backupService : null;
  return new ConnextStore(storeType, { backupService });
};

export const getDefaultOptions = (
  network: string,
  _opts?: Partial<ClientOptions>,
): ClientOptions => {
  const urlOptions = getUrlOptions(network);
  const opts = getOverrideOptions(_opts);
  const store = opts
    ? opts.store || getDefaultStore(opts)
    : new ConnextStore(StoreTypes.LocalStorage);
  const signer =
    opts && opts.signer
      ? opts.signer
      : network.toLowerCase() !== "mainnet"
      ? getGeneratedSigner()
      : undefined;
  if (!signer) {
    throw new Error("Signer required for Mainnet");
  }
  return {
    signer,
    store,
    ...urlOptions,
    ...opts,
  };
};
