import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function CartButton() {

  const navigate = useNavigate();

  const handleNavigate = () => {
    return navigate('/cart')
  }

  return (
    <Button
      variant="outline"
      className="relative w-[40px] h-[40px] shadow-md shadow-primary/25

        border-0 border-border"
      onClick={handleNavigate}
    >
      <ShoppingCart className="h-[1.2rem] w-[1.2rem] " />
    </Button>
  );
}