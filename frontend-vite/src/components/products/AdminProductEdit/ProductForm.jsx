// ProductForm.jsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_STATUSES } from "../../../api/products";

export const ProductForm = ({ formData, handleChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Категория</Label>
        <Input
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Введите категорию"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Описание</Label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Цена</Label>
        <Input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Сталь</Label>
        <Input name="steel" value={formData.steel} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label>Рукоять</Label>
        <Input name="handle" value={formData.handle} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label>Длина (см)</Label>
        <Input
          type="number"
          name="length"
          value={formData.length}
          onChange={handleChange}
          min="0"
        />
      </div>

      <div className="space-y-2">
        <Label>Длина клинка (мм)</Label>
        <Input
          type="number"
          name="blade_length"
          value={formData.blade_length}
          onChange={handleChange}
          min="0"
          step="0.1"
          placeholder="Длина клинка в миллиметрах"
        />
      </div>

      <div className="space-y-2">
        <Label>Толщина клинка (мм)</Label>
        <Input
          type="number"
          name="blade_thickness"
          value={formData.blade_thickness}
          onChange={handleChange}
          min="0"
          step="0.1"
          placeholder="Толщина клинка в миллиметрах"
        />
      </div>

      <div className="space-y-2">
        <Label>Твердость</Label>
        <Input
          name="hardness"
          value={formData.hardness}
          onChange={handleChange}
          placeholder="Значение твердости по шкале HRC"
        />
      </div>
      <div className="space-y-2">
        <Label>Ножны</Label>
        <Input
          name="sheath"
          value={formData.sheath}
          onChange={handleChange}
          placeholder="Материал и описание ножен"
        />
      </div>
      <div className="space-y-2">
        <Label>Примечание</Label>
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="min-h-[100px]"
          placeholder="Дополнительная информация о товаре"
        />
      </div>
      <div className="space-y-2">
        <Label>Статус</Label>
        <Select
          name="status"
          value={formData.status}
          onValueChange={(value) =>
            handleChange({ target: { name: "status", value } })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите статус" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PRODUCT_STATUSES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
