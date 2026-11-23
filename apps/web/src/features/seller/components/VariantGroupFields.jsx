import FormInput from "../../../shared/components/ui/FormInput";
import FormSelect from "../../../shared/components/ui/FormSelect";
export default function VariantGroupFields({
  number, tier, specTypes, excludedTypeId, onEdit, onSelectType, onAddOption, onRemoveOption,
  onToggleOption, onRemoveGroup,
}) {
  const currentType = specTypes.find((type) => type.id === tier.typeId || type.name === tier.name);
  const suggestions = currentType?.specifications ?? [];

  return (
    <section className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-800">Nhóm phân loại {number}</h3>
        {specTypes.length > 0 && (
          <label className="flex items-center gap-2 text-xs text-gray-600">
            Chuẩn theo ngành hàng
            <FormSelect
              value={tier.typeId || ""}
              onChange={(event) => onSelectType(event.target.value)}
              controlSize="xs" focusColor="green" className="bg-white"
            >
              <option value="">Chọn phân loại chuẩn</option>
              {specTypes.filter((type) => type.id !== excludedTypeId).map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.specifications?.length || 0} giá trị)
                </option>
              ))}
            </FormSelect>
          </label>
        )}
        {onRemoveGroup && (
          <button type="button" onClick={onRemoveGroup} className="text-xs text-error hover:underline">
            Xóa nhóm {number}
          </button>
        )}
      </div>
      <div className="grid items-center gap-3 md:grid-cols-[180px_1fr]">
        <FormInput
          type="text"
          aria-label={`Tên nhóm ${number}`}
          placeholder="Tên nhóm"
          value={tier.name}
          onChange={(event) => onEdit("name", event.target.value)}
          controlSize="sm" focusColor="green" className="bg-white"
 />
        <div className="flex gap-2">
          <FormInput
            type="text"
            aria-label={`Giá trị mới cho nhóm ${number}`}
            placeholder="Nhập giá trị riêng"
            value={tier.inputVal}
            onChange={(event) => onEdit("inputVal", event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
              event.preventDefault();
              onAddOption();
            }}
            controlSize="sm" focusColor="green" className="min-w-0 flex-1 bg-white"
 />
          <button type="button" onClick={onAddOption} className="btn btn-sm bg-green-600 text-white hover:bg-green-700">
            Thêm
          </button>
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="space-y-1.5 border-t border-gray-200 pt-2">
          <p className="text-xs text-gray-600">Gợi ý theo ngành hàng ({currentType.name})</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((option) => {
              const selected = tier.options.includes(option.name);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggleOption(option.name)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${selected ? "border-green-600 bg-green-600 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-green-600"}`}
                >
                  {option.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {tier.options.map((option, index) => (
          <span key={option} className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
            {option}
            <button
              type="button"
              aria-label={`Xóa ${option} khỏi nhóm ${number}`}
              onClick={() => onRemoveOption(index)}
              className="text-gray-500 hover:text-error"
            >
              Xóa
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
