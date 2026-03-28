import { ItemView, WorkspaceLeaf } from "obsidian";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { NotesTable, NoteData } from "./NotesTable";
import { parseNote } from "./Parser";

export const VIEW_TYPE_NOTES_TABLE = "notes-table-view";

export class NotesTableView extends ItemView {
    root: Root | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_NOTES_TABLE;
    }

    getDisplayText(): string {
        return "Notes from the underground";
    }

    async onOpen() {
        const files = this.app.vault.getMarkdownFiles();
        
        const data: NoteData[] = await Promise.all(
            files.map(async (file) => {
                const content = await this.app.vault.read(file);
                return parseNote(file, content);
            })
        );

        this.root = createRoot(this.contentEl);
        this.root.render(
            <React.StrictMode>
                <NotesTable app={this.app} data={data} />
            </React.StrictMode>
        );
    }

    async onClose() {
        if (this.root) {
            this.root.unmount();
        }
    }
}
