import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, PlusCircle, Edit, Bold } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

const AdminPartnershipEdit = () => {
  const [formData, setFormData] = useState({
    title: "",
    text_blocks: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);
  const [editingBlock, setEditingBlock] = useState({
    text: "",
    format_data: { bold: false },
  });

  useEffect(() => {
    loadPartnership();
  }, []);

  const loadPartnership = async () => {
    try {
      const response = await api.get("/partnership");
      response;
      if (response.data) {
        setFormData({
          id: response.data.id,
          title: response.data.title,
          text_blocks: response.data.text_blocks || [],
        });
      }
    } catch (error) {
      toast.error("Ошибка при загрузке данных", {
        description: "Не удалось загрузить информацию о сотрудничестве",
        richColors: true,
      });
      console.error("Ошибка загрузки:", error);
    }
  };

  const handleAddBlock = () => {
    setEditingBlockIndex(null);
    setEditingBlock({
      text: "",
      format_data: { bold: false },
    });
    setIsDialogOpen(true);
  };

  const handleEditBlock = (index) => {
    setEditingBlockIndex(index);
    setEditingBlock({
      ...formData.text_blocks[index],
    });
    setIsDialogOpen(true);
  };

  const handleRemoveBlock = (index) => {
    setFormData((prev) => ({
      ...prev,
      text_blocks: prev.text_blocks.filter((_, i) => i !== index),
    }));
  };

  const toggleBold = () => {
    setEditingBlock((prev) => ({
      ...prev,
      format_data: {
        ...prev.format_data,
        bold: !prev.format_data.bold,
      },
    }));
  };

  const handleBlockSave = () => {
    const newBlocks = [...formData.text_blocks];
    if (editingBlockIndex !== null) {
      newBlocks[editingBlockIndex] = editingBlock;
    } else {
      newBlocks.push(editingBlock);
    }

    setFormData((prev) => ({
      ...prev,
      text_blocks: newBlocks,
    }));
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/partnership", {
        ...formData,
        text_blocks: JSON.stringify(formData.text_blocks),
      });

      toast.success("Данные сохранены", {
        description: "Информация о сотрудничестве успешно обновлена",
        richColors: true,
      });

      // Перенаправление после успешного сохранения
      setTimeout(() => {
        window.location.href = "/partnership";
      }, 1500);
    } catch (error) {
      toast.error("Ошибка при сохранении", {
        description:
          error.response?.data?.error ||
          "Не удалось сохранить информацию о сотрудничестве",
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
          Редактирование страницы "Сотрудничество"
        </h2>

        <div>
          <Label>Заголовок</Label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label>Блоки текста</Label>
          <div className="space-y-4">
            {formData.text_blocks.map((block, index) => (
              <div key={index} className="flex items-start gap-4">
                <Card className="flex-1">
                  <CardContent className="p-3">
                    <p
                      className={`line-clamp-3 ${
                        block.format_data?.bold ? "font-bold" : ""
                      }`}
                    >
                      {block.text || "Пустой блок"}
                    </p>
                  </CardContent>
                </Card>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveBlock(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditBlock(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={handleAddBlock} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Добавить блок текста
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBlockIndex !== null
                ? "Редактирование блока"
                : "Добавление блока"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={editingBlock.format_data?.bold ? "default" : "outline"}
                size="icon"
                onClick={toggleBold}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500">
                Нажмите для переключения жирного начертания
              </span>
            </div>

            <Textarea
              value={editingBlock.text}
              onChange={(e) =>
                setEditingBlock((prev) => ({
                  ...prev,
                  text: e.target.value,
                }))
              }
              className={`min-h-[200px] ${
                editingBlock.format_data?.bold ? "font-bold" : ""
              }`}
              placeholder="Введите текст блока..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleBlockSave}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPartnershipEdit;
