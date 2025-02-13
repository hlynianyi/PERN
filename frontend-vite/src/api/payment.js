import { api } from "./route";

export const PaymentAPI = {
  async getPayment() {
    try {
      const { data } = await api.get("/payment");
      return data;
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
  },

  async updatePayment(paymentData) {
    try {
      const { data } = await api.post("/payment", paymentData);
      return data;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  },
};
