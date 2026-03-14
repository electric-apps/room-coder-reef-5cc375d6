import {
	AlertDialog,
	Badge,
	Button,
	Checkbox,
	Container,
	Dialog,
	Flex,
	Heading,
	IconButton,
	Select,
	Spinner,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { todosCollection } from "@/db/collections/todos";
import type { Todo } from "@/db/zod-schemas";

export const Route = createFileRoute("/")({
	ssr: false,
	loader: async () => {
		await todosCollection.preload();
		return null;
	},
	component: TodosPage,
});

type Filter = "all" | "active" | "completed";
type Priority = "low" | "medium" | "high";

const PRIORITY_COLORS: Record<Priority, "gray" | "orange" | "red"> = {
	low: "gray",
	medium: "orange",
	high: "red",
};

function TodosPage() {
	const [filter, setFilter] = useState<Filter>("all");
	const [addOpen, setAddOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);

	const { data: todos, isLoading } = useLiveQuery(
		(q) => {
			const query = q.from({ todo: todosCollection });
			if (filter === "active") {
				return query
					.where(({ todo }) => eq(todo.completed, false))
					.orderBy(({ todo }) => todo.created_at, "desc");
			}
			if (filter === "completed") {
				return query
					.where(({ todo }) => eq(todo.completed, true))
					.orderBy(({ todo }) => todo.created_at, "desc");
			}
			return query.orderBy(({ todo }) => todo.created_at, "desc");
		},
		[filter],
	);

	const handleToggle = (todo: Todo) => {
		todosCollection.update(todo.id, (draft) => {
			draft.completed = !draft.completed;
		});
	};

	const handleDelete = () => {
		if (deleteTarget) {
			todosCollection.delete(deleteTarget.id);
			setDeleteTarget(null);
		}
	};

	return (
		<Container size="2" py="6">
			<Flex direction="column" gap="5">
				{/* Header */}
				<Flex justify="between" align="center">
					<Flex align="center" gap="2">
						<CheckSquare size={24} color="var(--accent-9)" />
						<Heading size="7">Todo App</Heading>
					</Flex>
					<Button onClick={() => setAddOpen(true)}>
						<Plus size={16} /> Add Todo
					</Button>
				</Flex>

				{/* Filter tabs */}
				<Flex gap="2">
					{(["all", "active", "completed"] as Filter[]).map((f) => (
						<Button
							key={f}
							variant={filter === f ? "solid" : "soft"}
							color={filter === f ? undefined : "gray"}
							onClick={() => setFilter(f)}
							size="2"
						>
							{f.charAt(0).toUpperCase() + f.slice(1)}
						</Button>
					))}
				</Flex>

				{/* Todo list */}
				{isLoading ? (
					<Flex align="center" justify="center" py="9">
						<Spinner size="3" />
					</Flex>
				) : todos.length === 0 ? (
					<Flex direction="column" align="center" gap="3" py="9">
						<CheckSquare size={48} strokeWidth={1} color="var(--gray-8)" />
						<Text size="4" color="gray">
							{filter === "all"
								? "No todos yet"
								: filter === "active"
									? "No active todos"
									: "No completed todos"}
						</Text>
						{filter === "all" && (
							<Button variant="soft" onClick={() => setAddOpen(true)}>
								Create your first todo
							</Button>
						)}
					</Flex>
				) : (
					<Flex direction="column" gap="2">
						{todos.map((todo) => (
							<TodoItem
								key={todo.id}
								todo={todo}
								onToggle={handleToggle}
								onDelete={setDeleteTarget}
							/>
						))}
					</Flex>
				)}
			</Flex>

			{/* Add dialog */}
			<AddTodoDialog open={addOpen} onOpenChange={setAddOpen} />

			{/* Delete confirmation */}
			<AlertDialog.Root
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialog.Content maxWidth="400px">
					<AlertDialog.Title>Delete Todo</AlertDialog.Title>
					<AlertDialog.Description size="2">
						Are you sure you want to delete "{deleteTarget?.title}"? This action
						cannot be undone.
					</AlertDialog.Description>
					<Flex gap="3" justify="end" mt="4">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button color="red" onClick={handleDelete}>
								Delete
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Container>
	);
}

function TodoItem({
	todo,
	onToggle,
	onDelete,
}: {
	todo: Todo;
	onToggle: (todo: Todo) => void;
	onDelete: (todo: Todo) => void;
}) {
	return (
		<Flex
			align="center"
			gap="3"
			p="3"
			style={{
				borderRadius: "var(--radius-3)",
				background: "var(--color-panel)",
				border: "1px solid var(--gray-a5)",
			}}
		>
			<Checkbox
				checked={todo.completed}
				onCheckedChange={() => onToggle(todo)}
				size="2"
			/>
			<Flex direction="column" gap="1" flexGrow="1">
				<Text
					weight="medium"
					style={{
						textDecoration: todo.completed ? "line-through" : "none",
						color: todo.completed ? "var(--gray-9)" : undefined,
					}}
				>
					{todo.title}
				</Text>
				{todo.description && (
					<Text size="2" color="gray">
						{todo.description}
					</Text>
				)}
			</Flex>
			<Badge
				variant="soft"
				color={PRIORITY_COLORS[todo.priority as Priority] ?? "gray"}
				size="1"
			>
				{todo.priority}
			</Badge>
			<IconButton
				size="1"
				variant="ghost"
				color="red"
				onClick={() => onDelete(todo)}
			>
				<Trash2 size={14} />
			</IconButton>
		</Flex>
	);
}

function AddTodoDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<Priority>("medium");

	const handleSubmit = () => {
		if (!title.trim()) return;
		const now = new Date();
		todosCollection.insert({
			id: crypto.randomUUID(),
			title: title.trim(),
			description: description.trim() || null,
			completed: false,
			priority,
			created_at: now,
			updated_at: now,
		});
		setTitle("");
		setDescription("");
		setPriority("medium");
		onOpenChange(false);
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Content maxWidth="450px">
				<Dialog.Title>New Todo</Dialog.Title>
				<Flex direction="column" gap="4" mt="4">
					<Flex direction="column" gap="1">
						<Text size="2" weight="medium" as="div">
							Title *
						</Text>
						<TextField.Root
							aria-label="Todo title"
							placeholder="What needs to be done?"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
							autoFocus
						/>
					</Flex>
					<Flex direction="column" gap="1">
						<Text size="2" weight="medium" as="div">
							Description
						</Text>
						<TextArea
							aria-label="Todo description"
							placeholder="Add details (optional)"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</Flex>
					<Flex direction="column" gap="1">
						<Text size="2" weight="medium" as="div">
							Priority
						</Text>
						<Select.Root
							value={priority}
							onValueChange={(v) => setPriority(v as Priority)}
						>
							<Select.Trigger style={{ width: "100%" }} />
							<Select.Content>
								<Select.Item value="low">Low</Select.Item>
								<Select.Item value="medium">Medium</Select.Item>
								<Select.Item value="high">High</Select.Item>
							</Select.Content>
						</Select.Root>
					</Flex>
					<Flex gap="3" justify="end" mt="2">
						<Dialog.Close>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</Dialog.Close>
						<Button onClick={handleSubmit} disabled={!title.trim()}>
							Add Todo
						</Button>
					</Flex>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	);
}
