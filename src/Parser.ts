import { TFile } from "obsidian";
import { NoteData } from "./NotesTable";

export function parseNote(file: TFile, content: string): NoteData {
    const lines = content.split('\n');
    const firstLine = lines[0] ?? '';
    const title = firstLine.replace(/^#\s+/, '').trim() || file.basename;
    
    const rawPath = file.parent?.path === "/" ? "" : file.parent?.path || "";
    const noteData: NoteData = {
        file: file,
        path: rawPath ? `${rawPath} Folder` : "Root Folder",
        title: title,
        priority: '',
        progress: '',
        tags: [],
        description: '',
        link: '',
        date: ''
    };

    const keys = ['Priority', 'Progress', 'Tags', 'Description', 'Link', 'Date'];
    let lastPropertyLine = 0;

    for (let i = 1; i < lines.length; i++) {
        const lineRaw = lines[i];
        if (lineRaw === undefined) continue;
        const line = lineRaw.trim();
        if (!line) continue;

        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const keyCandidate = line.substring(0, colonIndex).trim();
            const valueCandidate = line.substring(colonIndex + 1).trim();

            const matchedKey = keys.find(k => k.toLowerCase() === keyCandidate.toLowerCase());

            if (matchedKey) {
                const key = matchedKey.toLowerCase() as keyof Omit<NoteData, 'file' | 'title' | 'tags'>;
                if (matchedKey === 'Tags') {
                    let tagsValue = valueCandidate;
                    if (tagsValue.startsWith('[') && tagsValue.endsWith(']')) {
                        tagsValue = tagsValue.substring(1, tagsValue.length - 1);
                    }
                    noteData.tags = tagsValue.split(',').map(t => t.trim()).filter(t => t !== '');
                } else {
                    noteData[key] = valueCandidate;
                }
                lastPropertyLine = i;
            }
        }
    }

    // "the description is the content of the file after the properties"
    // If description property was found, it might be overwritten if we strictly follow "content after properties"
    // But usually "Description: ..." is one of the properties.
    // Let's re-read: "the description is the content of the file after the properties"
    // If the 'Description' property is empty, let's take everything after the last property line.
    if (!noteData.description) {
        const descriptionLines = lines.slice(lastPropertyLine + 1).join('\n').trim();
        if (descriptionLines) {
            noteData.description = descriptionLines;
        }
    }

    return noteData;
}
