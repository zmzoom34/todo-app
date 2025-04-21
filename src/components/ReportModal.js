import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Reusable SortableHeader component
const SortableHeader = ({ label, sortKey, sortType, sortConfig, requestSort }) => (
  <th
    scope="col"
    className="border border-gray-300 p-2 cursor-pointer hover:bg-gray-200 whitespace-nowrap"
    onClick={() => requestSort(sortKey)}
  >
    {label}
    {sortConfig.key === sortKey && (
      <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
    )}
  </th>
);

SortableHeader.propTypes = {
  label: PropTypes.string.isRequired,
  sortKey: PropTypes.string.isRequired,
  sortType: PropTypes.oneOf(["string", "number", "date"]).isRequired,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(["ascending", "descending"]).isRequired,
  }).isRequired,
  requestSort: PropTypes.func.isRequired,
};

// Reusable DataTable component
const DataTable = ({ headers, data, sortConfig, requestSort, rowKey, renderRow, onRowClick }) => {
  const handleKeyDown = (e, item) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRowClick?.(item);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border border-gray-300 mt-2">
        <thead>
          <tr className="bg-gray-100">
            {headers.map(({ label, sortKey, sortType }) => (
              <SortableHeader
                key={sortKey}
                label={label}
                sortKey={sortKey}
                sortType={sortType}
                sortConfig={sortConfig}
                requestSort={requestSort}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center p-4 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={rowKey(item, index)}
                className={`text-center border border-gray-300 ${
                  onRowClick ? "cursor-pointer hover:bg-gray-100" : ""
                }`}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
              >
                {renderRow(item)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

DataTable.propTypes = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      sortKey: PropTypes.string.isRequired,
      sortType: PropTypes.oneOf(["string", "number", "date"]).isRequired,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  sortConfig: PropTypes.object.isRequired,
  requestSort: PropTypes.func.isRequired,
  rowKey: PropTypes.func.isRequired,
  renderRow: PropTypes.func.isRequired,
  onRowClick: PropTypes.func,
};

// Main ReportModal component
const ReportModal = ({ isOpen, onClose, reportData, categories, isLoading }) => {
  // Separate sort configs
  const [categorySortConfig, setCategorySortConfig] = useState({
    key: "categoryName",
    direction: "ascending",
  });
  const [userSortConfig, setUserSortConfig] = useState({
    key: "user",
    direction: "ascending",
  });
  const [taskSortConfig, setTaskSortConfig] = useState({
    key: "text",
    direction: "ascending",
  });
  const [filteredTaskSortConfig, setFilteredTaskSortConfig] = useState({
    key: "text",
    direction: "ascending",
  });
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Generic sort handler
  const requestSort = (setSortConfig) => (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  // Generic sorting function
  const getSortedData = (data, sortConfig, sortType) => {
    if (!sortConfig.key || !data?.length) return data || [];

    return [...data].sort((a, b) => {
      let aValue = a?.[sortConfig.key] ?? "";
      let bValue = b?.[sortConfig.key] ?? "";

      if (sortType === "number") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortType === "date") {
        aValue = new Date(aValue).getTime() || 0;
        bValue = new Date(bValue).getTime() || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue < bValue ? 1 : -1;
    });
  };

  // Format currency
  const formatTL = (value) =>
    new Intl.NumberFormat("tr-TR", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  // Format date with validation
  const formatDate = (date) => {
    if (!date || typeof date !== "string") {
      console.warn("Invalid date value:", date);
      return "-";
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.warn("Invalid date format:", date);
      return "-";
    }
    return format(parsedDate, "dd/MM/yyyy", { locale: tr });
  };

  // Memoized derived data
  const categoryStatsArray = useMemo(
    () =>
      Object.entries(reportData?.categoryStats || {}).map(([category, stats]) => ({
        category,
        categoryName: categories.find((c) => c.value === category)?.label || category,
        count: stats.count || 0,
        totalPrize: stats.totalPrize || 0,
      })),
    [reportData, categories]
  );

  const userStatsArray = useMemo(
    () =>
      Object.entries(reportData?.userStats || {}).map(([user, count]) => ({
        user,
        count: count || 0,
      })),
    [reportData]
  );

  const filteredTasks = useMemo(
    () =>
      selectedCategory
        ? reportData?.taskDetails?.filter((task) => task.categoryId === selectedCategory) || []
        : [],
    [selectedCategory, reportData]
  );

  // Memoized sorted data
  const sortedCategoryStats = useMemo(() => {
    const sortType = categorySortConfig.key === "categoryName" ? "string" : "number";
    return getSortedData(categoryStatsArray, categorySortConfig, sortType);
  }, [categoryStatsArray, categorySortConfig]);

  const sortedUserStats = useMemo(() => {
    const sortType = userSortConfig.key === "user" ? "string" : "number";
    return getSortedData(userStatsArray, userSortConfig, sortType);
  }, [userStatsArray, userSortConfig]);

  const sortedTaskDetails = useMemo(() => {
    const sortType =
      taskSortConfig.key === "archivedAt"
        ? "date"
        : taskSortConfig.key === "amount" || taskSortConfig.key === "prize"
        ? "number"
        : "string";
    return getSortedData(reportData?.taskDetails || [], taskSortConfig, sortType);
  }, [reportData, taskSortConfig]);

  const sortedFilteredTasks = useMemo(() => {
    const sortType =
      filteredTaskSortConfig.key === "archivedAt"
        ? "date"
        : filteredTaskSortConfig.key === "amount" || filteredTaskSortConfig.key === "prize"
        ? "number"
        : "string";
    return getSortedData(filteredTasks, filteredTaskSortConfig, sortType);
  }, [filteredTasks, filteredTaskSortConfig]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Category,Task Count,Total Prize (TL)",
      ...sortedCategoryStats.map(
        (item) => `${item.categoryName},${item.count},${formatTL(item.totalPrize)}`
      ),
      "",
      "User,Archived Tasks",
      ...sortedUserStats.map((item) => `${item.user},${item.count}`),
      "",
      "Task,Archived By,Amount,Unit,Date,Prize (TL)",
      ...sortedTaskDetails.map(
        (task) =>
          `${task.text},${task.archivedBy},${task.amount},${task.unit},${task.archivedAt
          },${formatTL(task.prize)}`
      ),
    ];
    const csv = headers.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `report_${reportData?.selectedMonth || "unknown"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  if (isLoading || !reportData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-11/12 max-w-5xl p-6 shadow-lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData?.selectedMonth || !reportData?.taskDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-11/12 max-w-5xl p-6 shadow-lg text-center">
          <p className="text-red-500">Error: Invalid report data</p>
          <button
            onClick={onClose}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Shared headers configuration
  const tableHeaders = {
    category: [
      { label: "Kategori", sortKey: "categoryName", sortType: "string" },
      { label: "Görev Sayısı", sortKey: "count", sortType: "number" },
      { label: "Toplam Harcama (TL)", sortKey: "totalPrize", sortType: "number" },
    ],
    user: [
      { label: "Kullanıcı", sortKey: "user", sortType: "string" },
      { label: "Arşivlenen Görev", sortKey: "count", sortType: "number" },
    ],
    task: [
      { label: "Görev", sortKey: "text", sortType: "string" },
      { label: "Arşivleyen", sortKey: "archivedBy", sortType: "string" },
      { label: "Miktar", sortKey: "amount", sortType: "number" },
      { label: "Birim", sortKey: "unit", sortType: "string" },
      { label: "Tarih", sortKey: "archivedAt", sortType: "date" },
      { label: "Ücret", sortKey: "prize", sortType: "number" },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-5xl shadow-lg flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-100">
          <h2 className="text-lg font-semibold">
            📊 Aylık Rapor ({reportData.selectedMonth})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              aria-label="Export report to CSV"
            >
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4">
            <p>
              ✅ <b>Toplam Arşivlenen Görev:</b> {reportData.totalArchived || 0}
            </p>
            <p>
              💰 <b>Toplam Harcanan Ücret:</b> {formatTL(reportData.totalPrize)}
            </p>
          </div>

          {/* Category Table */}
          <h4 className="mt-3 font-semibold">📌 Kategoriye Göre Rapor:</h4>
          <DataTable
            headers={tableHeaders.category}
            data={sortedCategoryStats}
            sortConfig={categorySortConfig}
            requestSort={requestSort(setCategorySortConfig)}
            rowKey={(item) => item.category}
            renderRow={(item) => (
              <>
                <td className="border border-gray-300 p-2">{item.categoryName}</td>
                <td className="border border-gray-300 p-2">{item.count}</td>
                <td className="border border-gray-300 p-2">{formatTL(item.totalPrize)} TL</td>
              </>
            )}
            onRowClick={(item) =>
              setSelectedCategory(selectedCategory === item.category ? null : item.category)
            }
          />

          {/* Filtered Task Table */}
          {selectedCategory && (
            <div className="mt-4">
              <h4 className="font-semibold">
                📋 {categories.find((c) => c.value === selectedCategory)?.label || "Unknown"} Kategorisi Görevleri:
              </h4>
              <DataTable
                headers={tableHeaders.task}
                data={sortedFilteredTasks}
                sortConfig={filteredTaskSortConfig}
                requestSort={requestSort(setFilteredTaskSortConfig)}
                rowKey={(_, index) => index}
                renderRow={(task) => (
                  <>
                    <td className="border border-gray-300 p-2">{task.text}</td>
                    <td className="border border-gray-300 p-2">{task.archivedBy}</td>
                    <td className="border border-gray-300 p-2">{task.amount}</td>
                    <td className="border border-gray-300 p-2">{task.unit}</td>
                    <td className="border border-gray-300 p-2">{task.archivedAt}</td>
                    <td className="border border-gray-300 p-2">{formatTL(task.prize)}</td>
                  </>
                )}
              />
            </div>
          )}

          {/* User Table */}
          <h4 className="mt-3 font-semibold">👤 Kullanıcıya Göre Rapor:</h4>
          <DataTable
            headers={tableHeaders.user}
            data={sortedUserStats}
            sortConfig={userSortConfig}
            requestSort={requestSort(setUserSortConfig)}
            rowKey={(item) => item.user}
            renderRow={(item) => (
              <>
                <td className="border border-gray-300 p-2">{item.user}</td>
                <td className="border border-gray-300 p-2">{item.count}</td>
              </>
            )}
          />

          {/* Full Task List */}
          <h4 className="mt-3 font-semibold">📋 Detaylı Görev Listesi:</h4>
          <DataTable
            headers={tableHeaders.task}
            data={sortedTaskDetails}
            sortConfig={taskSortConfig}
            requestSort={requestSort(setTaskSortConfig)}
            rowKey={(_, index) => index}
            renderRow={(task) => (
              <>
                <td className="border border-gray-300 p-2">{task.text}</td>
                <td className="border border-gray-300 p-2">{task.archivedBy}</td>
                <td className="border border-gray-300 p-2">{task.amount}</td>
                <td className="border border-gray-300 p-2">{task.unit}</td>
                <td className="border border-gray-300 p-2">{task.archivedAt}</td>
                <td className="border border-gray-300 p-2">{formatTL(task.prize)}</td>
              </>
            )}
          />
        </div>

        {/* Fixed Close Button */}
        <div className="p-4 border-t bg-gray-100 flex justify-end gap-2">
          <button
            onClick={exportToCSV}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Export CSV
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

ReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  reportData: PropTypes.shape({
    selectedMonth: PropTypes.string,
    totalArchived: PropTypes.number,
    totalPrize: PropTypes.number,
    categoryStats: PropTypes.objectOf(
      PropTypes.shape({
        count: PropTypes.number,
        totalPrize: PropTypes.number,
      })
    ),
    userStats: PropTypes.objectOf(PropTypes.number),
    taskDetails: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        archivedBy: PropTypes.string,
        amount: PropTypes.number,
        unit: PropTypes.string,
        archivedAt: PropTypes.string,
        prize: PropTypes.number,
        categoryId: PropTypes.string,
      })
    ),
  }),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

ReportModal.defaultProps = {
  isLoading: false,
};

export default ReportModal;