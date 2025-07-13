import {
	Connection,
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
	sendAndConfirmTransaction,
	Transaction,
} from "@solana/web3.js";
import * as bip39 from "bip39";
import bs58 from "bs58";
import { derivePath } from "ed25519-hd-key";
import { serverEnv } from "./env.server";

class SolanaHDWalletManager {
	private masterSeed: Buffer;
	private connection: Connection;
	private basePath = "m/44'/501'/0'/0'"; // Solana's BIP44 path
	private masterKeypair: Keypair;

	constructor() {
		try {
			const rpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${serverEnv.ALCHEMY_API_KEY}`;
			this.masterSeed = bip39.mnemonicToSeedSync(serverEnv.WALLET_SECRET_PHRASE);
			this.connection = new Connection(rpcUrl);
			const derived = derivePath(this.basePath, this.masterSeed.toString("hex"));
			this.masterKeypair = Keypair.fromSeed(derived.key);
		} catch (error) {
			console.error("Failed to initialize SolanaHDWalletManager:", error);
			throw error;
		}
	}

	getMasterPublicKey(): string {
		try {
			return this.masterKeypair.publicKey.toBase58();
		} catch (error) {
			console.error("Failed to get master public key:", error);
			throw error;
		}
	}

	getMasterMnemonic(): string {
		try {
			return bip39.entropyToMnemonic(this.masterSeed.subarray(0, 16));
		} catch (error) {
			console.error("Failed to get master mnemonic:", error);
			throw error;
		}
	}

	createUserWallet(userId: number): {
		publicKey: string;
		privateKey: string;
		derivationPath: string;
	} {
		try {
			const path = `${this.basePath}/${userId}'`;
			const derived = derivePath(path, this.masterSeed.toString("hex"));
			const keypair = Keypair.fromSeed(derived.key);

			return {
				publicKey: keypair.publicKey.toBase58(),
				privateKey: bs58.encode(keypair.secretKey),
				derivationPath: path,
			};
		} catch (error) {
			console.error(`Failed to create wallet for user ${userId}:`, error);
			throw error;
		}
	}

	getUserKeypair(userId: number): Keypair {
		try {
			const path = `${this.basePath}/${userId}'`;
			const derived = derivePath(path, this.masterSeed.toString("hex"));
			return Keypair.fromSeed(derived.key);
		} catch (error) {
			console.error(`Failed to get keypair for user ${userId}:`, error);
			throw error;
		}
	}

	getUserPublicKey(userId: number): PublicKey {
		try {
			return this.getUserKeypair(userId).publicKey;
		} catch (error) {
			console.error(`Failed to get public key for user ${userId}:`, error);
			throw error;
		}
	}

	getUserMnemonic(userId: number): string {
		try {
			const path = `${this.basePath}/${userId}'`;
			const derived = derivePath(path, this.masterSeed.toString("hex"));
			return bip39.entropyToMnemonic(derived.key.subarray(0, 16));
		} catch (error) {
			console.error(`Failed to get mnemonic for user ${userId}:`, error);
			throw error;
		}
	}

	async getUserBalance(userId: number): Promise<number> {
		try {
			const publicKey = this.getUserPublicKey(userId);
			const balance = await this.connection.getBalance(publicKey);
			return balance / LAMPORTS_PER_SOL;
		} catch (error) {
			console.error(`Failed to get balance for user ${userId}:`, error);
			throw error;
		}
	}

	async sendSolToUser(userId: number, amount: number): Promise<string> {
		try {
			const fromKeypair = this.getUserKeypair(userId);

			const transaction = new Transaction().add(
				SystemProgram.transfer({
					fromPubkey: this.masterKeypair.publicKey,
					toPubkey: fromKeypair.publicKey,
					lamports: amount * LAMPORTS_PER_SOL,
				}),
			);
			const signature = await sendAndConfirmTransaction(
				this.connection,
				transaction,
				[this.masterKeypair],
			);
			console.log(`Successfully sent ${amount} SOL to user ${userId}. Signature: ${signature}`);
			return signature;
		} catch (error) {
			console.error(`Failed to send SOL to user ${userId}:`, error);
			throw error;
		}
	}

	async sendSolFromUser(userId: number, amount: number): Promise<string> {
		try {
			const fromKeypair = this.getUserKeypair(userId);
			const transaction = new Transaction().add(
				SystemProgram.transfer({
					fromPubkey: fromKeypair.publicKey,
					toPubkey: this.masterKeypair.publicKey,
					lamports: amount * LAMPORTS_PER_SOL,
				}),
			);

			const signature = await sendAndConfirmTransaction(
				this.connection,
				transaction,
				[fromKeypair],
			);
			console.log(`Successfully sent ${amount} SOL from user ${userId}. Signature: ${signature}`);
			return signature;
		} catch (error) {
			console.error(`Failed to send SOL from user ${userId}:`, error);
			throw error;
		}
	}

	async withdrawAllFromUser(userId: number): Promise<string> {
		try {
			const fromKeypair = this.getUserKeypair(userId);
			const balance = await this.connection.getBalance(fromKeypair.publicKey);
			const transaction = new Transaction().add(
				SystemProgram.transfer({
					fromPubkey: fromKeypair.publicKey,
					toPubkey: this.masterKeypair.publicKey,
					lamports: balance - 5000,
				}),
			);
			const signature = await sendAndConfirmTransaction(
				this.connection,
				transaction,
				[fromKeypair],
			);
			console.log(`Successfully withdrew all SOL from user ${userId}. Signature: ${signature}`);
			return signature;
		} catch (error) {
			console.error(`Failed to withdraw all SOL from user ${userId}:`, error);
			throw error;
		}
	}
}

export const walletManager = new SolanaHDWalletManager();
