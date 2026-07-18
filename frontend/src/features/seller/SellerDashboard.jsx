import React, { useEffect, useRef } from 'react';

export default function SellerDashboard() {
  const canvasRef = useRef(null);

  // Logic vẽ biểu đồ Canvas giữ nguyên từ bản HTML
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeAndDraw = () => {
      const DPR = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(300, w * DPR);
      canvas.height = Math.max(150, h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const data = [0, 2000, 5000, 12000, 8000, 15000, 20000, 18000, 12000, 9000, 7000, 6000, 4000, 3000, 2000];
      const max = Math.max(...data);
      const padding = 20;
      const drawW = w - padding * 2;
      const drawH = h - padding * 2;
      const stepX = drawW / (data.length - 1);

      // Lưới
      ctx.strokeStyle = '#f0f2f5';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + (drawH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + drawW, y);
        ctx.stroke();
      }

      // Đường Line
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(238,77,45,0.95)';
      data.forEach((v, i) => {
        const x = padding + stepX * i;
        const y = padding + drawH - (v / max) * drawH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Đổ màu Gradient
      ctx.lineTo(padding + drawW, padding + drawH);
      ctx.lineTo(padding, padding + drawH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, padding, 0, padding + drawH);
      grad.addColorStop(0, 'rgba(238,77,45,0.18)');
      grad.addColorStop(1, 'rgba(238,77,45,0.02)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Dấu chấm tròn
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'rgba(238,77,45,0.95)';
      data.forEach((v, i) => {
        const x = padding + stepX * i;
        const y = padding + drawH - (v / max) * drawH;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    };

    window.addEventListener('resize', resizeAndDraw);
    resizeAndDraw();

    return () => window.removeEventListener('resize', resizeAndDraw);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* KHU VỰC CỘT GIỮA (MAIN CONTENT) */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Banner */}
        <div className="bg-[#fff3f1] border border-orange-100 p-4 rounded-xl flex flex-wrap gap-3 items-center shadow-sm">
          <div className="flex-1">
            <div className="font-bold text-gray-900">Cập nhật thông tin thuế & định danh</div>
            <div className="text-xs text-gray-500 mt-1">Vui lòng cập nhật trước hạn chót để tránh ảnh hưởng hoạt động bán hàng.</div>
          </div>
          <button className="bg-[#ee4d2d] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d73211] transition-colors">
            Cập nhật ngay
          </button>
        </div>

        {/* To-Do Grid */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Danh sách cần làm</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { num: 1, label: 'Chờ Xác Nhận', sub: 'Đơn mới cần xác nhận' },
              { num: 85, label: 'Chờ Lấy Hàng', sub: 'Đơn chờ đối tác lấy hàng' },
              { num: 1, label: 'Đã Xử Lý', sub: 'Đơn đã hoàn tất' },
              { num: 0, label: 'Đơn Hủy', sub: 'Đơn bị hủy' },
              { num: 3, label: 'Trả/Hoàn tiền', sub: 'Yêu cầu trả/hoàn tiền' },
              { num: 44, label: 'Sản phẩm tạm khóa', sub: 'SP vi phạm/đang kiểm tra' },
              { num: 6, label: 'Sản phẩm hết hàng', sub: 'Cần bổ sung tồn kho' },
              { num: 0, label: 'Khuyến mãi chờ xử lý', sub: 'Chương trình chờ duyệt' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 p-3 rounded-lg flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
                <div className="font-black text-xl text-[#ee4d2d]">{item.num}</div>
                <div>
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-1 truncate" title={item.sub}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phân tích bán hàng */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-800">Phân tích bán hàng</h3>
              <div className="text-xs text-gray-400">00:00 — 15:00 (GMT+7)</div>
            </div>
            <button className="text-sm text-blue-600 hover:underline">Xem chi tiết</button>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { val: '83,500 ₫', label: 'Doanh số' },
              { val: '510', label: 'Lượt truy cập' },
              { val: '1,296', label: 'Lượt xem' },
              { val: '12', label: 'Đơn hàng' },
              { val: '2.35%', label: 'Tỷ lệ chuyển đổi' },
            ].map((m, i) => (
              <div key={i} className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 p-3 rounded-lg">
                <div className="font-bold text-lg text-gray-800">{m.val}</div>
                <div className="text-xs text-gray-500 mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="border border-gray-100 rounded-lg p-2 bg-gray-50">
            <canvas ref={canvasRef} className="w-full h-[200px] block"></canvas>
          </div>
        </div>
      </div>

      {/* KHU VỰC CỘT PHẢI (WIDGETS) */}
      <aside className="w-full lg:w-[320px] flex flex-col gap-4 shrink-0">
        
        {/* Kênh Marketing */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Kênh Marketing</h3>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
              <div className="text-sm font-medium">Chiến dịch 7.7</div>
              <div className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Đang diễn ra</div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
              <div className="text-sm font-medium">Ưu đãi vận chuyển</div>
              <div className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Thiết lập</div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
              <div className="text-sm font-medium">Quảng cáo Shop</div>
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Tạo mới</div>
            </div>
          </div>
          <h4 className="font-bold text-gray-700 text-sm mb-2">Hành động nhanh</h4>
          <div className="flex flex-wrap gap-2">
            <button className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium">Tạo sản phẩm mới</button>
            <button className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium">Tạo khuyến mãi</button>
          </div>
        </div>

        {/* Thông báo */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Thông báo & Cập nhật</h3>
          <div className="space-y-3">
            <div className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="text-sm font-bold text-gray-800">Ra mắt chiến dịch MCN mới</div>
              <div className="text-xs text-gray-500 mt-1">Tìm hiểu ngay để tham gia chương trình.</div>
            </div>
            <div className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="text-sm font-bold text-[#ee4d2d]">Hạn chót cập nhật thuế</div>
              <div className="text-xs text-gray-500 mt-1">Cập nhật trước 20/07 để tránh bị khóa Shop.</div>
            </div>
          </div>
        </div>
      </aside>

    </div>
  );
}