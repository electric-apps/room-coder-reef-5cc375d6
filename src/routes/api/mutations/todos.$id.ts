import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { generateTxId, parseDates } from "@/db/utils";

async function handlePatch({
	request,
	params,
}: {
	request: Request;
	params: Record<string, string>;
}) {
	const body = parseDates(await request.json());
	let txid = 0;
	await db.transaction(async (tx) => {
		await tx
			.update(todos)
			.set({
				title: body.title,
				description: body.description ?? null,
				completed: body.completed,
				priority: body.priority,
				updated_at: new Date(),
			})
			.where(eq(todos.id, params.id));
		txid = await generateTxId(tx);
	});
	return Response.json({ txid });
}

async function handleDelete({ params }: { params: Record<string, string> }) {
	let txid = 0;
	await db.transaction(async (tx) => {
		await tx.delete(todos).where(eq(todos.id, params.id));
		txid = await generateTxId(tx);
	});
	return Response.json({ txid });
}

export const Route = createFileRoute("/api/mutations/todos/$id")({
	server: {
		handlers: {
			PATCH: handlePatch,
			DELETE: handleDelete,
		},
	},
});
