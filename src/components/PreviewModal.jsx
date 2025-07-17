import React, { useState, useMemo } from "react";

const PAGE_SIZE = 10;

const SchedulePreviewModal = ({ isOpen, onClose, schedules, title }) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const text = JSON.stringify(s).toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [schedules, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1 * sortDir;
      if (a[sortKey] > b[sortKey]) return 1 * sortDir;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const pages = Math.ceil(sorted.length / PAGE_SIZE);
  const current = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const cols = ["program","yearLevel","subject","section","faculty","startTime","endTime","duration","day","room"];

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-red-600 hover:underline text-sm">Close</button>
        </div>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border p-2 flex-1"
          />
        </div>

        <table className="w-full text-sm table-auto border">
          <thead>
            <tr className="bg-gray-100">
              {cols.map((col) => (
                <th
                  key={col}
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort(col)}
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                  {sortKey === col ? (sortDir > 0 ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.map((s) => (
              <tr key={s.id}>
                {cols.map((col) => (
                  <td key={col} className="p-2 border">
                    {col === "duration" ? `${s[col]} mins` : s[col] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="mt-4 flex justify-center items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>&larr;</button>
            <span>{page} / {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(page + 1)}>&rarr;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePreviewModal;
