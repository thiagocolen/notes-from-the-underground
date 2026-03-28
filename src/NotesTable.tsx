import React, { useMemo, useState } from "react";
import { App, TFile } from "obsidian";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState
} from "@tanstack/react-table";

export interface NoteData {
    file: TFile;
    path: string;
    title: string;
    priority: string;
    progress: string;
    tags: string[];
    description: string;
    link: string;
    date: string;
}

const columnHelper = createColumnHelper<NoteData>();

interface NotesTableProps {
    app: App;
    data: NoteData[];
}

export const NotesTable: React.FC<NotesTableProps> = ({ app, data }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const columns = useMemo(() => [
        columnHelper.display({
            id: 'checkbox',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
        }),
        columnHelper.accessor('path', {
            header: 'Path',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('title', {
            header: 'Title',
            cell: info => {
                const note = info.row.original;
                return (
                    <a 
                        className="internal-link"
                        onClick={() => {
                            app.workspace.getLeaf().openFile(note.file);
                        }}
                    >
                        {info.getValue()}
                    </a>
                );
            },
        }),
        columnHelper.accessor('priority', {
            header: 'Priority',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('progress', {
            header: 'Progress',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('tags', {
            header: 'Tags',
            cell: info => info.getValue().join(", "),
            filterFn: (row, columnId, filterValue: string) => {
                const tags = row.getValue<string[]>(columnId) || [];
                return tags.some(tag => tag.toLowerCase().includes(filterValue.toLowerCase()));
            }
        }),
        columnHelper.accessor('description', {
            header: 'Description',
            cell: info => {
                const val = info.getValue() || "";
                if (val.length > 50) {
                    return val.substring(0, 50) + "...";
                }
                return val;
            },
        }),
        columnHelper.accessor('link', {
            header: 'Link',
            cell: info => {
                const link = info.getValue();
                if (!link) return "";
                return <a href={link} target="_blank" rel="noopener">{link}</a>;
            },
        }),
        columnHelper.accessor('date', {
            header: 'Date',
            cell: info => info.getValue(),
        })
    ], [app]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
    });

    const selectedCount = Object.keys(rowSelection).length;
    const totalCount = table.getFilteredRowModel().rows.length;

    return (
        <div className="notes-table-container">
            <div className="notes-table-totalization">
                <strong>Total: {totalCount} notes ({selectedCount} selected)</strong>
            </div>
            <table className="notes-table">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    <div className="clickable-header" onClick={header.column.getToggleSortingHandler()}>
                                        <div className="header-label">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </div>
                                        {header.column.getCanSort() && (
                                            <button className="csv-sort-button">
                                                {{
                                                    asc: '🔼',
                                                    desc: '🔽',
                                                }[header.column.getIsSorted() as string] ?? '↕️'}
                                            </button>
                                        )}
                                    </div>
                                    {header.column.getCanFilter() ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={(header.column.getFilterValue() ?? '') as string}
                                                onChange={e => header.column.setFilterValue(e.target.value)}
                                                placeholder={`Filter...`}
                                                className="notes-filter-input"
                                            />
                                        </div>
                                    ) : null}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
