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
import { Trash2, PlusCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5002/api",
});

const AdminFaqEdit = () => {
  const [formData, setFormData] = useState({
    title: "",
    description_blocks: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);
  const [editingBlock, setEditingBlock] = useState({
    subtitle: "",
    description: "",
    answers: [],
  });

  useEffect(() => {
    loadFaq();
  }, []);

  const loadFaq = async () => {
    try {
      const response = await api.get("/faqs");
      if (response.data) {
        setFormData({
          id: response.data.id,
          title: response.data.title,
          description_blocks: response.data.description_blocks || [],
        });
      }
    } catch (error) {
      toast.error("Ошибка загрузки данных", {
        description: "Не удалось загрузить информацию FAQ",
        richColors: true,
      });
      console.error("Error loading FAQ:", error);
    }
  };

  const handleAddBlock = () => {
    setEditingBlockIndex(null);
    setEditingBlock({
      subtitle: "",
      description: "",
      answers: [""],
    });
    setIsDialogOpen(true);
  };

  const handleEditBlock = (index) => {
    setEditingBlockIndex(index);
    setEditingBlock({
      ...formData.description_blocks[index],
    });
    setIsDialogOpen(true);
  };

  const handleRemoveBlock = (index) => {
    setFormData((prev) => ({
      ...prev,
      description_blocks: prev.description_blocks.filter((_, i) => i !== index),
    }));
  };

  const handleAddAnswer = () => {
    setEditingBlock((prev) => ({
      ...prev,
      answers: [...(prev.answers || []), ""],
    }));
  };

  const handleRemoveAnswer = (index) => {
    setEditingBlock((prev) => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index),
    }));
  };

  const handleAnswerChange = (index, value) => {
    setEditingBlock((prev) => ({
      ...prev,
      answers: prev.answers.map((answer, i) => (i === index ? value : answer)),
    }));
  };

  const handleBlockSave = () => {
    const newBlocks = [...formData.description_blocks];
    if (editingBlockIndex !== null) {
      newBlocks[editingBlockIndex] = editingBlock;
    } else {
      newBlocks.push(editingBlock);
    }

    setFormData((prev) => ({
      ...prev,
      description_blocks: newBlocks,
    }));
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/faqs", {
        ...formData,
        description_blocks: JSON.stringify(formData.description_blocks),
      });

      toast.success("FAQ обновлен", {
        description: "Информация FAQ успешно сохранена",
        richColors: true,
      });

      setTimeout(() => {
        window.location.href = "/admin/faq/edit";
      }, 1500);
    } catch (error) {
      toast.error("Ошибка сохранения", {
        description: error.response?.data?.error || "Не удалось сохранить FAQ",
        richColors: true,
      });
      console.error("Error saving FAQ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold">Редактирование страницы "Вопрос-ответ"</h2>
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
          <Label>Блоки FAQ</Label>
          <div className="space-y-4">
            {formData.description_blocks.map((block, index) => (
              <div key={index} className="flex items-start gap-4">
                <Card className="flex-1">
                  <CardContent className="p-4">
                    {block.subtitle && (
                      <h3 className="font-semibold mb-2">{block.subtitle}</h3>
                    )}
                    {block.description && (
                      <p className="text-gray-600 mb-4">{block.description}</p>
                    )}
                    {block.answers && block.answers.length > 0 && (
                      <div className="space-y-2">
                        {block.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="flex gap-2">
                            <span className="font-medium">
                              {answerIndex + 1}.
                            </span>
                            <p>{answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
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
              Добавить блок FAQ
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить FAQ"}
        </Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBlockIndex !== null
                ? "Редактирование блока FAQ"
                : "Добавление блока FAQ"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Подзаголовок</Label>
              <Input
                value={editingBlock.subtitle || ""}
                onChange={(e) =>
                  setEditingBlock((prev) => ({
                    ...prev,
                    subtitle: e.target.value,
                  }))
                }
                placeholder="Введите подзаголовок (опционально)"
              />
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea
                value={editingBlock.description || ""}
                onChange={(e) =>
                  setEditingBlock((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Введите описание (опционально)"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Ответы</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAnswer}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Добавить ответ
                </Button>
              </div>
              {editingBlock.answers?.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder={`Ответ ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveAnswer(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
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

export default AdminFaqEdit;