import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { generateTxId, parseDates } from "@/db/utils";

async function handlePost({ request }: { request: Request }) {
	const body = parseDates(await request.json());
	let txid = 0;
	await db.transaction(async (tx) => {
		await tx.insert(todos).values({
			id: body.id,
			title: body.title,
			description: body.description ?? null,
			completed: body.completed ?? false,
			priority: body.priority ?? "medium",
			created_at: body.created_at,
			updated_at: body.updated_at,
		});
		txid = await generateTxId(tx);
	});
	return Response.json({ txid });
}

export const Route = createFileRoute("/api/mutations/todos")({
	server: {
		handlers: {
			POST: handlePost,
		},
	},
});
