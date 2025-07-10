export function PlanExpired() {
	return (
		<main className="flex flex-col items-center gap-4">
			<h1 className="text-2xl font-bold">Your Plan Has Expired</h1>
			<p className="text-lg">
				Please renew your plan to continue using our services.
			</p>
			<a href="/plans" className="btn btn-primary mt-4">
				Renew Plan
			</a>
		</main>
	);
}
