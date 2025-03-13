import React from "react";

const ReportModal = ({ isOpen, onClose, reportData, categories }) => {
  if (!isOpen || !reportData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl m-4 shadow-lg flex flex-col">
        {/* Modal Başlığı */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-100">
          <h2 className="text-lg font-semibold">📊 Aylık Rapor ({reportData.selectedMonth})</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">❌</button>
        </div>

        {/* Scrollable İçerik */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <p>✅ <b>Toplam Arşivlenen Görev:</b> {reportData.totalArchived}</p>
          <p>💰 <b>Toplam Harcanan Ücret:</b> {reportData.totalPrize} TL</p>

          {/* 📌 Kategori Bazlı Tablo */}
          <h4 className="mt-3 font-semibold">📌 Kategoriye Göre Rapor:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Kategori</th>
                  <th className="border border-gray-300 p-2">Görev Sayısı</th>
                  <th className="border border-gray-300 p-2">Toplam Harcama (TL)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(reportData.categoryStats).map(([category, stats]) => (
                  <tr key={category} className="text-center border border-gray-300">
                    <td className="border border-gray-300 p-2">
                      {categories.find(c => c.value === category)?.label || category}
                    </td>
                    <td className="border border-gray-300 p-2">{stats.count}</td>
                    <td className="border border-gray-300 p-2">{stats.totalPrize.toFixed(2)} TL</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 👤 Kullanıcı Bazlı Tablo */}
          <h4 className="mt-3 font-semibold">👤 Kullanıcıya Göre Rapor:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Kullanıcı</th>
                  <th className="border border-gray-300 p-2">Arşivlenen Görev</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(reportData.userStats).map(([user, count]) => (
                  <tr key={user} className="text-center border border-gray-300">
                    <td className="border border-gray-300 p-2">{user}</td>
                    <td className="border border-gray-300 p-2">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📋 Detaylı Görev Listesi */}
          <h4 className="mt-3 font-semibold">📋 Detaylı Görev Listesi:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Görev</th>
                  <th className="border border-gray-300 p-2">Arşivleyen</th>
                  <th className="border border-gray-300 p-2">Miktar</th>
                  <th className="border border-gray-300 p-2">Birim</th>
                  <th className="border border-gray-300 p-2">Tarih</th>
                  <th className="border border-gray-300 p-2">Ücret</th>
                </tr>
              </thead>
              <tbody>
                {reportData.taskDetails.map((task, index) => (
                  <tr key={index} className="text-center border border-gray-300">
                    <td className="border border-gray-300 p-2">{task.text}</td>
                    <td className="border border-gray-300 p-2">{task.archivedBy}</td>
                    <td className="border border-gray-300 p-2">{task.amount}</td>
                    <td className="border border-gray-300 p-2">{task.unit}</td>
                    <td className="border border-gray-300 p-2">{task.archivedAt}</td>
                    <td className="border border-gray-300 p-2">{task.prize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sabit Kapat Butonu */}
        <div className="p-4 border-t bg-gray-100 flex justify-end">
          <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
