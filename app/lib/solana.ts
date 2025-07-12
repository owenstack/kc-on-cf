import { env } from "cloudflare:workers";
import {
	createAssociatedTokenAccountInstruction,
	createTransferInstruction,
	getAssociatedTokenAddress,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
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

class SolanaHDWalletManager {
	private masterSeed: Buffer;
	private connection: Connection;
	private basePath = "m/44'/501'/0'/0'"; // Solana's BIP44 path
	private masterKeypair: Keypair;

	constructor() {
		const rpcUrl = `https://solana-mainnet.g.alchemy.com/v2/${env.VITE_ALCHEMY_API_KEY}`;
		this.masterSeed = bip39.mnemonicToSeedSync(env.WALLET_SECRET_PHRASE);
		this.connection = new Connection(rpcUrl);
		const derived = derivePath(this.basePath, this.masterSeed.toString("hex"));
		this.masterKeypair = Keypair.fromSeed(derived.key);
	}

	getMasterPublicKey(): string {
		return this.masterKeypair.publicKey.toBase58();
	}

	getMasterMnemonic(): string {
		return bip39.entropyToMnemonic(this.masterSeed.subarray(0, 16));
	}

	createUserWallet(userId: number): {
		publicKey: string;
		privateKey: string;
		derivationPath: string;
	} {
		const path = `${this.basePath}/${userId}'`;
		const derived = derivePath(path, this.masterSeed.toString("hex"));
		const keypair = Keypair.fromSeed(derived.key);

		return {
			publicKey: keypair.publicKey.toBase58(),
			privateKey: bs58.encode(keypair.secretKey),
			derivationPath: path,
		};
	}

	getUserKeypair(userId: number): Keypair {
		const path = `${this.basePath}/${userId}'`;
		const derived = derivePath(path, this.masterSeed.toString("hex"));
		return Keypair.fromSeed(derived.key);
	}

	getUserPublicKey(userId: number): PublicKey {
		return this.getUserKeypair(userId).publicKey;
	}

	getUserMnemonic(userId: number): string {
		const path = `${this.basePath}/${userId}'`;
		const derived = derivePath(path, this.masterSeed.toString("hex"));
		return bip39.entropyToMnemonic(derived.key.subarray(0, 16));
	}

	async getUserBalance(userId: number): Promise<number> {
		const publicKey = this.getUserPublicKey(userId);
		const balance = await this.connection.getBalance(publicKey);
		return balance / LAMPORTS_PER_SOL;
	}

	async getUserTokenAccounts(userId: number) {
		const publicKey = this.getUserPublicKey(userId);
		return await this.connection.getTokenAccountsByOwner(publicKey, {
			programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
		});
	}

	async sendSolToUser(userId: number, amount: number): Promise<string> {
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

		return signature;
	}

	async sendSolFromUser(userId: number, amount: number): Promise<string> {
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

		return signature;
	}

	async withdrawAllFromUser(userId: number): Promise<string> {
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

		return signature;
	}

	async sendTokenFromUser(
		userId: number,
		mintAddress: string,
		amount: number,
		decimals = 9,
	): Promise<string> {
		const fromKeypair = this.getUserKeypair(userId);
		const mintPublicKey = new PublicKey(mintAddress);

		const fromTokenAccount = await getAssociatedTokenAddress(
			mintPublicKey,
			fromKeypair.publicKey,
		);

		const toTokenAccount = await getAssociatedTokenAddress(
			mintPublicKey,
			this.masterKeypair.publicKey,
		);

		const transaction = new Transaction().add(
			createTransferInstruction(
				fromTokenAccount,
				toTokenAccount,
				fromKeypair.publicKey,
				amount * 10 ** decimals,
				[],
				TOKEN_PROGRAM_ID,
			),
		);

		const signature = await sendAndConfirmTransaction(
			this.connection,
			transaction,
			[fromKeypair],
		);

		return signature;
	}

	async createUserTokenAccount(userId: number, mintAddress: string) {
		const userKeypair = this.getUserKeypair(userId);
		const mintPublicKey = new PublicKey(mintAddress);

		const associatedTokenAddress = await getAssociatedTokenAddress(
			mintPublicKey,
			userKeypair.publicKey,
		);

		const transaction = new Transaction().add(
			createAssociatedTokenAccountInstruction(
				userKeypair.publicKey,
				associatedTokenAddress,
				userKeypair.publicKey,
				mintPublicKey,
			),
		);

		const signature = await sendAndConfirmTransaction(
			this.connection,
			transaction,
			[userKeypair],
		);

		return {
			signature,
			tokenAccount: associatedTokenAddress.toBase58(),
		};
	}
}

export const walletManager = new SolanaHDWalletManager();
