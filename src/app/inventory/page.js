import ItemCard from "@/components/inventory/ItemCard";
import ItemGrid from "@/components/inventory/ItemGrid";
import StatusPill from "@/components/inventory/StatusPill";

export default function InventoryPage() {
  return (
    <div className="p-8">
      <h1 className="mb-8 text-4xl font-bold">
        Inventory
      </h1>

      <ItemGrid>
        <ItemCard
          image="/sample/coke.jpg"
          name="Coca-Cola 1.5L"
          code="SKU-0001"
          description="Soft drink bottle"
          status={
            <StatusPill
              label="In Stock"
              color="green"
            />
          }
        />

        <ItemCard
          image="/sample/coffee.jpg"
          name="Coffee Beans"
          code="SKU-0002"
          description="Premium Arabica Coffee"
          status={
            <StatusPill
              label="Low Stock"
              color="yellow"
            />
          }
        />

        <ItemCard
          image="/sample/rice.jpg"
          name="Rice 25kg"
          code="SKU-0003"
          description="Premium Jasmine Rice"
          status={
            <StatusPill
              label="Out of Stock"
              color="red"
            />
          }
        />
      </ItemGrid>
    </div>
  );
}