import ItemCard from "@/components/inventory/ItemCard";
import ItemGrid from "@/components/inventory/ItemGrid";
import StatusPill from "@/components/inventory/StatusPill";

export default function InventoryPage() {
  return (
    <div className="space-y-10">
      {/* Inventory Header */}
      <div
        className="
      rounded-xl
      bg-white
      px-10
      py-8
      shadow-sm
      mb-10
    "
        >
        {/* <div> Add Padding Here so there is padding around these text elements */}
            <h1 className="text-4xl font-bold">
            Products
            </h1>

            <div className="mt-6 flex gap-4">
            <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
                All
            </button>

            <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
                Grass Cutters
            </button>

            <button className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300">
                Generators
            </button>
            </div>
        {/* </div> Add Padding Here so there is padding around these text elements */}
      </div>

      {/* Product Grid */}
      <ItemGrid>
        <ItemCard
          image="/images/items/Alen_Backpack_4_Stroke.png"
          name="Alen Backpack"
          code="SKU-0001"
          description="4 Stroke"
          status={<StatusPill label="In Stock" color="green" />}
        />

        <ItemCard
          image="/images/items/Fujima_NG-45_2_Stroke.png"
          name="Fujima NG-45"
          code="SKU-0002"
          description="2 Stroke"
          status={<StatusPill label="Low Stock" color="yellow" />}
        />

        <ItemCard
          image="/images/items/Hoyoma_Japan_CG411_2_Stroke.png"
          name="Hoyoma Japan CG411"
          code="SKU-0003"
          description="2 Stroke"
          status={<StatusPill label="Out of Stock" color="red" />}
        />
        <ItemCard
          image="/images/items/Hoyoma_Japan_GX35_4_Stroke.png"
          name="Hoyoma Japan GX35"
          code="SKU-0001"
          description="4 Stroke"
          status={<StatusPill label="In Stock" color="green" />}
        />

        <ItemCard
          image="/images/items/Kawasaki_Kaaz_TD40_2_Stroke.png"
          name="Kawasaki Kaaz TD40"
          code="SKU-0002"
          description="2 Stroke"
          status={<StatusPill label="Low Stock" color="yellow" />}
        />

        <ItemCard
          image="/images/items/Alen_Backpack_4_Stroke.png"
          name="Alen Backpack"
          code="SKU-0001"
          description="4 Stroke"
          status={<StatusPill label="In Stock" color="green" />}
        />

        <ItemCard
          image="/images/items/Fujima_NG-45_2_Stroke.png"
          name="Fujima NG-45"
          code="SKU-0002"
          description="2 Stroke"
          status={<StatusPill label="Low Stock" color="yellow" />}
        />

        <ItemCard
          image="/images/items/Hoyoma_Japan_CG411_2_Stroke.png"
          name="Hoyoma Japan CG411"
          code="SKU-0003"
          description="2 Stroke"
          status={<StatusPill label="Out of Stock" color="red" />}
        />
        <ItemCard
          image="/images/items/Hoyoma_Japan_GX35_4_Stroke.png"
          name="Hoyoma Japan GX35"
          code="SKU-0001"
          description="4 Stroke"
          status={<StatusPill label="In Stock" color="green" />}
        />

        <ItemCard
          image="/images/items/Kawasaki_Kaaz_TD40_2_Stroke.png"
          name="Kawasaki Kaaz TD40"
          code="SKU-0002"
          description="2 Stroke"
          status={<StatusPill label="Low Stock" color="yellow" />}
        />
      </ItemGrid>
    </div>
  );
}