import { InventoryCategory } from "@/lib/types";
import {
  Crosshair,
  CircleDot,
  Footprints,
  Bird,
  Volume2,
  Shirt,
  Eye,
  Shield,
  Heart,
  Truck,
  Package,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface CategoryIconProps {
  category: InventoryCategory;
  size?: number;
  color?: string;
}

export function CategoryIcon({ category, size = 24, color = Colors.darkText }: CategoryIconProps) {
  const props = { size, color };

  switch (category) {
    case "Firearm":
      return <Crosshair {...props} />;
    case "Ammo":
      return <CircleDot {...props} />;
    case "Waders":
      return <Footprints {...props} />;
    case "Decoy":
      return <Bird {...props} />;
    case "Call":
      return <Volume2 {...props} />;
    case "Clothing":
      return <Shirt {...props} />;
    case "Blind":
      return <Eye {...props} />;
    case "Safety":
      return <Shield {...props} />;
    case "Dog":
      return <Heart {...props} />;
    case "Vehicle":
      return <Truck {...props} />;
    case "Other":
      return <Package {...props} />;
    default:
      return <Package {...props} />;
  }
}
