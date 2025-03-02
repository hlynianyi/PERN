import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle } from "lucide-react";
import { contactsApi } from "@/api/contacts";
import { fetchContacts } from "../../store/slices/contactsSlice";
import store from "../../store";
import { toast } from "sonner";

const AdminContactsEdit = () => {
  const [formData, setFormData] = useState({
    title: "",
    city: "",
    address: "",
    phones: [""],
    email: "",
    work_days: "",
    work_hours: "",
    description: "",
    telegram: "",
    whatsapp: "",
    instagram: "",
    vkontakte: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const contacts = await contactsApi.getContacts();
      if (contacts) {
        setFormData({
          id: contacts.id,
          city: contacts.city || "",
          address: contacts.address || "",
          phones: contacts.phones?.length ? contacts.phones : [""],
          email: contacts.email || "",
          work_days: contacts.work_days || "",
          work_hours: contacts.work_hours || "",
          description: contacts.description || "",
          telegram: contacts.telegram || "",
          whatsapp: contacts.whatsapp || "",
          instagram: contacts.instagram || "",
          vkontakte: contacts.vkontakte || "",
        });
      }
    } catch (error) {
      toast.error("Ошибка при загрузке контактов", {
        description: error.message || "Не удалось загрузить контактную информацию",
        richColors: true,
      });
      console.error("Ошибка загрузки:", error);
    }
  };

  const handleAddPhone = () => {
    setFormData((prev) => ({
      ...prev,
      phones: [...prev.phones, ""],
    }));
  };

  const handleRemovePhone = (index) => {
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));
  };

  const handlePhoneChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.map((phone, i) => (i === index ? value : phone)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await contactsApi.saveContacts({
        ...formData,
        phones: formData.phones.filter((phone) => phone.trim() !== ""),
      });
      store.dispatch(fetchContacts());
      
      toast.success("Контактная информация сохранена", {
        description: "Информация успешно обновлена",
        richColors: true,
      });
      
      // Перенаправление на страницу контактов
      setTimeout(() => {
        window.location.href = "/contacts";
      }, 2000);
    } catch (error) {
      toast.error("Ошибка при сохранении контактов", {
        description: error.response?.data?.error || "Не удалось сохранить контактную информацию",
        richColors: true,
      });
      console.error("Ошибка сохранения:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold">
          Редактирование контактной информации
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Город</Label>
            <Input
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              placeholder="Введите город"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Введите email"
            />
          </div>
        </div>

        <div>
          <Label>Адрес</Label>
          <Input
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Введите адрес"
          />
        </div>

        <div>
          <Label>Телефоны</Label>
          <div className="space-y-2">
            {formData.phones.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={phone}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  placeholder="Введите номер телефона"
                />
                {formData.phones.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemovePhone(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPhone}
              className="w-full"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Добавить телефон
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Дни работы</Label>
            <Input
              value={formData.work_days}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, work_days: e.target.value }))
              }
              placeholder="Например: Пн-Пт"
            />
          </div>

          <div>
            <Label>Часы работы</Label>
            <Input
              value={formData.work_hours}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, work_hours: e.target.value }))
              }
              placeholder="Например: 9:00 - 18:00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Telegram</Label>
            <Input
              value={formData.telegram}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, telegram: e.target.value }))
              }
              placeholder="Ссылка на Telegram"
            />
          </div>

          <div>
            <Label>WhatsApp</Label>
            <Input
              value={formData.whatsapp}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
              }
              placeholder="Ссылка на WhatsApp"
            />
          </div>

          <div>
            <Label>Instagram</Label>
            <Input
              value={formData.instagram}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, instagram: e.target.value }))
              }
              placeholder="Ссылка на Instagram"
            />
          </div>

          <div>
            <Label>VKontakte</Label>
            <Input
              value={formData.vkontakte}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, vkontakte: e.target.value }))
              }
              placeholder="Ссылка на VKontakte"
            />
          </div>
        </div>

        <div>
          <Label>Описание</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Введите дополнительную информацию"
            className="min-h-[150px]"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>
    </div>
  );
};

export default AdminContactsEdit;