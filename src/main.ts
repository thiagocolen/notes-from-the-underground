import { Plugin, WorkspaceLeaf } from "obsidian";
import { NotesTableView, VIEW_TYPE_NOTES_TABLE } from "./NotesTableView";

export default class NotesFromTheUndergroundPlugin extends Plugin {
	async onload() {
		this.registerView(
			VIEW_TYPE_NOTES_TABLE,
			(leaf) => new NotesTableView(leaf),
		);

		// Add ribbon icon for Notes Table
		this.addRibbonIcon(
			"notepad-text-dashed",
			"Notes from the underground",
			() => {
				this.activateNotesTableView();
			},
		);

		this.addCommand({
			id: "open-notes-table",
			name: "Notes from the underground",
			callback: () => {
				this.activateNotesTableView();
			},
		});
	}

	onunload() {}

	async activateNotesTableView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | undefined = undefined;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_NOTES_TABLE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			leaf = workspace.getLeaf(true);
			await leaf.setViewState({
				type: VIEW_TYPE_NOTES_TABLE,
				active: true,
			});
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) workspace.revealLeaf(leaf);
	}
}
