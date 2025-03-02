// src/components/delivery/AdminDeliveryEdit.jsx
import { useState, useEffect } from "react";
import { deliveryApi } from "@/api/delivery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const AdminDeliveryEdit = () => {
  const [formData, setFormData] = useState({
    id: null,
    subtitle: "",
    description: "",
    regions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const data = await deliveryApi.getDelivery();
        if (data) {
          setFormData({
            id: data.id,
            subtitle: data.subtitle || "",
            description: data.description || "",
            regions: data.regions || [],
          });
        }
      } catch (error) {
        toast.error("Ошибка загрузки данных", {
          description: "Не удалось загрузить информацию о доставке",
          richColors: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await deliveryApi.saveDelivery(formData);

      toast.success("Данные сохранены", {
        description: "Информация о доставке успешно обновлена",
        richColors: true,
      });
    } catch (error) {
      toast.error("Ошибка сохранения", {
        description: "Не удалось сохранить информацию о доставке",
        richColors: true,
      });
    }
  };

  const addRegion = () => {
    setFormData((prev) => ({
      ...prev,
      regions: [
        ...prev.regions,
        {
          id: Date.now(), // добавим уникальный id для каждого нового региона
          destinations: [
            {
              destination_service: "",
              services: [
                {
                  service_name: "",
                  service_cost: "",
                  service_period: "",
                },
              ],
            },
          ],
          note: "",
        },
      ],
    }));
  };

  // Удаление региона
  const removeRegion = (regionIndex) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.filter((_, index) => index !== regionIndex),
    }));
  };

  // Добавление направления в регион
  const addDestination = (regionIndex) => {
    const newRegions = [...formData.regions];
    newRegions[regionIndex].destinations.push({
      destination_service: "",
      services: [
        {
          service_name: "",
          service_cost: "",
          service_period: "",
        },
      ],
    });
    setFormData({ ...formData, regions: newRegions });
  };
  const updateDestination = (regionIndex, destIndex, value) => {
    setFormData((prev) => {
      const newRegions = prev.regions.map((region, rIndex) => {
        if (rIndex !== regionIndex) return region;

        const newDestinations = region.destinations.map((dest, dIndex) => {
          if (dIndex !== destIndex) return dest;
          return {
            ...dest,
            destination_service: value,
          };
        });

        return {
          ...region,
          destinations: newDestinations,
        };
      });

      return {
        ...prev,
        regions: newRegions,
      };
    });
  };
  // Удаление направления
  const removeDestination = (regionIndex, destIndex) => {
    const newRegions = [...formData.regions];
    newRegions[regionIndex].destinations = newRegions[
      regionIndex
    ].destinations.filter((_, index) => index !== destIndex);
    setFormData({ ...formData, regions: newRegions });
  };

  // Добавление сервиса в направление
  const addService = (regionIndex, destIndex) => {
    const newRegions = [...formData.regions];
    newRegions[regionIndex].destinations[destIndex].services.push({
      service_name: "",
      service_cost: "",
      service_period: "",
    });
    setFormData({ ...formData, regions: newRegions });
  };

  // Удаление сервиса
  const removeService = (regionIndex, destIndex, serviceIndex) => {
    const newRegions = [...formData.regions];
    newRegions[regionIndex].destinations[destIndex].services = newRegions[
      regionIndex
    ].destinations[destIndex].services.filter(
      (_, index) => index !== serviceIndex
    );
    setFormData({ ...formData, regions: newRegions });
  };

  // Обновление данных сервиса
  const updateService = (
    regionIndex,
    destIndex,
    serviceIndex,
    field,
    value
  ) => {
    const newRegions = [...formData.regions];
    newRegions[regionIndex].destinations[destIndex].services[serviceIndex][
      field
    ] = value;
    setFormData({ ...formData, regions: newRegions });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold">
          Редактирование страницы "Доставка"
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Подзаголовок</Label>
            <Textarea
              value={formData.subtitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label>Описание</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Label className="text-lg">Регионы доставки</Label>
            {formData.regions.length === 0 ? (
              <Button type="button" onClick={addRegion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Заполнить информацию
              </Button>
            ) : (
              <></>
            )}
          </div>

          {formData.regions.map((region, regionIndex) => (
            <Card key={regionIndex} className="relative">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => removeRegion(regionIndex)}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить все данные
                  </Button>
                </div>

                {region.destinations.map((dest, destIndex) => (
                  <div
                    key={destIndex}
                    className="space-y-4 pb-4 border-b last:border-0"
                  >
                    <div className="flex justify-between gap-8">
                      <Input
                        placeholder="Название региона"
                        value={dest.destination_service}
                        onChange={(e) =>
                          updateDestination(
                            regionIndex,
                            destIndex,
                            e.target.value
                          )
                        }
                        className="mb-4"
                      />
                      <Button
                        className="shrink-0"
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          removeDestination(regionIndex, destIndex)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {dest.services.map((service, serviceIndex) => (
                      <div
                        key={serviceIndex}
                        className="grid grid-cols-3 gap-4 items-start"
                      >
                        <Input
                          placeholder="Название службы"
                          value={service.service_name}
                          onChange={(e) =>
                            updateService(
                              regionIndex,
                              destIndex,
                              serviceIndex,
                              "service_name",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          placeholder="Стоимость"
                          value={service.service_cost}
                          onChange={(e) =>
                            updateService(
                              regionIndex,
                              destIndex,
                              serviceIndex,
                              "service_cost",
                              e.target.value
                            )
                          }
                        />
                        <div className="flex gap-8">
                          <Input
                            placeholder="Срок доставки"
                            value={service.service_period}
                            onChange={(e) =>
                              updateService(
                                regionIndex,
                                destIndex,
                                serviceIndex,
                                "service_period",
                                e.target.value
                              )
                            }
                          />
                          <Button
                            className="shrink-0"
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() =>
                              removeService(
                                regionIndex,
                                destIndex,
                                serviceIndex
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addService(regionIndex, destIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить службу доставки
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addDestination(regionIndex)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить регион
                </Button>

                <div>
                  <Label>Текст примечания (доп.информация)</Label>
                  <Textarea
                    value={region.note || ""}
                    onChange={(e) => {
                      const newRegions = [...formData.regions];
                      newRegions[regionIndex].note = e.target.value;
                      setFormData({ ...formData, regions: newRegions });
                    }}
                    placeholder="Дополнительная информация"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button type="submit" className="w-full">
          Сохранить
        </Button>
      </form>
    </div>
  );
};

export default AdminDeliveryEdit;
