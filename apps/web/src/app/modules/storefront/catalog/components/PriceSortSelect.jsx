export default function PriceSortSelect({ active, order, onChange }) {
  return (
    <select aria-label="Sắp xếp theo giá"
      className={`select select-sm outline-none focus:outline-none min-w-[160px] font-normal ${active ? 'bg-primary text-white border-primary' : 'bg-base-100 border-transparent'}`}
      value={active ? order : 'default'}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="default" disabled className="bg-base-100 text-base-content">Giá</option>
      <option value="asc" className="bg-base-100 text-base-content">Giá: Thấp đến Cao</option>
      <option value="desc" className="bg-base-100 text-base-content">Giá: Cao đến Thấp</option>
    </select>
  );
}
