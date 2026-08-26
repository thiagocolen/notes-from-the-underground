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
    ColumnFiltersState,
    VisibilityState,
    ColumnOrderState,
    ColumnSizingState
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
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
    const [showSettings, setShowSettings] = useState(false);

    const columns = useMemo(() => [
        columnHelper.display({
            id: 'checkbox',
            size: 40,
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
            id: 'path',
            header: 'Path',
            cell: info => info.getValue(),
            size: 150,
        }),
        columnHelper.accessor('title', {
            id: 'title',
            header: 'Title',
            size: 200,
            cell: info => {
                const note = info.row.original;
                return (
                    <a 
                        className="internal-link"
                        onClick={() => {
                            void app.workspace.getLeaf().openFile(note.file);
                        }}
                    >
                        {info.getValue()}
                    </a>
                );
            },
        }),
        columnHelper.accessor('priority', {
            id: 'priority',
            header: 'Priority',
            size: 80,
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('progress', {
            id: 'progress',
            header: 'Progress',
            size: 80,
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('tags', {
            id: 'tags',
            header: 'Tags',
            size: 150,
            cell: info => info.getValue().join(", "),
            filterFn: (row, columnId, filterValue: string) => {
                const tags = row.getValue<string[]>(columnId) || [];
                return tags.some(tag => tag.toLowerCase().includes(filterValue.toLowerCase()));
            }
        }),
        columnHelper.accessor('description', {
            id: 'description',
            header: 'Description',
            size: 250,
            cell: info => {
                const val = info.getValue() || "";
                if (val.length > 50) {
                    return val.substring(0, 50) + "...";
                }
                return val;
            },
        }),
        columnHelper.accessor('link', {
            id: 'link',
            header: 'Link',
            size: 150,
            cell: info => {
                const link = info.getValue();
                if (!link) return "";
                return <a href={link} target="_blank" rel="noopener">{link}</a>;
            },
        }),
        columnHelper.accessor('date', {
            id: 'date',
            header: 'Date',
            size: 100,
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
            columnVisibility,
            columnOrder,
            columnSizing,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onColumnSizingChange: setColumnSizing,
        columnResizeMode: 'onChange',
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
    });

    const selectedCount = Object.keys(rowSelection).length;
    const totalCount = table.getFilteredRowModel().rows.length;

    const moveColumn = (columnId: string, direction: 'left' | 'right') => {
        const currentOrder = table.getState().columnOrder.length > 0 
            ? [...table.getState().columnOrder] 
            : table.getAllLeafColumns().map(c => c.id);
        
        const index = currentOrder.indexOf(columnId);
        if (index === -1) return;

        const newIndex = direction === 'left' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= currentOrder.length) return;

        const newOrder = [...currentOrder];
        const itemA = newOrder[index] as string;
        const itemB = newOrder[newIndex] as string;
        newOrder[index] = itemB;
        newOrder[newIndex] = itemA;
        setColumnOrder(newOrder);
    };

    return (
        <div className="notes-table-container">
            <div className="notes-table-toolbar">
                <div className="notes-table-totalization">
                    <strong>Total: {totalCount} notes ({selectedCount} selected)</strong>
                </div>
                <button 
                    className="notes-settings-toggle"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    {showSettings ? 'Hide Settings' : 'Table Settings'}
                </button>
            </div>

            {showSettings && (
                <div className="notes-table-settings">
                    <div className="settings-section">
                        <h4>Column Visibility</h4>
                        <div className="visibility-controls">
                            {table.getAllLeafColumns().map(column => {
                                return (
                                    <label key={column.id} className="visibility-label">
                                        <input
                                            type="checkbox"
                                            checked={column.getIsVisible()}
                                            onChange={column.getToggleVisibilityHandler()}
                                        />
                                        {column.id}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="notes-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="notes-table" style={{ width: table.getTotalSize(), tableLayout: 'fixed' }}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        style={{ width: header.getSize(), position: 'relative' }}
                                    >
                                        <div className="header-content">
                                            <div className="header-main">
                                                <div className="clickable-header" onClick={header.column.getToggleSortingHandler()}>
                                                    <div className="header-label">
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                    </div>
                                                    {header.column.getCanSort() && (
                                                        <span className="sort-indicator">
                                                            {{
                                                                asc: '🔼',
                                                                desc: '🔽',
                                                            }[header.column.getIsSorted() as string] ?? '↕️'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="column-move-controls">
                                                    <button onClick={(e) => { e.stopPropagation(); moveColumn(header.column.id, 'left'); }}>◀</button>
                                                    <button onClick={(e) => { e.stopPropagation(); moveColumn(header.column.id, 'right'); }}>▶</button>
                                                </div>
                                            </div>
                                            {header.column.getCanFilter() ? (
                                                <div className="filter-container">
                                                    <input
                                                        type="text"
                                                        value={(header.column.getFilterValue() ?? '') as string}
                                                        onChange={e => header.column.setFilterValue(e.target.value)}
                                                        placeholder={`Filter...`}
                                                        className="notes-filter-input"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                        <div
                                            onMouseDown={header.getResizeHandler()}
                                            onTouchStart={header.getResizeHandler()}
                                            className={`resizer ${
                                                header.column.getIsResizing() ? 'is-resizing' : ''
                                            }`}
                                        />
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
