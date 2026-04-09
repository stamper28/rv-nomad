import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock expo-secure-store
vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn().mockResolvedValue(null),
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}));

// Mock react-native Platform
vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

// Mock oauth constants
vi.mock("@/constants/oauth", () => ({
  SESSION_TOKEN_KEY: "app_session_token",
  USER_INFO_KEY: "manus-runtime-user-info",
}));

describe("Auth SecureStore iOS 26 Compatibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pass keychainService option to getItemAsync", async () => {
    const SecureStore = await import("expo-secure-store");
    const { getSessionToken } = await import("../lib/_core/auth");

    await getSessionToken();

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
      "app_session_token",
      expect.objectContaining({
        keychainService: expect.any(String),
      })
    );
  });

  it("should pass keychainService option to setItemAsync", async () => {
    const SecureStore = await import("expo-secure-store");
    const { setSessionToken } = await import("../lib/_core/auth");

    await setSessionToken("test-token-12345678901234567890");

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "app_session_token",
      "test-token-12345678901234567890",
      expect.objectContaining({
        keychainService: expect.any(String),
      })
    );
  });

  it("should pass keychainService option to deleteItemAsync", async () => {
    const SecureStore = await import("expo-secure-store");
    const { removeSessionToken } = await import("../lib/_core/auth");

    await removeSessionToken();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "app_session_token",
      expect.objectContaining({
        keychainService: expect.any(String),
      })
    );
  });

  it("should use bundle ID as keychainService value", async () => {
    const SecureStore = await import("expo-secure-store");
    const { getSessionToken } = await import("../lib/_core/auth");

    await getSessionToken();

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
      "app_session_token",
      expect.objectContaining({
        keychainService: "space.manus.rv.nomad.t20260404012848",
      })
    );
  });

  it("should not crash if SecureStore throws an error", async () => {
    const SecureStore = await import("expo-secure-store");
    vi.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(
      new Error("Keychain access denied")
    );

    const { getSessionToken } = await import("../lib/_core/auth");
    const result = await getSessionToken();

    // Should return null instead of crashing
    expect(result).toBeNull();
  });

  it("should pass keychainService to getUserInfo", async () => {
    const SecureStore = await import("expo-secure-store");
    const { getUserInfo } = await import("../lib/_core/auth");

    await getUserInfo();

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
      "manus-runtime-user-info",
      expect.objectContaining({
        keychainService: "space.manus.rv.nomad.t20260404012848",
      })
    );
  });
});
