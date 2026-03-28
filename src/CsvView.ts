import { TextFileView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_CSV = "csv-view";

export class CsvView extends TextFileView {
    parsedData: string[][] = [];
    headers: string[] = [];
    sortColumn: number | null = null;
    sortOrder: "asc" | "desc" = "asc";
    filters: Map<number, string> = new Map();

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_CSV;
    }

    getDisplayText(): string {
        return this.file ? this.file.name : "CSV View";
    }

    async onOpen() {
        // Initialization if needed
    }

    async onClose() {
        // Cleanup if needed
    }

    clear(): void {
        this.data = "";
        this.parsedData = [];
        this.headers = [];
    }

    setViewData(data: string, clear: boolean): void {
        if (clear) {
            this.clear();
        }
        this.data = data;
        this.parseCsv(data);
        this.render();
    }

    getViewData(): string {
        return this.data;
    }

    parseCsv(content: string) {
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length === 0) {
            this.headers = [];
            this.parsedData = [];
            return;
        }

        const firstLine = lines[0];
        if (firstLine) {
            this.headers = this.parseLine(firstLine);
        }
        this.parsedData = lines.slice(1).map(line => this.parseLine(line));
    }

    parseLine(line: string): string[] {
        // Simple CSV parser that handles quotes
        const result: string[] = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(cur.trim());
                cur = "";
            } else {
                cur += char;
            }
        }
        result.push(cur.trim());
        return result;
    }

    render() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("csv-view-container");

        const table = contentEl.createEl("table", { cls: "csv-table" });
        const thead = table.createEl("thead");
        const headerRow = thead.createEl("tr");

        this.headers.forEach((header, index) => {
            const th = headerRow.createEl("th");
            
            const headerTop = th.createEl("div", { cls: "csv-header-top" });
            headerTop.createEl("div", { text: header, cls: "csv-header-text" });
            
            // Sort button
            const sortBtn = headerTop.createEl("button", { 
                text: this.sortColumn === index ? (this.sortOrder === "asc" ? "▲" : "▼") : "↕",
                cls: "csv-sort-button"
            });
            sortBtn.onclick = () => this.onSort(index);

            // Filter input
            const filterInput = th.createEl("input", { 
                type: "text", 
                placeholder: "Filter...",
                cls: "csv-filter-input",
                value: this.filters.get(index) || ""
            });
            filterInput.onclick = (e) => e.stopPropagation();
            filterInput.oninput = (e) => {
                const val = (e.target as HTMLInputElement).value;
                if (val) {
                    this.filters.set(index, val.toLowerCase());
                } else {
                    this.filters.delete(index);
                }
                this.renderBody(table);
            };
        });

        this.renderBody(table);
    }

    renderBody(table: HTMLTableElement) {
        let tbody = table.querySelector("tbody");
        if (tbody) {
            tbody.remove();
        }
        tbody = table.createEl("tbody");

        let filteredData = [...this.parsedData];

        // Apply filters
        if (this.filters.size > 0) {
            filteredData = filteredData.filter(row => {
                for (const [index, query] of this.filters.entries()) {
                    const cellValue = (row[index] || "").toLowerCase();
                    if (!cellValue.includes(query)) return false;
                }
                return true;
            });
        }

        // Apply sort
        if (this.sortColumn !== null) {
            filteredData.sort((a, b) => {
                const valA = a[this.sortColumn!] || "";
                const valB = b[this.sortColumn!] || "";
                
                // Try numeric sort
                const numA = parseFloat(valA);
                const numB = parseFloat(valB);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return this.sortOrder === "asc" ? numA - numB : numB - numA;
                }

                return this.sortOrder === "asc" 
                    ? valA.localeCompare(valB) 
                    : valB.localeCompare(valA);
            });
        }

        filteredData.forEach(row => {
            const tr = tbody!.createEl("tr");
            row.forEach(cell => {
                tr.createEl("td", { text: cell });
            });
        });
    }

    onSort(index: number) {
        if (this.sortColumn === index) {
            this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
        } else {
            this.sortColumn = index;
            this.sortOrder = "asc";
        }
        this.render();
    }
}
