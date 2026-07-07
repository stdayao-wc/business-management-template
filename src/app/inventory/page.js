import ItemCard from "@/components/inventory/ItemCard";
import ItemGrid from "@/components/inventory/ItemGrid";
import StatusPill from "@/components/inventory/StatusPill";

export default function InventoryPage() {
  return (
    <div>
      {/* Inventory Header */}
      <div
        className="
            rounded-xl
            bg-white
            px-10
            py-8
            shadow-sm
        "
        >
        <h1 className="text-4xl font-bold">
          Products
        </h1>

        <div className="mt-6 flex gap-4">
          <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
            All
          </button>

          <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
            Beverages
          </button>

          <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
            Food
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <ItemGrid>
        <ItemCard
          image="/sample/coke.jpg"
          name="Coca-Cola 1.5L"
          code="SKU-0001"
          description="Soft drink bottle"
          status={<StatusPill label="In Stock" color="green" />}
        />

        <ItemCard
          image="/sample/coffee.jpg"
          name="Coffee Beans"
          code="SKU-0002"
          description="Premium Arabica Coffee"
          status={<StatusPill label="Low Stock" color="yellow" />}
        />

        <ItemCard
          image="/sample/rice.jpg"
          name="Rice 25kg"
          code="SKU-0003"
          description="Premium Jasmine Rice"
          status={<StatusPill label="Out of Stock" color="red" />}
        />
        <ItemCard
          image="/sample/coke.jpg"
          name="Coca-Cola 1.5L"
          code="SKU-0001"
          description="Soft drink bottle"
          status={<StatusPill label="In Stock" color="green" />}
        />

        <ItemCard
          image="/sample/coffee.jpg"
          name="Coffee Beans"
          code="SKU-0002"
          description="Premium Arabica Coffee"
          status={<StatusPill label="Low Stock" color="yellow" />}
        />

        <ItemCard
          image="/sample/rice.jpg"
          name="Rice 25kg"
          code="SKU-0003"
          description="Premium Jasmine Rice"
          status={<StatusPill label="Out of Stock" color="red" />}
        />
        <ItemCard
          image="/sample/coke.jpg"
          name="Coca-Cola 1.5L"
          code="SKU-0001"
          description="Soft drink bottle"
          status={<StatusPill label="In Stock" color="green" />}
        />

        <ItemCard
          image="/sample/coffee.jpg"
          name="Coffee Beans"
          code="SKU-0002"
          description="Premium Arabica Coffee"
          status={<StatusPill label="Low Stock" color="yellow" />}
        />

        <ItemCard
          image="/sample/rice.jpg"
          name="Rice 25kg"
          code="SKU-0003"
          description="Premium Jasmine Rice"
          status={<StatusPill label="Out of Stock" color="red" />}
        />
      </ItemGrid>
    </div>
  );
}