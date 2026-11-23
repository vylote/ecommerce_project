export default function ProductDetailFields({ productForm, handleInputChange, setActiveTab, attributeSpecTypes, selectedSpecs, setSelectedSpecs }) {
  return (
    <>
      {!productForm.categoryId ? (
        <div className="p-6 text-center bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <p className="font-semibold text-sm">Chưa chọn ngành hàng</p>
          <p className="text-xs text-amber-600 mt-1">
            Vui lòng quay lại <strong>Tab 1: Thông tin cơ bản</strong> và chọn ngành hàng để tải các thông số chi tiết phù hợp.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white mt-3"
          >
            Quay lại chọn ngành hàng
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Các trường cơ bản chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-control">
              <label className="label font-medium text-sm">Thương hiệu</label>
              <input
                type="text"
                name="brand"
                value={productForm.brand}
                onChange={handleInputChange}
                className="input input-bordered focus:border-green-600"
                placeholder="Ví dụ: No Brand, OEM, Nike, Apple..."
              />
            </div>

            <div className="form-control">
              <label className="label font-medium text-sm">Nhà sản xuất / Đơn vị phân phối</label>
              <input
                type="text"
                name="manufacturer"
                value={productForm.manufacturer}
                onChange={handleInputChange}
                className="input input-bordered focus:border-green-600"
                placeholder="Tên công ty hoặc cơ sở sản xuất"
              />
            </div>
          </div>

          {/* CÁC THUỘC TÍNH ĐẶC TẢ ĐỘNG THEO NGÀNH HÀNG */}
          {attributeSpecTypes.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span>Đặc tả thông số chuẩn theo ngành hàng ({attributeSpecTypes.length} thuộc tính):</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {attributeSpecTypes.map((st) => {
                  const currentSpec = selectedSpecs[st.id] || {};
                  return (
                    <div key={st.id} className="form-control">
                      <label className="label font-medium text-sm">
                        <span>{st.name}</span>
                        {st.description && (
                          <span className="text-[11px] text-gray-400 font-normal ml-1">({st.description})</span>
                        )}
                      </label>
                      <div className="space-y-2">
                        <select
                          value={currentSpec.specificationId || (currentSpec.isCustom ? "CUSTOM" : "")}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "CUSTOM") {
                              setSelectedSpecs((prev) => ({
                                ...prev,
                                [st.id]: { specificationId: null, isCustom: true, customValue: "" },
                              }));
                            } else if (!val) {
                              setSelectedSpecs((prev) => {
                                const next = { ...prev };
                                delete next[st.id];
                                return next;
                              });
                            } else {
                              const specObj = st.specifications?.find((s) => s.id === Number(val));
                              setSelectedSpecs((prev) => ({
                                ...prev,
                                [st.id]: {
                                  specificationId: Number(val),
                                  specificationName: specObj?.name,
                                  isCustom: false,
                                  customValue: "",
                                },
                              }));
                            }
                          }}
                          className="select select-bordered w-full focus:border-green-600 text-sm"
                        >
                          <option value="">-- Chọn {st.name} (Tùy chọn) --</option>
                          {st.specifications?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} {s.description ? `(${s.description})` : ""}
                            </option>
                          ))}
                          <option value="CUSTOM">-- Tự nhập giá trị khác --</option>
                        </select>

                        {currentSpec.isCustom && (
                          <input
                            type="text"
                            value={currentSpec.customValue || ""}
                            onChange={(e) => {
                              const customVal = e.target.value;
                              setSelectedSpecs((prev) => ({
                                ...prev,
                                [st.id]: { ...prev[st.id], customValue: customVal },
                              }));
                            }}
                            className="input input-bordered input-sm w-full focus:border-green-600 text-sm"
                            placeholder={`Nhập giá trị tùy chỉnh cho ${st.name}...`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
