import { MiniKit } from "@worldcoin/minikit-js";
import { signIn } from "next-auth/react";
import { getNewNonces } from "./server-helpers";

/**
 * Authenticates a user via their wallet using a nonce-based challenge-response mechanism.
 *
 * This function generates a unique `nonce` and requests the user to sign it with their wallet,
 * producing a `signedNonce`. The `signedNonce` ensures the response we receive from wallet auth
 * is authentic and matches our session creation.
 *
 * @returns {Promise<SignInResponse>} The result of the sign-in attempt.
 * @throws {Error} If wallet authentication fails at any step.
 */
export const walletAuth = async () => {
  const { nonce, signedNonce } = await getNewNonces();

  const result = await MiniKit.commandsAsync.walletAuth({
    nonce,
    expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
    statement: `Authenticate (${crypto.randomUUID().replace(/-/g, "")}).`,
  });
  console.log("Result", result);
  if (!result) {
    throw new Error("No response from wallet auth");
  }

  if (result.finalPayload.status !== "success") {
    console.error(
      "Wallet authentication failed",
      result.finalPayload.error_code
    );
    return;
  } else {
    console.log(result.finalPayload);
  }

  // Sign in - NextAuth should use AUTH_URL from env, but we'll handle redirect manually to be safe
  const signInResult = await signIn("credentials", {
    redirect: false, // Disable auto-redirect so we can control it
    nonce,
    signedNonce,
    finalPayloadJson: JSON.stringify(result.finalPayload),
  });

  // Manually redirect using current origin (should be ngrok URL if accessed correctly)
  if (signInResult?.ok) {
    window.location.href = "/";
  } else if (signInResult?.error) {
    console.error("Sign in error:", signInResult.error);
  }
};
