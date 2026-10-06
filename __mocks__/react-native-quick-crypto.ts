// react-native-quick-crypto is a native Nitro module — it cannot run under
// Jest (no device/simulator host). It advertises itself as "a fast
// implementation of Node's crypto module" (same generateKeyPairSync /
// createSign / createVerify surface), so for unit tests we back it with
// Node's own built-in `crypto`, which implements that exact contract.
// This validates our wrapper code's logic (modules/crypto, modules/c2pa)
// against a real OpenSSL-backed engine — just not the on-device one. The
// on-device implementation can only be exercised via an EAS build.
import crypto from 'crypto';

export default crypto;
