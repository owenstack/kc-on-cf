export function EnvUnsupported() {
	return (
		<div className="flex flex-col items-center justify-center h-screen text-center">
			<h1>Oops</h1>
			<p>You are using too old Telegram client to run this application</p>
			<img
				alt="Telegram sticker"
				src="https://xelene.me/telegram.gif"
				style={{ display: "block", width: "144px", height: "144px" }}
			/>
		</div>
	);
}
